import { z } from 'zod';

export const createMenuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  chineseName: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be greater than 0'),
  description: z.string().optional().default(''),
  image: z.string().optional().default('/images/drinks/classic-milk-tea.webp'),
  popular: z.boolean().optional().default(false),
  badge: z.string().optional().default(''),
  caffeine: z.string().optional().default('Medium'),
  calories: z.string().optional().default('220 kcal'),
  available: z.boolean().optional().default(true),
  customizable: z.boolean().optional().default(true),
});

export const updateMenuItemSchema = z.object({
  id: z.string().min(1, 'Menu item ID is required'),
  name: z.string().min(1).optional(),
  chineseName: z.string().optional(),
  category: z.string().optional(),
  price: z.number().positive().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  popular: z.boolean().optional(),
  badge: z.string().optional(),
  caffeine: z.string().optional(),
  calories: z.string().optional(),
  available: z.boolean().optional(),
  customizable: z.boolean().optional(),
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
