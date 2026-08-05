/**
 * Navix Notifications — Schémas de validation Zod
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate). Le module n'a pas de
 * formulaire métier ; le schéma ci-dessous normalise l'état de filtrage
 * (recherche + filtres + tri) utilisé par la page de notifications.
 */
import { z } from 'zod';
import {
  NOTIFICATION_TYPE_VALUES,
  NOTIFICATION_CATEGORY_VALUES,
  NOTIFICATION_SEVERITY_VALUES,
  NOTIFICATION_STATUS_VALUES,
  RESOURCE_TYPES,
} from '../constants';

export const notificationFiltersSchema = z.object({
  search: z.string().trim().max(120, 'Recherche trop longue.'),
  status: z
    .union([z.enum(NOTIFICATION_STATUS_VALUES), z.literal('')])
    .optional(),
  type: z.union([z.enum(NOTIFICATION_TYPE_VALUES), z.literal('')]).optional(),
  category: z
    .union([z.enum(NOTIFICATION_CATEGORY_VALUES), z.literal('')])
    .optional(),
  severity: z
    .union([z.enum(NOTIFICATION_SEVERITY_VALUES), z.literal('')])
    .optional(),
  resourceType: z
    .union([z.enum(RESOURCE_TYPES), z.literal('')])
    .optional(),
  companyId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  showUnread: z.boolean().optional(),
});

export const notificationFilterDefaultValues = {
  search: '',
  status: '',
  type: '',
  category: '',
  severity: '',
  resourceType: '',
  companyId: '',
  dateFrom: '',
  dateTo: '',
  showUnread: false,
};

/**
 * Normalise un état de filtres arbitraire en état valide (valeurs inconnues
 * retirées, défauts comblés). Protège le store contre les valeurs parasite.
 * @param {object} [values]
 * @returns {object}
 */
export const sanitizeNotificationFilters = (values = {}) => {
  const parsed = notificationFiltersSchema.safeParse({
    ...notificationFilterDefaultValues,
    ...values,
  });
  return parsed.success ? parsed.data : notificationFilterDefaultValues;
};
