import { NextResponse } from 'next/server';
import { createOrderSchema, orderHistoryQuerySchema } from '@/lib/validators/order';
import { processOrderCreation, getUserOrders } from '@/lib/order-service';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid order input data',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    const result = await processOrderCreation(parsed.data, user?.id);

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Authentication required to view order history.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const parsed = orderHistoryQuerySchema.safeParse({
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
      status: searchParams.get('status') || undefined,
    });

    const { limit, offset, status } = parsed.success
      ? parsed.data
      : { limit: 20, offset: 0, status: undefined };

    const result = await getUserOrders(user.id, limit, offset, status);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
