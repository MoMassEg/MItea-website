import { z } from 'zod';

export const sendGiftCardSchema = z.object({
  senderName: z.string().min(1, 'Sender name is required').max(100),
  recipientName: z.string().min(1, 'Recipient name is required').max(100),
  recipientEmail: z.string().email('Valid recipient email is required'),
  recipientPhone: z.string().optional().nullable(),
  occasion: z.string().optional().default('Thinking of You 🧋'),
  message: z.string().max(500, 'Message cannot exceed 500 characters').optional(),
  amount: z
    .number()
    .min(5, 'Gift card amount must be at least $5.00')
    .max(500, 'Gift card amount cannot exceed $500.00'),
  deliveryType: z.enum(['EMAIL', 'SMS', 'INSTANT']).default('EMAIL'),
});

export const redeemGiftCardSchema = z.object({
  amount: z.number().positive('Redemption amount must be greater than 0'),
  orderId: z.string().optional(),
});

export const giftCardBalanceSchema = z.object({
  code: z.string().min(6, 'Gift card code is required'),
});

export type SendGiftCardInput = z.infer<typeof sendGiftCardSchema>;
export type RedeemGiftCardInput = z.infer<typeof redeemGiftCardSchema>;
