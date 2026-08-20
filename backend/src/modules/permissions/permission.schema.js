import { z } from 'zod';

export const permissionQuerySchema = z.object({
  module: z.string().max(100).optional(),
  isSensitive: z.coerce.boolean().optional(),
});
