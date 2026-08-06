/**
 * Navix Reports — Schémas de validation Zod
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate). Couvre :
 *   - reportFilterSchema : filtres globaux des rapports (entreprise, agence,
 *     groupe véhicule, véhicule, chauffeur, statut, plan, période, dates)
 *   - dateRangeSchema    : borne temporelle (from/to ISO)
 *   - savedReportSchema  : enregistrement d'un rapport (nom, catégorie, …)
 *   - customReportSchema : constructeur de rapport personnalisé
 *   - reportConfigurationSchema : configuration figée d'un rapport
 */
import { z } from 'zod';
import {
  REPORT_TYPE_VALUES,
  REPORT_PERIOD_VALUES,
  REPORT_STATUS_VALUES,
  CUSTOM_REPORT_SOURCE_VALUES,
  PAGE_SIZE_OPTIONS,
} from '../constants';

/* --------------------------------------------------------------------------
   Filtres globaux d'un rapport
   -------------------------------------------------------------------------- */

export const reportFiltersSchema = z.object({
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
  period: z.union([z.enum(REPORT_PERIOD_VALUES), z.literal('')]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const reportFilterDefaultValues = {
  companyId: '',
  agencyId: '',
  vehicleGroup: '',
  vehicleId: '',
  driverId: '',
  status: '',
  planCode: '',
  tripType: '',
  maintenanceType: '',
  documentCategory: '',
  period: 'thisMonth',
  dateFrom: '',
  dateTo: '',
};

/** Normalise un état de filtres arbitraire en état valide. */
export const sanitizeReportFilters = (values = {}) => {
  const parsed = reportFiltersSchema.safeParse({
    ...reportFilterDefaultValues,
    ...values,
  });
  return parsed.success ? parsed.data : reportFilterDefaultValues;
};

/* --------------------------------------------------------------------------
   Borne temporelle
   -------------------------------------------------------------------------- */

export const dateRangeSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export const dateRangeDefaultValues = { from: '', to: '' };

export const sanitizeDateRange = (values = {}) => {
  const parsed = dateRangeSchema.safeParse({ ...dateRangeDefaultValues, ...values });
  return parsed.success ? parsed.data : dateRangeDefaultValues;
};

/* --------------------------------------------------------------------------
   Configuration d'un rapport (filtres + indicateurs figés)
   -------------------------------------------------------------------------- */

export const reportConfigurationSchema = z.object({
  period: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  groupBy: z.string().optional(),
  indicators: z.array(z.string()).optional(),
  filters: reportFiltersSchema.optional(),
});

export const sanitizeReportConfiguration = (values = {}) => {
  const parsed = reportConfigurationSchema.safeParse(values);
  return parsed.success ? parsed.data : {};
};

/* --------------------------------------------------------------------------
   Rapport enregistré
   -------------------------------------------------------------------------- */

export const savedReportSchema = z.object({
  name: z.string().trim().min(3, 'Le nom doit contenir au moins 3 caractères.').max(80, 'Nom trop long.'),
  description: z.string().trim().max(240, 'Description trop longue.').optional(),
  reportType: z.enum(REPORT_TYPE_VALUES, {
    errorMap: () => ({ message: 'Catégorie de rapport requise.' }),
  }),
  status: z.enum(REPORT_STATUS_VALUES).default('draft'),
  configuration: reportConfigurationSchema,
});

export const savedReportDefaultValues = {
  name: '',
  description: '',
  reportType: 'fuel',
  status: 'draft',
  configuration: {},
};

/* --------------------------------------------------------------------------
   Rapport personnalisé (constructeur)
   -------------------------------------------------------------------------- */

export const customReportSchema = z.object({
  source: z.enum(CUSTOM_REPORT_SOURCE_VALUES, {
    errorMap: () => ({ message: 'Source requise.' }),
  }),
  name: z.string().trim().min(3, 'Le nom doit contenir au moins 3 caractères.').max(80, 'Nom trop long.'),
  description: z.string().trim().max(240, 'Description trop longue.').optional(),
  groupBy: z.string().optional(),
  indicators: z.array(z.string()).min(1, 'Sélectionnez au moins un indicateur.'),
  period: z.union([z.enum(REPORT_PERIOD_VALUES), z.literal('')]).default('thisMonth'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const customReportDefaultValues = {
  source: 'fleet',
  name: '',
  description: '',
  groupBy: '',
  indicators: [],
  period: 'thisMonth',
  dateFrom: '',
  dateTo: '',
};

export const sanitizeCustomReport = (values = {}) => {
  const parsed = customReportSchema.safeParse({ ...customReportDefaultValues, ...values });
  return parsed.success ? parsed.data : customReportDefaultValues;
};

/* --------------------------------------------------------------------------
   Tri, pagination
   -------------------------------------------------------------------------- */

export const reportPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z
    .number()
    .int()
    .refine((value) => PAGE_SIZE_OPTIONS.includes(value), { message: 'Taille de page invalide.' })
    .default(10),
});

export const sanitizeReportPagination = (values = {}) => {
  const parsed = reportPaginationSchema.safeParse(values);
  return parsed.success ? parsed.data : { page: 1, pageSize: PAGE_SIZE_OPTIONS[1] };
};
