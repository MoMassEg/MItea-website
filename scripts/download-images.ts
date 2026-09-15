import * as fs from 'fs';
import * as path from 'path';
import { MENU_DATA, MenuItem } from '../src/data/menu-data';

interface DownloadOptions {
  outputDir: string;
  concurrency: number;
  force: boolean;
  naming: 'id' | 'original';
}

// Parse command line arguments
function parseArgs(): DownloadOptions {
  const args = process.argv.slice(2);
  const options: DownloadOptions = {
    outputDir: path.join(process.cwd(), 'public', 'images', 'menu'),
    concurrency: 5,
    force: false,
    naming: 'id',
  };

  for (const arg of args) {
    if (arg.startsWith('--out=')) {
      options.outputDir = path.resolve(process.cwd(), arg.slice(6));
    } else if (arg.startsWith('--concurrency=')) {
      const c = parseInt(arg.slice(14), 10);
      if (!isNaN(c) && c > 0) options.concurrency = c;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg.startsWith('--naming=')) {
      const mode = arg.slice(9);
      if (mode === 'id' || mode === 'original') {
        options.naming = mode;
      }
    }
  }

  return options;
}

// Extract file extension and clean filename from URL
function getFileInfo(urlStr: string, item: MenuItem, naming: 'id' | 'original'): { filename: string; ext: string } {
  try {
    const urlObj = new URL(urlStr);
    const pathname = urlObj.pathname;
    const baseName = path.basename(pathname);
    const ext = path.extname(baseName) || '.jpeg';

    if (naming === 'original') {
      return { filename: baseName, ext };
    }
    // Clean id for filesystem safe filename
    const safeId = item.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    return { filename: `${safeId}${ext}`, ext };
  } catch {
    const safeId = item.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    return { filename: `${safeId}.jpeg`, ext: '.jpeg' };
  }
}

// Format bytes into readable format
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Download single file with retry logic
async function downloadFile(
  url: string,
  destPath: string,
  maxRetries = 3
): Promise<{ success: boolean; bytes: number; error?: string }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Write atomically via temp file to avoid corrupt partial files
      const tempPath = `${destPath}.tmp.${Date.now()}`;
      await fs.promises.writeFile(tempPath, buffer);
      await fs.promises.rename(tempPath, destPath);

      return { success: true, bytes: buffer.length };
    } catch (err: any) {
      if (attempt === maxRetries) {
        return { success: false, bytes: 0, error: err?.message || String(err) };
      }
      // Exponential backoff
      await new Promise((res) => setTimeout(res, 500 * attempt));
    }
  }

  return { success: false, bytes: 0, error: 'Max retries exceeded' };
}

async function main() {
  const options = parseArgs();

  console.log('====================================================');
  console.log('       MiTea Menu Image Downloader Script           ');
  console.log('====================================================');
  console.log(`📁 Destination directory : ${options.outputDir}`);
  console.log(`⚡ Concurrency           : ${options.concurrency}`);
  console.log(`🏷️  File naming format   : ${options.naming} (e.g. item-id.jpeg)`);
  console.log(`🔄 Force re-download     : ${options.force}`);
  console.log('----------------------------------------------------');

  if (!fs.existsSync(options.outputDir)) {
    fs.mkdirSync(options.outputDir, { recursive: true });
  }

  const items = MENU_DATA.items;
  console.log(`Found ${items.length} menu items to process.\n`);

  const results: {
    id: string;
    name: string;
    category: string;
    url: string;
    filename: string;
    localPath: string;
    status: 'downloaded' | 'skipped' | 'failed';
    bytes: number;
    error?: string;
  }[] = [];

  let completed = 0;
  let downloadedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  let totalBytes = 0;

  // Worker queue for controlled concurrency
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const currentIndex = index++;
      const item = items[currentIndex];
      const { filename } = getFileInfo(item.image, item, options.naming);
      const destPath = path.join(options.outputDir, filename);
      const relativeLocalPath = `/images/menu/${filename}`;

      const itemNum = `[${currentIndex + 1}/${items.length}]`;

      if (!options.force && fs.existsSync(destPath)) {
        const stats = fs.statSync(destPath);
        if (stats.size > 0) {
          skippedCount++;
          completed++;
          results.push({
            id: item.id,
            name: item.name,
            category: item.category,
            url: item.image,
            filename,
            localPath: relativeLocalPath,
            status: 'skipped',
            bytes: stats.size,
          });
          console.log(`${itemNum} ⏭️  Skipped (already exists): ${filename} (${formatBytes(stats.size)})`);
          continue;
        }
      }

      console.log(`${itemNum} ⬇️  Downloading: ${item.name} -> ${filename}...`);
      const res = await downloadFile(item.image, destPath);
      completed++;

      if (res.success) {
        downloadedCount++;
        totalBytes += res.bytes;
        results.push({
          id: item.id,
          name: item.name,
          category: item.category,
          url: item.image,
          filename,
          localPath: relativeLocalPath,
          status: 'downloaded',
          bytes: res.bytes,
        });
        console.log(`${itemNum} ✅ Success: ${filename} (${formatBytes(res.bytes)})`);
      } else {
        failedCount++;
        results.push({
          id: item.id,
          name: item.name,
          category: item.category,
          url: item.image,
          filename,
          localPath: relativeLocalPath,
          status: 'failed',
          bytes: 0,
          error: res.error,
        });
        console.error(`${itemNum} ❌ Failed: ${item.name} (${res.error})`);
      }
    }
  }

  const workers = Array.from({ length: Math.min(options.concurrency, items.length) }, () => worker());
  await Promise.all(workers);

  // Write a mapping file so frontend / database can easily reference downloaded images
  const mappingFilePath = path.join(options.outputDir, 'images-manifest.json');
  fs.writeFileSync(mappingFilePath, JSON.stringify(results, null, 2), 'utf-8');

  console.log('\n====================================================');
  console.log('               Download Complete!                   ');
  console.log('====================================================');
  console.log(`✅ Downloaded : ${downloadedCount}`);
  console.log(`⏭️  Skipped    : ${skippedCount}`);
  console.log(`❌ Failed     : ${failedCount}`);
  console.log(`📦 Total Size : ${formatBytes(totalBytes)}`);
  console.log(`📄 Manifest   : ${mappingFilePath}`);
  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('Fatal error running image download script:', err);
  process.exit(1);
});
