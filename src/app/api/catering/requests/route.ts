import { NextResponse } from 'next/server';
import { SubmitCateringRequestSchema } from '@/lib/validators/catering';
import { createCateringRequest, getUserCateringRequests } from '@/lib/catering-service';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = SubmitCateringRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid catering request data',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    const result = await createCateringRequest(parsed.data, user?.id);

    return NextResponse.json(
      {
        success: true,
        request: result,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to submit catering request' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Authentication required to view catering requests.' },
        { status: 401 }
      );
    }

    const requests = await getUserCateringRequests(user.id);
    return NextResponse.json({ requests });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch catering requests' },
      { status: 500 }
    );
  }
}
