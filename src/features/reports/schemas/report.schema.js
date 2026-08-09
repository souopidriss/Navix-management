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

/* --------------------------------------------------------------------------
   Contrat de rapport (validation des réponses — compatibilité API Express)
   -------------------------------------------------------------------------- */

export const reportStatisticSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  raw: z.number().nullable().optional(),
  format: z
    .enum(['money', 'number', 'percent', 'distance', 'duration', 'date', 'datetime'])
    .optional(),
  icon: z.string().optional(),
  variant: z.string().optional(),
  variation: z.number().nullable().optional(),
  trend: z.enum(['up', 'down', 'neutral']).optional(),
});

export const reportSeriesDatasetSchema = z.object({
  key: z.string(),
  label: z.string().optional(),
  values: z.array(z.number()).default([]),
  variant: z.string().optional(),
});

export const reportSeriesSchema = z.object({
  labels: z.array(z.string()).default([]),
  datasets: z.array(reportSeriesDatasetSchema).default([]),
});

export const reportBreakdownSchema = z.object({
  labels: z.array(z.string()).default([]),
  values: z.array(z.number()).default([]),
  variants: z.array(z.string()).default([]),
});

export const reportTopItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number(),
  sublabel: z.string().optional(),
});

export const reportRowSchema = z.record(z.unknown());

export const reportBaseSchema = z.object({
  reportType: z.string(),
  period: dateRangeSchema,
  statistics: z.array(reportStatisticSchema).default([]),
  series: reportSeriesSchema,
  breakdown: reportBreakdownSchema,
  top: z.array(reportTopItemSchema).default([]),
  rows: z.array(reportRowSchema).default([]),
  summary: z.record(z.unknown()).default({}),
  meta: z.record(z.unknown()).optional(),
  periodLabel: z.string().optional(),
  comparison: z
    .object({
      current: dateRangeSchema,
      previous: dateRangeSchema,
    })
    .optional(),
});

/* --------------------------------------------------------------------------
   Lignes typées par rapport
   -------------------------------------------------------------------------- */

export const fleetReportRowSchema = z.object({
  id: z.string(),
  registrationNumber: z.string(),
  vehicle: z.string(),
  group: z.string(),
  groupLabel: z.string(),
  status: z.string(),
  statusLabel: z.string(),
  mileage: z.number(),
  fuelType: z.string(),
  agency: z.string().optional(),
  companyName: z.string(),
});

export const vehicleReportRowSchema = z.object({
  id: z.string(),
  registrationNumber: z.string(),
  vehicle: z.string(),
  group: z.string(),
  groupLabel: z.string(),
  status: z.string(),
  statusLabel: z.string(),
  mileage: z.number(),
  fuelCost: z.number(),
  maintenanceCost: z.number(),
  tripCount: z.number(),
  tripDistance: z.number(),
  companyName: z.string(),
});

export const driverReportRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  licenseCategory: z.string().optional(),
  availability: z.string().optional(),
  companyName: z.string(),
  tripCount: z.number(),
  distance: z.number(),
  duration: z.number(),
  fuelRecords: z.number(),
  fuelCost: z.number(),
});

export const assignmentReportRowSchema = z.object({
  id: z.string(),
  assignmentNumber: z.string(),
  assignmentType: z.string(),
  status: z.string(),
  startDate: z.string(),
  expectedEndDate: z.string(),
  endDate: z.string().optional(),
  vehicle: z.string(),
  driver: z.string(),
  companyName: z.string(),
  startMileage: z.number().optional(),
  endMileage: z.number().optional(),
});

export const tripReportRowSchema = z.object({
  id: z.string(),
  tripNumber: z.string(),
  tripType: z.string(),
  purpose: z.string().optional(),
  status: z.string(),
  departureDate: z.string(),
  departure: z.string().optional(),
  arrival: z.string().optional(),
  distance: z.number(),
  duration: z.number(),
  vehicle: z.string(),
  driver: z.string(),
  companyName: z.string(),
});

export const fuelReportRowSchema = z.object({
  id: z.string(),
  fuelNumber: z.string(),
  vehicle: z.string(),
  driver: z.string(),
  fuelType: z.string(),
  status: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  totalCost: z.number(),
  consumptionAverage: z.number(),
  station: z.string().optional(),
  city: z.string().optional(),
  createdAt: z.string(),
  companyName: z.string(),
});

export const maintenanceReportRowSchema = z.object({
  id: z.string(),
  maintenanceNumber: z.string(),
  maintenanceType: z.string(),
  priority: z.string(),
  status: z.string(),
  scheduledDate: z.string(),
  completedAt: z.string().optional(),
  estimatedCost: z.number(),
  actualCost: z.number(),
  workshop: z.string().optional(),
  vehicle: z.string(),
  companyName: z.string(),
});

