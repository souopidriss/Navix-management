/**
 * Navix Assignments — Schémas de validation Zod des formulaires d'affectation
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate). Champs obligatoires :
 * entreprise, agence, véhicule, chauffeur, type et date de début. Les
 * contrôles de cohérence (véhicule / chauffeur déjà en affectation active)
 * sont simulés côté formulaire puis réappliqués par le service (409).
 * Les dates sont saisies via <input type="date"> (format 'yyyy-mm-dd').
 */
import { z } from 'zod';
import { ASSIGNMENT_TYPE_VALUES } from '../constants';

const requiredDate = (message) =>
  z.string().trim().refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), message);

const optionalDate = (message) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), message);

const optionalNumber = (message, { min, max } = {}) => {
  let field = z.coerce.number({ invalid_type_error: message });

  if (min !== undefined) field = field.min(min, message);
  if (max !== undefined) field = field.max(max, message);

  field = field.refine((value) => value >= 0, 'La valeur doit être positive ou nulle.');

  return field.optional().or(z.literal(''));
};

export const assignmentSchema = z
  .object({
    companyId: z.string().trim().min(1, 'L’entreprise est requise.'),
    agencyId: z.string().trim().min(1, 'L’agence est requise.'),
    vehicleId: z.string().trim().min(1, 'Le véhicule est requis.'),
    driverId: z.string().trim().min(1, 'Le chauffeur est requis.'),
    assignmentType: z.enum(ASSIGNMENT_TYPE_VALUES, {
      errorMap: () => ({ message: 'Type d’affectation invalide.' }),
    }),
    startDate: requiredDate('La date de début est requise.'),
    expectedEndDate: optionalDate('Date de fin prévue invalide.'),
    startMileage: optionalNumber('Kilométrage de départ invalide.'),
    fuelLevelStart: optionalNumber('Niveau de carburant invalide.', { min: 0, max: 100 }),
    reason: z.string().trim().optional(),
    destination: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  })
  .refine(
    (values) =>
      !values.expectedEndDate || !values.startDate || values.expectedEndDate >= values.startDate,
    { message: 'La date de fin prévue doit être postérieure à la date de début.', path: ['expectedEndDate'] },
  );

export const assignmentDefaultValues = {
  companyId: '',
  agencyId: '',
  vehicleId: '',
  driverId: '',
  assignmentType: '',
  startDate: '',
  expectedEndDate: '',
  startMileage: '',
  fuelLevelStart: '',
  reason: '',
  destination: '',
  notes: '',
};

/** Schéma du formulaire « Fin d'affectation » (modale). */
export const assignmentFinishSchema = z.object({
  endDate: requiredDate('La date de fin est requise.'),
  endMileage: optionalNumber('Kilométrage final invalide.'),
  fuelLevelEnd: optionalNumber('Niveau de carburant final invalide.', { min: 0, max: 100 }),
  reason: z.string().trim().optional(),
});

export const finishDefaultValues = {
  endDate: '',
  endMileage: '',
  fuelLevelEnd: '',
  reason: '',
};

/**
 * Aplatit le modèle métier en valeurs de formulaire (création / édition).
 * @param {object} assignment
 * @returns {object}
 */
export const toAssignmentFormValues = (assignment = {}) => ({
  companyId: assignment.companyId ?? '',
  agencyId: assignment.agencyId ?? '',
  vehicleId: assignment.vehicleId ?? '',
  driverId: assignment.driverId ?? '',
  assignmentType: assignment.assignmentType ?? '',
  startDate: assignment.startDate ?? '',
  expectedEndDate: assignment.expectedEndDate ?? '',
  startMileage: assignment.startMileage ?? '',
  fuelLevelStart: assignment.fuelLevelStart ?? '',
  reason: assignment.reason ?? '',
  destination: assignment.destination ?? '',
  notes: assignment.notes ?? '',
});

/**
 * Reconstruit le payload métier à partir des valeurs du formulaire.
 * @param {object} values — valeurs du formulaire
 * @returns {object}
 */
export const toAssignmentPayload = (values) => ({
  companyId: values.companyId,
  agencyId: values.agencyId,
  vehicleId: values.vehicleId,
  driverId: values.driverId,
  assignmentType: values.assignmentType,
  startDate: values.startDate,
  expectedEndDate: values.expectedEndDate || '',
  startMileage: values.startMileage === '' ? 0 : Number(values.startMileage),
  fuelLevelStart: values.fuelLevelStart === '' ? 0 : Number(values.fuelLevelStart),
  reason: values.reason,
  destination: values.destination,
  notes: values.notes,
});

/**
 * Payload de clôture d'une affectation (formulaire « Fin d'affectation »).
 * @param {object} values
 * @returns {object}
 */
export const toFinishValues = (values) => ({
  endDate: values.endDate,
  endMileage: values.endMileage === '' ? 0 : Number(values.endMileage),
  fuelLevelEnd: values.fuelLevelEnd === '' ? 0 : Number(values.fuelLevelEnd),
  reason: values.reason,
});
