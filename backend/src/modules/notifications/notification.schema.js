import { z } from 'zod';
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_SEVERITIES,
  NOTIFICATION_STATUSES,
  RESOURCE_TYPES,
  ALERT_STATUSES,
} from './index.js';

export const notificationIdParamSchema = z.object({
  id: z.string().trim().min(1, 'ID requis.'),
});

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sort: z.enum(['created_at', 'severity', 'type', 'status', 'updated_at']).default('created_at'),
  order: z.enum(['ASC', 'DESC']).default('DESC'),
  status: z.enum(NOTIFICATION_STATUSES).optional(),
  type: z.string().trim().optional(),
  severity: z.enum(NOTIFICATION_SEVERITIES).optional(),
  category: z.enum(NOTIFICATION_CATEGORIES).optional(),
});

export const createNotificationSchema = z.object({
  userId: z.string().trim().min(1, 'Utilisateur requis.').optional(),
  type: z.enum(NOTIFICATION_TYPES, { errorMap: () => ({ message: 'Type invalide.' }) }).default('system'),
  category: z.enum(NOTIFICATION_CATEGORIES).default('info'),
  severity: z.enum(NOTIFICATION_SEVERITIES).default('low'),
  title: z.string().trim().min(1, 'Titre requis.').max(160),
  message: z.string().trim().max(500).optional().default(''),
  kind: z.string().trim().optional().nullable().default(null),
  entityType: z.enum(RESOURCE_TYPES).optional().nullable().default(null),
  entityId: z.string().trim().optional().nullable().default(null),
  metadata: z.record(z.unknown()).optional().nullable().default(null),
  expiresAt: z.string().trim().datetime({ message: 'Format de date invalide (ISO 8601 requis).' }).optional().nullable().default(null),
});

export const alertIdParamSchema = z.object({
  id: z.string().trim().min(1, 'ID requis.'),
});

export const alertQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sort: z.enum(['created_at', 'severity', 'type', 'status', 'updated_at']).default('created_at'),
  order: z.enum(['ASC', 'DESC']).default('DESC'),
  status: z.enum(ALERT_STATUSES).optional(),
  type: z.string().trim().optional(),
  severity: z.enum(NOTIFICATION_SEVERITIES).optional(),
});
