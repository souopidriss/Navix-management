import { z } from 'zod';
import { REPORT_TYPES, REPORT_PERIODS, REPORT_STATUSES, CUSTOM_REPORT_SOURCES } from './index.js';

export const reportFilterSchema = z.object({
  companyId: z.string().optional(),
  agencyId: z.string().optional(),
  vehicleGroup: z.string().optional(),
  vehicleId: z.string().optional(),
  driverId: z.string().optional(),
  status: z.string().optional(),
  planCode: z.string().optional(),
  tripType: z.string().optional(),
  maintenanceType: z.string().optional(),
  documentCategory: z.string().optional(),
  period: z.enum(REPORT_PERIODS.filter(Boolean)).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const reportQuerySchema = z.object({
  period: z.enum(REPORT_PERIODS.filter(Boolean)).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  companyId: z.string().optional(),
  agencyId: z.string().optional(),
  vehicleGroup: z.string().optional(),
  vehicleId: z.string().optional(),
  driverId: z.string().optional(),
  status: z.string().optional(),
  planCode: z.string().optional(),
  tripType: z.string().optional(),
  maintenanceType: z.string().optional(),
  documentCategory: z.string().optional(),
});

export const customReportSchema = z.object({
  source: z.enum(CUSTOM_REPORT_SOURCES, { errorMap: () => ({ message: 'Source requise.' }) }),
  indicators: z.array(z.string()).min(1, 'Sélectionnez au moins un indicateur.').max(10),
  period: z.enum(REPORT_PERIODS.filter(Boolean)).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  filters: reportFilterSchema.optional(),
});

export const savedReportSchema = z.object({
  name: z.string().trim().min(3, 'Le nom doit contenir au moins 3 caractères.').max(80, 'Nom trop long.'),
  description: z.string().trim().max(240, 'Description trop longue.').optional(),
  reportType: z.enum(REPORT_TYPES, { errorMap: () => ({ message: 'Catégorie de rapport requise.' }) }),
  status: z.enum(REPORT_STATUSES).default('draft'),
  configuration: z.record(z.unknown()).optional(),
});

export const savedReportUpdateSchema = savedReportSchema.partial();

export const savedReportIdParamSchema = z.object({
  id: z.string().min(1, 'ID requis.'),
});

export const savedReportQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  reportType: z.string().optional(),
  status: z.string().optional(),
  search: z.string().trim().max(200).optional(),
});

export const exportReportSchema = z.object({
  format: z.enum(['csv', 'json', 'xlsx', 'pdf']).default('csv'),
  reportType: z.string().optional(),
  filters: reportFilterSchema.optional(),
});
