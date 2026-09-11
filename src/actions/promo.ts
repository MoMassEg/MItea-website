'use server';

import {
  validatePromoSchema,
  ValidatePromoInput,
  PromoValidationResult,
} from '@/lib/validators/promo';
import { checkPromoCode } from '@/lib/promo-service';

export async function validatePromo(
  input: ValidatePromoInput
): Promise<PromoValidationResult> {
  const parsed = validatePromoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      valid: false,
      reason: parsed.error.issues[0]?.message || 'Invalid promo code input',
    };
  }

  const { code, subtotal } = parsed.data;
  return checkPromoCode(code, subtotal);
}
