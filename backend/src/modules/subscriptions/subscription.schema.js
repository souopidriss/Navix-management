import { z } from 'zod';
import { SUBSCRIPTION_STATUSES, BILLING_INTERVALS } from './index.js';

export const createSubscriptionSchema = z.object({
  companyId: z.string().min(1, 'Entreprise requise.'),
  planId: z.string().min(1, 'Plan requis.'),
  billingInterval: z.enum(BILLING_INTERVALS, { errorMap: () => ({ message: 'Intervalle de facturation invalide.' }) }).default('monthly'),
});

export const subscriptionIdParamSchema = z.object({
  id: z.string().min(1, 'ID requis.'),
});

export const changePlanSchema = z.object({
  planId: z.string().min(1, 'Plan requis.'),
});

export const cancelSubscriptionSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const subscriptionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['created_at', 'updated_at', 'status', 'price']).default('created_at'),
  order: z.enum(['ASC', 'DESC']).default('DESC'),
  status: z.enum(SUBSCRIPTION_STATUSES).optional(),
  planId: z.string().optional(),
  billingInterval: z.enum(BILLING_INTERVALS).optional(),
  search: z.string().trim().max(200).optional(),
  companyScopeId: z.string().optional(),
});

export const planIdParamSchema = z.object({
  planId: z.string().min(1, 'Plan ID requis.'),
});

export const companyIdParamSchema = z.object({
  companyId: z.string().min(1, 'Company ID requis.'),
});

export const createPlanSchema = z.object({
  name: z.string().trim().min(1, 'Nom requis.').max(100),
  code: z.string().trim().min(1, 'Code requis.').max(50),
  displayName: z.string().trim().max(100).optional(),
  description: z.string().trim().max(500).optional(),
  priceMonthly: z.coerce.number().min(0).optional(),
  priceYearly: z.coerce.number().min(0).optional(),
  currency: z.string().trim().max(10).optional(),
  maxVehicles: z.coerce.number().int().min(0).optional(),
  maxDrivers: z.coerce.number().int().min(0).optional(),
  maxUsers: z.coerce.number().int().min(0).optional(),
  maxAgencies: z.coerce.number().int().min(0).optional(),
  maxDocuments: z.coerce.number().int().min(0).optional(),
  maxStorageGb: z.coerce.number().int().min(0).optional(),
  maxTripsPerMonth: z.coerce.number().int().min(0).optional(),
  maxFuelRecordsPerMonth: z.coerce.number().int().min(0).optional(),
  maxMaintenanceRecordsPerMonth: z.coerce.number().int().min(0).optional(),
  features: z.array(z.string()).optional(),
  trialDays: z.coerce.number().int().min(0).optional(),
  isPopular: z.coerce.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export const updatePlanSchema = createPlanSchema.partial();
