import { z } from 'zod';

const ASSIGNMENT_TYPES = ['permanent', 'temporary', 'mission', 'replacement', 'maintenance', 'trial'];
const ASSIGNMENT_STATUSES = ['planned', 'active', 'completed', 'cancelled', 'suspended'];

const requiredDate = (message) =>
  z.string().trim().refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), message);

const optionalDate = (message) =>
  z.string().trim().refine((v) => v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v), message).optional().or(z.literal(''));

export const createAssignmentSchema = z.object({
  companyId: z.string().trim().min(1, 'L\'entreprise est requise.').optional(),
  agencyId: z.string().trim().min(1, 'L\'agence est requise.').optional().or(z.literal('')),
  vehicleId: z.string().trim().min(1, 'Le véhicule est requis.'),
  driverId: z.string().trim().min(1, 'Le chauffeur est requis.'),
  assignmentType: z.enum(ASSIGNMENT_TYPES, {
    errorMap: () => ({ message: 'Type d\'affectation invalide.' }),
  }).default('temporary'),
  startDate: requiredDate('La date de début est requise.'),
  expectedEndDate: optionalDate('Date de fin prévue invalide.'),
  startMileage: z.coerce.number().int().min(0, 'Le kilométrage doit être positif.').default(0).optional(),
  fuelLevelStart: z.coerce.number().min(0, 'Le niveau de carburant doit être entre 0 et 100.').max(100, 'Le niveau de carburant doit être entre 0 et 100.').default(0).optional(),
  reason: z.string().trim().max(1000).optional().or(z.literal('')),
  destination: z.string().trim().max(255).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
}).refine(
  (v) => !v.expectedEndDate || !v.startDate || v.expectedEndDate >= v.startDate,
  { message: 'La date de fin prévue doit être postérieure à la date de début.', path: ['expectedEndDate'] },
);

export const updateAssignmentSchema = z.object({
  agencyId: z.string().trim().optional().or(z.literal('')),
  assignmentType: z.enum(ASSIGNMENT_TYPES, {
    errorMap: () => ({ message: 'Type d\'affectation invalide.' }),
  }).optional(),
  startDate: requiredDate('La date de début est requise.').optional(),
  expectedEndDate: optionalDate('Date de fin prévue invalide.').optional(),
  startMileage: z.coerce.number().int().min(0).optional(),
  fuelLevelStart: z.coerce.number().min(0).max(100).optional(),
  reason: z.string().trim().max(1000).optional().or(z.literal('')),
  destination: z.string().trim().max(255).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
}).refine(
  (v) => {
    if (v.startDate && v.expectedEndDate && v.expectedEndDate !== '') {
      return v.expectedEndDate >= v.startDate;
    }
    return true;
  },
  { message: 'La date de fin prévue doit être postérieure à la date de début.', path: ['expectedEndDate'] },
);

export const endAssignmentSchema = z.object({
  endDate: requiredDate('La date de fin est requise.'),
  endMileage: z.coerce.number().int().min(0, 'Le kilométrage final doit être positif.').default(0).optional(),
  fuelLevelEnd: z.coerce.number().min(0).max(100, 'Le niveau de carburant doit être entre 0 et 100.').default(0).optional(),
  reason: z.string().trim().max(1000).optional().or(z.literal('')),
});

export const assignmentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['created_at', 'updated_at', 'start_date', 'end_date', 'status', 'assignment_number', 'assignment_type']).default('created_at'),
  order: z.enum(['ASC', 'DESC']).default('DESC'),
  status: z.enum(ASSIGNMENT_STATUSES).optional().or(z.literal('')),
  assignmentType: z.enum(ASSIGNMENT_TYPES).optional().or(z.literal('')),
  vehicleId: z.string().trim().optional().or(z.literal('')),
  driverId: z.string().trim().optional().or(z.literal('')),
  agencyId: z.string().trim().optional().or(z.literal('')),
  search: z.string().trim().optional().or(z.literal('')),
});

export const assignmentIdParamSchema = z.object({
  id: z.string().trim().length(26, 'L\'identifiant doit contenir 26 caractères.'),
});
