import { z } from 'zod';

export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Enter a valid price'),
  compareAtPrice: z
    .union([z.literal(''), z.coerce.number().min(0)])
    .optional()
    .transform((v) =>
      v === '' || v === undefined ? undefined : Number(v),
    ),
  stock: z.coerce.number().int().min(0, 'Enter a valid stock quantity'),
  categoryId: z.coerce.number().int().positive('Select a category'),
  imageUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(80),
});

export const customerFormSchema = z.object({
  name: z.string().trim().optional(),
  email: z.string().trim().min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;
