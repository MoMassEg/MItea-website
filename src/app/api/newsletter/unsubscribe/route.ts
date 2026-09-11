import { NextResponse } from 'next/server';
import { unsubscribeFromNewsletter } from '@/lib/newsletter-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Unsubscribe token is required' },
      { status: 400 }
    );
  }

  const result = await unsubscribeFromNewsletter(token);

  // Check if browser requested HTML
  const acceptHeader = request.headers.get('accept') || '';
  if (acceptHeader.includes('text/html')) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Unsubscribed — MiTea</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F7F4EE; color: #2D1B0E; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #ffffff; max-width: 480px; width: 100%; padding: 40px 30px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); text-align: center; border: 1px solid #EAE3D2; }
    h2 { font-size: 24px; margin: 16px 0 8px; color: #1B3C27; }
    p { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 24px; }
    a { display: inline-block; background: #DF9749; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 50px; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 40px">🍵</div>
    <h2>Preferences Updated</h2>
    <p>You have been unsubscribed from The Tea Guild email announcements. You can rejoin anytime on our website!</p>
    <a href="/">Back to MiTea Home</a>
  </div>
</body>
</html>`;
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  return NextResponse.json(result);
}
