/**
 * Navix Audit — Schémas de validation Zod
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate). Le module n'a pas de
 * formulaire métier ; le schéma ci-dessous normalise l'état de filtrage
 * (recherche + filtres + tri + pagination) utilisé par la page du journal.
 *
 * Les logs étant immuables, aucun schéma de création/modification n'est exposé.
 */
import { z } from 'zod';
import {
  AUDIT_ACTION_VALUES,
  AUDIT_ACTION_TYPE_VALUES,
  AUDIT_RESOURCE_VALUES,
  AUDIT_STATUS_VALUES,
  AUDIT_SEVERITY_VALUES,
  AUDIT_PERIOD_VALUES,
  PAGE_SIZE_OPTIONS,
} from '../constants';

export const auditFiltersSchema = z.object({
  search: z.string().trim().max(120, 'Recherche trop longue.'),
  companyId: z.string().optional(),
  agencyId: z.string().optional(),
  userId: z.string().optional(),
  action: z
    .union([z.enum(AUDIT_ACTION_VALUES), z.literal('')])
    .optional(),
  actionType: z
    .union([z.enum(AUDIT_ACTION_TYPE_VALUES), z.literal('')])
    .optional(),
  resourceType: z
    .union([z.enum(AUDIT_RESOURCE_VALUES), z.literal('')])
    .optional(),
  status: z
    .union([z.enum(AUDIT_STATUS_VALUES), z.literal('')])
    .optional(),
  severity: z
    .union([z.enum(AUDIT_SEVERITY_VALUES), z.literal('')])
    .optional(),
  period: z
    .union([z.enum(AUDIT_PERIOD_VALUES), z.literal('')])
    .optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const auditFilterDefaultValues = {
  search: '',
  companyId: '',
  agencyId: '',
  userId: '',
  action: '',
  actionType: '',
  resourceType: '',
  status: '',
  severity: '',
  period: '',
  dateFrom: '',
  dateTo: '',
};

export const auditSortSchema = z.object({
  by: z
    .enum(['createdAt', 'userName', 'action', 'resourceType', 'companyName', 'severity', 'status'])
    .default('createdAt'),
  direction: z.enum(['asc', 'desc']).default('desc'),
});

export const auditPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z
    .number()
    .int()
    .refine((value) => PAGE_SIZE_OPTIONS.includes(value), {
      message: 'Taille de page invalide.',
    })
    .default(10),
});

/**
 * Normalise un état de filtres arbitraire en état valide (valeurs inconnues
 * retirées, défauts comblés). Protège le store contre les valeurs parasite.
 * @param {object} [values]
 * @returns {object}
 */
export const sanitizeAuditFilters = (values = {}) => {
  const parsed = auditFiltersSchema.safeParse({
    ...auditFilterDefaultValues,
    ...values,
  });
  return parsed.success ? parsed.data : auditFilterDefaultValues;
};
