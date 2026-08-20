import { z } from 'zod';
import { EXPORT_FORMATS, REPORT_EXPORT_COLUMNS } from './index.js';

const EXPORT_SOURCES = Object.keys(REPORT_EXPORT_COLUMNS);

export const exportQuerySchema = z.object({
  format: z.enum(EXPORT_FORMATS).default('csv'),
  companyId: z.string().optional(),
  period: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  agencyId: z.string().optional(),
  vehicleGroup: z.string().optional(),
  vehicleId: z.string().optional(),
  driverId: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['ASC', 'DESC']).optional(),
});

export const exportSourceParamSchema = z.object({
  source: z.enum(EXPORT_SOURCES, {
    errorMap: () => ({ message: `Source invalide. Sources autorisées: ${EXPORT_SOURCES.join(', ')}` }),
  }),
});

export const exportReportBodySchema = z.object({
  format: z.enum(EXPORT_FORMATS).default('csv'),
  reportType: z.string().optional(),
  filters: z.record(z.unknown()).optional(),
});

export const exportAuditBodySchema = z.object({
  format: z.enum(EXPORT_FORMATS).default('csv'),
  filters: z.record(z.unknown()).optional(),
});
