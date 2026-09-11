import { z } from 'zod';

export const validateAddressSchema = z.object({
  address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(3, 'ZIP code is required'),
  storeId: z.string().optional(),
});

export type ValidateAddressInput = z.infer<typeof validateAddressSchema>;
