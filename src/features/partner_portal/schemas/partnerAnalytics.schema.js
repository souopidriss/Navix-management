import { z } from 'zod';

export const partnerAnalyticsFilterSchema = z.object({
  period: z.enum([
    'all', 'today', 'last7', 'month', 'lastMonth', 'last3', 'last6', 'year', 'custom',
  ]).default('all'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export default partnerAnalyticsFilterSchema;
