import { z } from 'zod';
import {
  MAINTENANCE_TYPES,
  MAINTENANCE_STATUSES,
  MAINTENANCE_PRIORITIES,
  DEFAULT_CURRENCY,
} from './index.js';

const attachmentSchema = z.object({
  name: z.string().optional(),
  size: z.number().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
}).passthrough();

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().trim().min(1, 'Le véhicule est requis.'),
  maintenanceType: z.enum(MAINTENANCE_TYPES, { errorMap: () => ({ message: 'Type d\'entretien invalide.' }) }),
  priority: z.enum(MAINTENANCE_PRIORITIES, { errorMap: () => ({ message: 'Priorité invalide.' }) }).default('normal'),
  status: z.enum(MAINTENANCE_STATUSES, { errorMap: () => ({ message: 'Statut invalide.' }) }).default('planned'),
  workshop: z.string().trim().optional().default(''),
  mechanic: z.string().trim().optional().default(''),
  supplier: z.string().trim().optional().default(''),
  scheduledDate: z.string().trim().min(1, 'La date prévue est requise.'),
  startedAt: z.string().trim().optional().default(''),
  completedAt: z.string().trim().optional().default(''),
  nextMaintenanceDate: z.string().trim().optional().default(''),
  mileage: z.coerce.number().int().min(0).optional().default(0),
  nextMileage: z.coerce.number().int().min(0).optional().default(0),
  estimatedCost: z.coerce.number().min(0).optional().default(0),
  actualCost: z.coerce.number().min(0).optional().default(0),
  currency: z.string().trim().min(1).default(DEFAULT_CURRENCY),
  description: z.string().trim().min(1, 'La description est requise.'),
  diagnostic: z.string().trim().optional().default(''),
  performedWork: z.string().trim().optional().default(''),
  replacedParts: z.array(z.string()).optional().default([]),
  attachments: z.array(attachmentSchema).optional().default([]),
  notes: z.string().trim().optional().default(''),
});

export const updateMaintenanceSchema = z.object({
  vehicleId: z.string().trim().optional(),
  maintenanceType: z.enum(MAINTENANCE_TYPES).optional(),
  priority: z.enum(MAINTENANCE_PRIORITIES).optional(),
  status: z.enum(MAINTENANCE_STATUSES).optional(),
  workshop: z.string().trim().optional(),
  mechanic: z.string().trim().optional(),
  supplier: z.string().trim().optional(),
  scheduledDate: z.string().trim().optional(),
  startedAt: z.string().trim().optional(),
  completedAt: z.string().trim().optional(),
  nextMaintenanceDate: z.string().trim().optional(),
  mileage: z.coerce.number().int().min(0).optional(),
  nextMileage: z.coerce.number().int().min(0).optional(),
  estimatedCost: z.coerce.number().min(0).optional(),
  actualCost: z.coerce.number().min(0).optional(),
  currency: z.string().trim().optional(),
  description: z.string().trim().optional(),
  diagnostic: z.string().trim().optional(),
  performedWork: z.string().trim().optional(),
  replacedParts: z.array(z.string()).optional(),
  attachments: z.array(attachmentSchema).optional(),
  notes: z.string().trim().optional(),
});

export const maintenanceQuerySchema = z.object({
  sort: z.enum(['scheduled_date', 'actual_cost', 'mileage_at_service', 'priority', 'created_at', 'status']).default('created_at'),
  order: z.enum(['ASC', 'DESC']).default('DESC'),
  vehicleId: z.string().trim().optional(),
  maintenanceType: z.enum(MAINTENANCE_TYPES).optional(),
  priority: z.enum(MAINTENANCE_PRIORITIES).optional(),
  status: z.enum(MAINTENANCE_STATUSES).optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  search: z.string().trim().optional(),
  companyScopeId: z.string().trim().optional(),
});

export const maintenanceIdParamSchema = z.object({
  id: z.string().trim().min(1, 'ID requis.'),
});

export const maintenanceVehicleIdParamSchema = z.object({
  vehicleId: z.string().trim().min(1, 'ID véhicule requis.'),
});

export const calendarQuerySchema = z.object({
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
  companyScopeId: z.string().trim().optional(),
});

export const historyQuerySchema = z.object({
  vehicleId: z.string().trim().optional(),
  companyScopeId: z.string().trim().optional(),
});
