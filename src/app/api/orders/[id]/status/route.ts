import { NextResponse } from 'next/server';
import { requireAdmin, AuthError, ForbiddenError } from '@/lib/auth-helpers';
import { updateOrderStatus, getOrderById } from '@/lib/order-service';
import { z } from 'zod';

const orderStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'READY_FOR_PICKUP',
  'OUT_FOR_DELIVERY',
  'COMPLETED',
  'CANCELLED',
]);

const updateStatusBodySchema = z.object({
  status: orderStatusSchema,
  paymentStatus: z.enum(['UNPAID', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = updateStatusBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid status update payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { status, paymentStatus } = parsed.data;

    const existing = await getOrderById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updated = await updateOrderStatus(id, status, paymentStatus);

    return NextResponse.json({
      success: true,
      order: updated,
    });
  } catch (error: any) {
    console.error('[AdminOrderStatus] Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status', details: error?.message },
      { status: 500 }
    );
  }
}
