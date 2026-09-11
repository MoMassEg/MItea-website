import { z } from 'zod';

export const validatePromoSchema = z.object({
  code: z
    .string()
    .min(1, 'Promo code is required')
    .transform((val) => val.trim().toUpperCase()),
  subtotal: z.coerce.number().min(0).default(0),
});

export type ValidatePromoInput = z.infer<typeof validatePromoSchema>;

export interface PromoValidationSuccess {
  valid: true;
  code: string;
  discountPercent: number;
  freeDelivery: boolean;
  description: string;
  discountAmount: number;
  promoCodeId?: string;
}

export interface PromoValidationFailure {
  valid: false;
  code?: string;
  reason: string;
}

export type PromoValidationResult = PromoValidationSuccess | PromoValidationFailure;