export const documentReportRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  extension: z.string().optional(),
  size: z.number().optional(),
  visibility: z.string().optional(),
  associationType: z.string().optional(),
  uploadedBy: z.string().optional(),
  createdAt: z.string(),
  vehicle: z.string(),
  companyName: z.string(),
});

export const companyReportRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  status: z.string(),
  subscriptionPlan: z.string().optional(),
  subscriptionStatus: z.string().optional(),
  vehicleCount: z.number().optional(),
  driverCount: z.number().optional(),
  agencyCount: z.number().optional(),
  ownerName: z.string().optional(),
  planLabel: z.string().optional(),
  createdAt: z.string().optional(),
});

/* --------------------------------------------------------------------------
   Schémas par type de rapport (rapports réellement présents dans le module)
   -------------------------------------------------------------------------- */

export const fleetReportSchema = reportBaseSchema.extend({
  reportType: z.literal('fleet'),
  rows: z.array(fleetReportRowSchema).default([]),
  summary: z.object({ count: z.number() }).default({}),
});

export const vehicleReportSchema = reportBaseSchema.extend({
  reportType: z.literal('vehicles'),
  rows: z.array(vehicleReportRowSchema).default([]),
  summary: z.object({ count: z.number(), tripCount: z.number() }).default({}),
});

export const driverReportSchema = reportBaseSchema.extend({
  reportType: z.literal('drivers'),
  rows: z.array(driverReportRowSchema).default([]),
  summary: z.object({ count: z.number(), tripCount: z.number() }).default({}),
});

export const assignmentReportSchema = reportBaseSchema.extend({
  reportType: z.literal('assignments'),
  rows: z.array(assignmentReportRowSchema).default([]),
  summary: z.object({ count: z.number() }).default({}),
});

export const tripReportSchema = reportBaseSchema.extend({
  reportType: z.literal('trips'),
  rows: z.array(tripReportRowSchema).default([]),
  summary: z.object({ count: z.number() }).default({}),
});

export const fuelReportSchema = reportBaseSchema.extend({
  reportType: z.literal('fuel'),
  rows: z.array(fuelReportRowSchema).default([]),
  summary: z.object({ count: z.number(), totalCost: z.number() }).default({}),
});

export const maintenanceReportSchema = reportBaseSchema.extend({
  reportType: z.literal('maintenance'),
  rows: z.array(maintenanceReportRowSchema).default([]),
  summary: z.object({ count: z.number(), actualCost: z.number() }).default({}),
});

export const documentReportSchema = reportBaseSchema.extend({
  reportType: z.literal('documents'),
  rows: z.array(documentReportRowSchema).default([]),
  summary: z.object({ count: z.number() }).default({}),
});

export const financialReportSchema = reportBaseSchema.extend({
  reportType: z.literal('financial'),
});

export const subscriptionReportSchema = reportBaseSchema.extend({
  reportType: z.literal('subscriptions'),
});

export const auditReportSchema = reportBaseSchema.extend({
  reportType: z.literal('audit'),
});

export const companyReportSchema = reportBaseSchema.extend({
  reportType: z.literal('companies'),
  rows: z.array(companyReportRowSchema).default([]),
  summary: z.object({ count: z.number(), totalVehicles: z.number() }).default({}),
});

export const customReportResultSchema = reportBaseSchema.extend({
  reportType: z.literal('custom'),
});

export const dashboardMetricsSchema = reportBaseSchema.extend({
  reportType: z.literal('overview'),
  statusBreakdown: reportBreakdownSchema.optional(),
});

/** Catalogue des schémas par catégorie de rapport (reportType → schéma). */
export const REPORT_SCHEMAS = {
  fleet: fleetReportSchema,
  vehicles: vehicleReportSchema,
  drivers: driverReportSchema,
  assignments: assignmentReportSchema,
  trips: tripReportSchema,
  fuel: fuelReportSchema,
  maintenance: maintenanceReportSchema,
  documents: documentReportSchema,
  financial: financialReportSchema,
  subscriptions: subscriptionReportSchema,
  audit: auditReportSchema,
  companies: companyReportSchema,
  custom: customReportResultSchema,
  overview: dashboardMetricsSchema,
};

export const getReportSchema = (reportType) => REPORT_SCHEMAS[reportType] ?? null;

/** Valide une réponse de rapport avec son schéma typé (repli sûr sur la donnée brute). */
export const sanitizeReport = (report = {}, schema = reportBaseSchema) => {
  const parsed = (schema || reportBaseSchema).safeParse(report);
  return parsed.success ? parsed.data : report;
};
