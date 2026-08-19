import { z } from 'zod';
import { isValidId } from './id.js';

export const ulidParamSchema = z.object({
  id: z.string().refine((val) => isValidId(val), { message: 'Invalid ULID format' }),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  status: z.string().optional(),
});

export const sortSchema = (allowedFields) =>
  z.object({
    sort: z
      .string()
      .refine((val) => allowedFields.includes(val), {
        message: `Sort field must be one of: ${allowedFields.join(', ')}`,
      })
      .optional()
      .default(allowedFields[0] || 'created_at'),
    order: z.enum(['asc', 'desc']).default('desc'),
  });

export const filterSchema = z.object({
  status: z.string().optional(),
  company_id: z.string().optional(),
  search: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

export { isValidId } from './id.js';
