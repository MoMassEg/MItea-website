'use server';

import { createOrderSchema, CreateOrderInput, cancelOrderSchema } from '@/lib/validators/order';
import { processOrderCreation, cancelOrder } from '@/lib/order-service';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function createOrder(input: CreateOrderInput) {
  try {
    const validated = createOrderSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || 'Invalid order parameters',
      };
    }

    const user = await getCurrentUser();
    const result = await processOrderCreation(validated.data, user?.id);

    return {
      success: true,
      order: result,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to create order',
    };
  }
}

export async function cancelOrderAction(orderId: string, reason?: string) {
  try {
    const validated = cancelOrderSchema.safeParse({ reason });
    if (!validated.success) {
      return {
        success: false,
        error: 'Invalid cancellation input',
      };
    }

    const result = await cancelOrder(orderId, validated.data.reason);
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      order: result.order,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to cancel order',
    };
  }
}
