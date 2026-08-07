/**
 * Navix Notifications — Schémas de validation Zod
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate). Trois familles :
 *   - notificationSchema               : entité Notification
 *   - notificationPreferenceSchema     : préférences de notification (canaux
 *     inApp / email / push / sms + types d'événements) — source unique de
 *     vérité côté Settings (section `notifications`)
 *   - notificationFiltersSchema        : état de filtrage de la page
 *     (recherche + filtres + tri + preset de période)
 */
import { z } from 'zod';
import {
  NOTIFICATION_TYPE_VALUES,
  NOTIFICATION_CATEGORY_VALUES,
  NOTIFICATION_SEVERITY_VALUES,
  NOTIFICATION_STATUS_VALUES,
  RESOURCE_TYPES,
} from '../constants';

/* --------------------------------------------------------------------------
   Entité Notification
   -------------------------------------------------------------------------- */

export const notificationSchema = z.object({
  id: z.string().min(1, 'Identifiant requis.'),
  companyId: z.string().min(1, 'Entreprise requise.'),
  userId: z.string().nullable().optional(),
  kind: z.string().trim().min(1, 'Scénario requis.'),
  type: z.enum(NOTIFICATION_TYPE_VALUES),
  category: z.enum(NOTIFICATION_CATEGORY_VALUES),
  severity: z.enum(NOTIFICATION_SEVERITY_VALUES),
  title: z.string().trim().min(1, 'Le titre est requis.').max(160, 'Titre trop long.'),
  message: z.string().trim().max(500, 'Message trop long.'),
  status: z.enum(NOTIFICATION_STATUS_VALUES),
  isRead: z.boolean(),
  readAt: z.string().nullable().optional(),
  resourceType: z
    .union([z.enum(RESOURCE_TYPES), z.string().max(40), z.literal('')])
    .nullable()
    .optional(),
  resourceId: z.string().nullable().optional(),
  createdAt: z.string(),
  expiresAt: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/** Normalise une notification en entité valide (ou null si invalide). */
export const sanitizeNotification = (value = {}) => {
  const parsed = notificationSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
};

/* --------------------------------------------------------------------------
   Préférences de notification (canaux + types d'événements)
   -------------------------------------------------------------------------- */

export const NOTIFICATION_CHANNEL_KEYS = ['inApp', 'email', 'push', 'sms'];

export const NOTIFICATION_PREFERENCE_TYPE_KEYS = [
  'maintenance',
  'vehicles',
  'fuel',
  'documents',
  'trips',
  'assignments',
  'drivers',
  'billing',
  'subscription',
  'users',
  'security',
  'audit',
  'reports',
];

export const notificationPreferenceSchema = z.object({
  enabled: z.boolean(),
  inApp: z.boolean(),
  email: z.boolean(),
  push: z.boolean(),
  sms: z.boolean(),
  maintenance: z.boolean(),
  vehicles: z.boolean(),
  fuel: z.boolean(),
  documents: z.boolean(),
  trips: z.boolean(),
  assignments: z.boolean(),
  drivers: z.boolean(),
  billing: z.boolean(),
  subscription: z.boolean(),
  users: z.boolean(),
  security: z.boolean(),
  audit: z.boolean(),
  reports: z.boolean(),
  critical: z.boolean(),
});

export const notificationPreferenceDefaultValues = {
  enabled: true,
  inApp: true,
  email: true,
  push: true,
  sms: true,
  maintenance: true,
  vehicles: true,
  fuel: true,
  documents: true,
  trips: true,
  assignments: true,
  drivers: true,
  billing: true,
  subscription: true,
  users: true,
  security: true,
  audit: true,
  reports: true,
  critical: true,
};

/** Normalise des préférences arbitraires en objet valide. */
export const sanitizeNotificationPreferences = (values = {}) => {
  const parsed = notificationPreferenceSchema.safeParse({
    ...notificationPreferenceDefaultValues,
    ...values,
  });
  return parsed.success ? parsed.data : notificationPreferenceDefaultValues;
};

/**
 * Vue structurée des préférences : `{ enabled, channels, types, critical }`.
 * Les canaux (inApp / email / push / sms) et les types d'événements sont
 * séparés pour un affichage organisé.
 */
export const toNotificationPreferenceView = (values = {}) => {
  const safe = sanitizeNotificationPreferences(values);
  return {
    enabled: safe.enabled,
    channels: Object.fromEntries(
      NOTIFICATION_CHANNEL_KEYS.map((key) => [key, safe[key]]),
    ),
    types: Object.fromEntries(
      NOTIFICATION_PREFERENCE_TYPE_KEYS.map((key) => [key, safe[key]]),
    ),
    critical: safe.critical,
  };
};

/* --------------------------------------------------------------------------
   Filtres de la page (recherche + filtres + tri + période)
   -------------------------------------------------------------------------- */

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
  period: z
    .union([z.enum(['', 'today', 'yesterday', 'last7', 'last30']), z.literal('')])
    .optional(),
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
  period: '',
  dateFrom: '',
  dateTo: '',
  showUnread: false,
};

/** Alias attendu du contrat d'interface (notificationFilterSchema). */
export const notificationFilterSchema = notificationFiltersSchema;

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
