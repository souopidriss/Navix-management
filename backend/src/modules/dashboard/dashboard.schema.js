import { z } from 'zod';

const periodEnum = z.enum(['today', 'week', 'month', 'quarter', 'year', 'custom']);

export const dashboardQuerySchema = z.object({
  companyId: z.string().optional(),
  period: periodEnum.default('month'),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
