import { NextResponse } from 'next/server';
import { getCateringPackages } from '@/lib/catering-service';

export async function GET() {
  try {
    const packages = await getCateringPackages();
    return NextResponse.json({ packages });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch catering packages' },
      { status: 500 }
    );
  }
}
