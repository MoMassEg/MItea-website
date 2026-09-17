import { z } from 'zod';

// ─── Shared sub-schemas ────────────────────────────────────────────────────────

export const CateringDrinkSelectionSchema = z.object({
  itemId: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().min(1),
  sugar: z.string().optional(),
  milk: z.string().optional(),
  unitPrice: z.number().min(0),
  format: z.enum(['cups', 'jugs']).default('cups'),
});

export const CateringToppingSelectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
});

export const CateringBakerySelectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
});

export const CateringPackageSelectionSchema = z.object({
  packageId: z.string().optional(),
  id: z.string().optional(),
  name: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
}).transform((data) => ({
  ...data,
  packageId: data.packageId || data.id || "package",
}));

// ─── Request mode schemas ──────────────────────────────────────────────────────

export const CustomBuilderModeSchema = z.object({
  mode: z.literal('custom'),
  drinks: z.array(CateringDrinkSelectionSchema).optional().default([]),
  toppings: z.array(CateringToppingSelectionSchema).optional().default([]),
  bakery: z.array(CateringBakerySelectionSchema).optional().default([]),
  packages: z.array(CateringPackageSelectionSchema).optional().default([]),
  formatType: z.enum(['cups', 'jugs']).default('cups'),
}).refine(
  (data) => data.drinks.length + data.bakery.length + data.packages.length > 0,
  'At least one drink, bakery item, or package is required'
);

export const PackageModeSchema = z.object({
  mode: z.literal('packages'),
  packages: z.array(CateringPackageSelectionSchema).min(1, 'At least one package is required'),
});

// ─── Main submit schema ────────────────────────────────────────────────────────

export const SubmitCateringRequestSchema = z.object({
  // Which builder tab
  orderDetails: z.discriminatedUnion('mode', [CustomBuilderModeSchema, PackageModeSchema]),

  // Event info
  eventType: z.string().min(1, 'Event type is required'),
  guestCount: z.union([z.string(), z.number()]).transform((v) => String(v)),
  eventDate: z.string().min(1, 'Event date is required'),
  eventTime: z.string().optional(),
  serviceStyle: z.string().min(1).default('delivery'),

  // Contact
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type SubmitCateringRequestInput = z.infer<typeof SubmitCateringRequestSchema>;
export type CateringDrinkSelection = z.infer<typeof CateringDrinkSelectionSchema>;
export type CateringToppingSelection = z.infer<typeof CateringToppingSelectionSchema>;
export type CateringBakerySelection = z.infer<typeof CateringBakerySelectionSchema>;
export type CateringPackageSelection = z.infer<typeof CateringPackageSelectionSchema>;
