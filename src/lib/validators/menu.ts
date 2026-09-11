import { z } from 'zod';

export const menuQuerySchema = z.object({
  category: z.string().optional(),
  popular: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  available: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  q: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export type MenuQueryParams = z.infer<typeof menuQuerySchema>;
