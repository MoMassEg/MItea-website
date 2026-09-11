import { z } from 'zod';

export const createOrderItemSchema = z.object({
  id: z.string().optional(),
  menuItemId: z.string().min(1, 'Menu item identifier is required'),
  name: z.string().optional(),
  size: z.string().default('Regular (16 oz)'),
  sugar: z.string().default('50%'),
  ice: z.string().default('Regular Ice'),
  toppings: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        price: z.number().optional(),
      })
    )
    .default([]),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').default(1),
  notes: z.string().optional(),
});

export const createOrderSchema = z.object({
  items: z.array(createOrderItemSchema).min(1, 'Order must contain at least one item'),
  orderType: z
    .enum(['pickup', 'delivery', 'PICKUP', 'DELIVERY'])
    .default('pickup')
    .transform((val) => val.toUpperCase() as 'PICKUP' | 'DELIVERY'),
  storeId: z.string().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid email address is required'),
  customerPhone: z.string().min(7, 'Valid phone number is required'),
  deliveryAddress: z
    .union([
      z.string(),
      z.object({
        full: z.string().optional(),
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
      }),
    ])
    .optional(),
  promoCode: z.string().optional(),
  tip: z.coerce.number().min(0).default(0),
  paymentMethod: z.string().default('card'),
  specialInstructions: z.string().optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().optional(),
});

export const orderHistoryQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
  status: z.string().optional(),
});

export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type OrderHistoryQueryParams = z.infer<typeof orderHistoryQuerySchema>;

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
