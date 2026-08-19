import { z } from 'zod';
import { TRIP_TYPES, TRIP_STATUSES } from './index.js';

const requiredDate = (message) =>
  z.string().trim().refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), message);

const optionalDate = (message) =>
  z.string().trim().refine((v) => v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v), message).optional().or(z.literal(''));

const requiredTime = (message) =>
  z.string().trim().refine((v) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v), message).optional().or(z.literal(''));

export const createTripSchema = z.object({
  companyId: z.string().trim().min(1).optional(),
  assignmentId: z.string().trim().min(1, 'L\'affectation est requise.'),
  tripType: z.enum(TRIP_TYPES, {
    errorMap: () => ({ message: 'Type de trajet invalide.' }),
  }).default('mission'),
  purpose: z.string().trim().max(255).optional().or(z.literal('')),
  departureLocation: z.string().trim().min(1, 'Le lieu de départ est requis.'),
  arrivalLocation: z.string().trim().min(1, 'Le lieu d\'arrivée est requis.'),
  departureDate: requiredDate('La date de départ est requise.'),
  departureTime: requiredTime('L\'heure de départ invalide.'),
  arrivalDate: optionalDate('La date d\'arrivée invalide.'),
  arrivalTime: requiredTime('L\'heure d\'arrivée invalide.'),
  plannedDistance: z.coerce.number().min(0, 'La distance doit être positive.').default(0).optional(),
  estimatedDuration: z.coerce.number().int().min(0, 'La durée doit être positive.').default(0).optional(),
  departureMileage: z.coerce.number().int().min(0, 'Le kilométrage doit être positif.').default(0).optional(),
  passengerCount: z.coerce.number().int().min(0, 'Le nombre de passagers doit être positif.').default(0).optional(),
  cargoWeight: z.coerce.number().min(0, 'Le poids du chargement doit être positif.').default(0).optional(),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
}).refine(
  (v) => !v.arrivalDate || !v.departureDate || v.arrivalDate >= v.departureDate,
  { message: 'La date d\'arrivée doit être postérieure à la date de départ.', path: ['arrivalDate'] },
);

export const updateTripSchema = z.object({
  companyId: z.string().trim().optional(),
  assignmentId: z.string().trim().optional(),
  tripType: z.enum(TRIP_TYPES, {
    errorMap: () => ({ message: 'Type de trajet invalide.' }),
  }).optional(),
  purpose: z.string().trim().max(255).optional().or(z.literal('')),
  departureLocation: z.string().trim().optional(),
  arrivalLocation: z.string().trim().optional(),
  departureDate: requiredDate('La date de départ invalide.').optional(),
  departureTime: requiredTime('L\'heure de départ invalide.'),
  arrivalDate: optionalDate('La date d\'arrivée invalide.'),
  arrivalTime: requiredTime('L\'heure d\'arrivée invalide.'),
  plannedDistance: z.coerce.number().min(0).optional(),
  estimatedDuration: z.coerce.number().int().min(0).optional(),
  departureMileage: z.coerce.number().int().min(0).optional(),
  passengerCount: z.coerce.number().int().min(0).optional(),
  cargoWeight: z.coerce.number().min(0).optional(),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
}).refine(
  (v) => {
    if (v.arrivalDate && v.departureDate && v.arrivalDate !== '' && v.departureDate !== '') {
      return v.arrivalDate >= v.departureDate;
    }
    return true;
  },
  { message: 'La date d\'arrivée doit être postérieure à la date de départ.', path: ['arrivalDate'] },
);

export const finishTripSchema = z.object({
  arrivalDate: requiredDate('La date d\'arrivée est requise.'),
  arrivalTime: requiredTime('L\'heure d\'arrivée invalide.'),
  actualDistance: z.coerce.number().min(0, 'La distance doit être positive.').default(0).optional(),
  arrivalMileage: z.coerce.number().int().min(0, 'Le kilométrage final doit être positif.').default(0).optional(),
  actualDuration: z.coerce.number().int().min(0, 'La durée doit être positive.').default(0).optional(),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export const driverStartTripSchema = z.object({
  departureMileage: z.coerce.number().int().min(1, 'Le kilométrage de départ est requis.'),
});

export const driverCompleteTripSchema = z.object({
  arrivalMileage: z.coerce.number().int().min(1, 'Le kilométrage d\'arrivée est requis.'),
});

export const tripQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['created_at', 'updated_at', 'departure_date', 'arrival_date', 'status', 'trip_number', 'trip_type', 'actual_distance', 'actual_duration']).default('departure_date'),
  order: z.enum(['ASC', 'DESC']).default('DESC'),
  status: z.enum(TRIP_STATUSES).optional().or(z.literal('')),
  tripType: z.enum(TRIP_TYPES).optional().or(z.literal('')),
  vehicleId: z.string().trim().optional().or(z.literal('')),
  driverId: z.string().trim().optional().or(z.literal('')),
  search: z.string().trim().optional().or(z.literal('')),
  companyScopeId: z.string().trim().optional().or(z.literal('')),
});

export const tripIdParamSchema = z.object({
  id: z.string().trim().min(1, 'L\'identifiant est requis.'),
});

export const driverIdParamSchema = z.object({
  driverId: z.string().trim().min(1, 'L\'identifiant du chauffeur est requis.'),
});
