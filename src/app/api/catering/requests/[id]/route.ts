import { NextResponse } from 'next/server';
import { getCateringRequest } from '@/lib/catering-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cateringRequest = await getCateringRequest(id);

    if (!cateringRequest) {
      return NextResponse.json(
        { error: `Catering request '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ request: cateringRequest });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve catering request' },
      { status: 500 }
    );
  }
}
