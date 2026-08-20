import { z } from 'zod';
import {
  AUDIT_ACTION_VALUES,
  AUDIT_ACTION_TYPE_VALUES,
  AUDIT_RESOURCE_VALUES,
  AUDIT_STATUS_VALUES,
  AUDIT_SEVERITY_VALUES,
} from './index.js';

export const auditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['createdAt', 'action', 'resourceType', 'severity', 'status', 'created_at']).default('createdAt'),
  order: z.enum(['ASC', 'DESC']).default('DESC'),
  search: z.string().trim().max(120).optional().default(''),
  userId: z.string().optional(),
  action: z.enum(AUDIT_ACTION_VALUES).optional(),
  actionType: z.enum(AUDIT_ACTION_TYPE_VALUES).optional(),
  resourceType: z.enum(AUDIT_RESOURCE_VALUES).optional(),
  entityId: z.string().optional(),
  status: z.enum(AUDIT_STATUS_VALUES).optional(),
  severity: z.enum(AUDIT_SEVERITY_VALUES).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const auditIdParamSchema = z.object({
  id: z.string().min(1, 'ID requis'),
});
