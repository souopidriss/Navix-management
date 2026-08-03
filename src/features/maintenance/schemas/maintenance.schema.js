/**
 * Navix Maintenance — Schémas de validation Zod des entretiens
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate). Champs obligatoires :
 * entreprise, véhicule, type d'entretien, priorité, statut, date prévue et
 * description. Les montants (estimatedCost, actualCost) et les kilométrages
 * (mileage, nextMileage) sont optionnels mais doivent être ≥ 0. La liste des
 * pièces remplacées est une liste de chaînes ; les pièces jointes une liste
 * de fichiers simulés { name, size, type, category }.
 *
 * Le formulaire métier est embarqué dans le FormModal générique de la
 * bibliothèque core — le Core ne connaît aucun métier.
 */
import { z } from 'zod';
import {
  MAINTENANCE_TYPE_VALUES,
  MAINTENANCE_PRIORITY_VALUES,
  MAINTENANCE_STATUS_VALUES,
  DEFAULT_CURRENCY,
} from '../constants';

const positiveNumber = (message) =>
  z.coerce
    .number({ invalid_type_error: message })
    .min(0, message);

const dateOrEmpty = z.string().trim().optional();

export const maintenanceSchema = z.object({
  companyId: z.string().trim().min(1, 'L’entreprise est requise.'),
  vehicleId: z.string().trim().min(1, 'Le véhicule est requis.'),
  maintenanceType: z.enum(MAINTENANCE_TYPE_VALUES, {
    errorMap: () => ({ message: 'Type d’entretien invalide.' }),
  }),
  priority: z.enum(MAINTENANCE_PRIORITY_VALUES, {
    errorMap: () => ({ message: 'Priorité invalide.' }),
  }),
  status: z.enum(MAINTENANCE_STATUS_VALUES, {
    errorMap: () => ({ message: 'Statut invalide.' }),
  }),
  workshop: z.string().trim().optional(),
  mechanic: z.string().trim().optional(),
  supplier: z.string().trim().optional(),
  scheduledDate: z.string().trim().min(1, 'La date prévue est requise.'),
  startedAt: dateOrEmpty,
  completedAt: dateOrEmpty,
  nextMaintenanceDate: dateOrEmpty,
  mileage: positiveNumber('Le kilométrage ne peut pas être négatif.').optional(),
  nextMileage: positiveNumber('Le prochain kilométrage ne peut pas être négatif.').optional(),
  estimatedCost: positiveNumber('Le coût estimé ne peut pas être négatif.').optional(),
  actualCost: positiveNumber('Le coût réel ne peut pas être négatif.').optional(),
  currency: z.string().trim().min(1, 'La devise est requise.').default(DEFAULT_CURRENCY),
  description: z.string().trim().min(1, 'La description est requise.'),
  diagnostic: z.string().trim().optional(),
  performedWork: z.string().trim().optional(),
  replacedParts: z.array(z.string()).optional().default([]),
  attachments: z
    .array(z.object({ name: z.string(), size: z.number().optional(), type: z.string().optional(), category: z.string().optional() }))
    .optional()
    .default([]),
  notes: z.string().trim().optional(),
});

export const maintenanceDefaultValues = {
  companyId: '',
  vehicleId: '',
  maintenanceType: '',
  priority: 'normal',
  status: 'planned',
  workshop: '',
  mechanic: '',
  supplier: '',
  scheduledDate: '',
  startedAt: '',
  completedAt: '',
  nextMaintenanceDate: '',
  mileage: '',
  nextMileage: '',
  estimatedCost: '',
  actualCost: '',
  currency: DEFAULT_CURRENCY,
  description: '',
  diagnostic: '',
  performedWork: '',
  replacedParts: [],
  attachments: [],
  notes: '',
};

/** Aplatit le modèle métier en valeurs de formulaire (création / édition). */
export const toMaintenanceFormValues = (maintenance = {}) => ({
  companyId: maintenance.companyId ?? '',
  vehicleId: maintenance.vehicleId ?? '',
  maintenanceType: maintenance.maintenanceType ?? '',
  priority: maintenance.priority ?? 'normal',
  status: maintenance.status ?? 'planned',
  workshop: maintenance.workshop ?? '',
  mechanic: maintenance.mechanic ?? '',
  supplier: maintenance.supplier ?? '',
  scheduledDate: maintenance.scheduledDate ?? '',
  startedAt: maintenance.startedAt ?? '',
  completedAt: maintenance.completedAt ?? '',
  nextMaintenanceDate: maintenance.nextMaintenanceDate ?? '',
  mileage: maintenance.mileage ?? '',
  nextMileage: maintenance.nextMileage ?? '',
  estimatedCost: maintenance.estimatedCost ?? '',
  actualCost: maintenance.actualCost ?? '',
  currency: maintenance.currency ?? DEFAULT_CURRENCY,
  description: maintenance.description ?? '',
  diagnostic: maintenance.diagnostic ?? '',
  performedWork: maintenance.performedWork ?? '',
  replacedParts: Array.isArray(maintenance.replacedParts) ? maintenance.replacedParts : [],
  attachments: Array.isArray(maintenance.attachments) ? maintenance.attachments : [],
  notes: maintenance.notes ?? '',
});

const toNumberOrEmpty = (value) =>
  value === undefined || value === null || value === '' ? '' : Number(value);

/** Reconstruit le payload métier à partir des valeurs du formulaire. */
export const toMaintenancePayload = (values) => ({
  companyId: values.companyId,
  vehicleId: values.vehicleId,
  maintenanceType: values.maintenanceType,
  priority: values.priority,
  status: values.status,
  workshop: values.workshop || '',
  mechanic: values.mechanic || '',
  supplier: values.supplier || '',
  scheduledDate: values.scheduledDate,
  startedAt: values.startedAt || '',
  completedAt: values.completedAt || '',
  nextMaintenanceDate: values.nextMaintenanceDate || '',
  mileage: toNumberOrEmpty(values.mileage) === '' ? 0 : Number(values.mileage),
  nextMileage: toNumberOrEmpty(values.nextMileage) === '' ? 0 : Number(values.nextMileage),
  estimatedCost: toNumberOrEmpty(values.estimatedCost) === '' ? 0 : Number(values.estimatedCost),
  actualCost: toNumberOrEmpty(values.actualCost) === '' ? 0 : Number(values.actualCost),
  currency: values.currency || DEFAULT_CURRENCY,
  description: values.description,
  diagnostic: values.diagnostic || '',
  performedWork: values.performedWork || '',
  replacedParts: (Array.isArray(values.replacedParts) ? values.replacedParts : []).filter(Boolean),
  attachments: Array.isArray(values.attachments) ? values.attachments : [],
  notes: values.notes || '',
});
