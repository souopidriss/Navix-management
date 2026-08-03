/**
 * Navix Trips — Schémas de validation Zod des formulaires de trajet
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate). Champs obligatoires :
 * entreprise, affectation active, type, motif, lieu de départ, lieu
 * d'arrivée et date de départ. L'affectation sélectionnée détermine le
 * véhicule et le chauffeur (champs dérivés, non saisis au formulaire).
 * Les dates sont saisies via <input type="date"> ('yyyy-mm-dd'), les heures
 * via <input type="time"> ('HH:mm').
 */
import { z } from 'zod';
import { TRIP_TYPE_VALUES } from '../constants';

const requiredDate = (message) =>
  z.string().trim().refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), message);

const optionalDate = (message) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), message);

const optionalTime = (message) =>
  z.string().trim().refine((value) => value === '' || /^\d{2}:\d{2}$/.test(value), message);

const optionalNumber = (message, { min, max } = {}) => {
  let field = z.coerce.number({ invalid_type_error: message });

  if (min !== undefined) field = field.min(min, message);
  if (max !== undefined) field = field.max(max, message);

  field = field.refine((value) => value >= 0, 'La valeur doit être positive ou nulle.');

  return field.optional().or(z.literal(''));
};

export const tripSchema = z
  .object({
    companyId: z.string().trim().min(1, 'L’entreprise est requise.'),
    assignmentId: z.string().trim().min(1, 'L’affectation est requise.'),
    tripType: z.enum(TRIP_TYPE_VALUES, {
      errorMap: () => ({ message: 'Type de trajet invalide.' }),
    }),
    purpose: z.string().trim().min(1, 'Le motif du trajet est requis.'),
    departureLocation: z.string().trim().min(1, 'Le lieu de départ est requis.'),
    arrivalLocation: z.string().trim().min(1, 'Le lieu d’arrivée est requis.'),
    departureDate: requiredDate('La date de départ est requise.'),
    departureTime: optionalTime('Heure de départ invalide.'),
    arrivalDate: optionalDate('Date d’arrivée invalide.'),
    arrivalTime: optionalTime('Heure d’arrivée invalide.'),
    plannedDistance: optionalNumber('Distance planifiée invalide.'),
    estimatedDuration: optionalNumber('Durée estimée invalide.'),
    departureMileage: optionalNumber('Kilométrage de départ invalide.'),
    passengerCount: optionalNumber('Nombre de passagers invalide.'),
    cargoWeight: optionalNumber('Poids de chargement invalide.'),
    notes: z.string().trim().optional(),
  })
  .refine(
    (values) => !values.arrivalDate || !values.departureDate || values.arrivalDate >= values.departureDate,
    { message: 'La date d’arrivée doit être postérieure à la date de départ.', path: ['arrivalDate'] },
  )
  .refine((values) => !values.arrivalTime || Boolean(values.arrivalDate), {
    message: 'L’heure d’arrivée requiert une date d’arrivée.',
    path: ['arrivalTime'],
  });

export const tripDefaultValues = {
  companyId: '',
  assignmentId: '',
  tripType: '',
  purpose: '',
  departureLocation: '',
  arrivalLocation: '',
  departureDate: '',
  departureTime: '',
  arrivalDate: '',
  arrivalTime: '',
  plannedDistance: '',
  estimatedDuration: '',
  departureMileage: '',
  passengerCount: '',
  cargoWeight: '',
  notes: '',
};

/**
 * Construit le schéma de clôture d'un trajet à partir du contexte métier
 * (date de départ et kilométrage de départ) pour valider les règles
 * « arrivée ≥ départ » et « kilométrage d'arrivée > kilométrage de départ ».
 * @param {{ departureDate?: string, departureMileage?: number }} context
 * @returns {import('zod').ZodSchema}
 */
export const buildTripFinishSchema = ({ departureDate = '', departureMileage = 0 } = {}) =>
  z
    .object({
      arrivalDate: requiredDate('La date d’arrivée est requise.'),
      arrivalTime: optionalTime('Heure d’arrivée invalide.'),
      actualDistance: optionalNumber('Distance réelle invalide.'),
      arrivalMileage: optionalNumber('Kilométrage d’arrivée invalide.'),
      actualDuration: optionalNumber('Durée réelle invalide.'),
      notes: z.string().trim().optional(),
    })
    .refine(
      (values) => !departureDate || values.arrivalDate >= departureDate,
      { message: 'La date d’arrivée doit être postérieure à la date de départ.', path: ['arrivalDate'] },
    )
    .refine((values) => !values.arrivalTime || Boolean(values.arrivalDate), {
      message: 'L’heure d’arrivée requiert une date d’arrivée.',
      path: ['arrivalTime'],
    })
    .refine(
      (values) => values.arrivalMileage === '' || values.arrivalMileage === 0 || Number(values.arrivalMileage) > Number(departureMileage),
      { message: 'Le kilométrage d’arrivée doit être supérieur au kilométrage de départ.', path: ['arrivalMileage'] },
    );

export const tripFinishDefaultValues = {
  arrivalDate: '',
  arrivalTime: '',
  actualDistance: '',
  arrivalMileage: '',
  actualDuration: '',
  notes: '',
};

/**
 * Aplatit le modèle métier en valeurs de formulaire (création / édition).
 * @param {object} trip
 * @returns {object}
 */
export const toTripFormValues = (trip = {}) => ({
  companyId: trip.companyId ?? '',
  assignmentId: trip.assignmentId ?? '',
  tripType: trip.tripType ?? '',
  purpose: trip.purpose ?? '',
  departureLocation: trip.departureLocation ?? '',
  arrivalLocation: trip.arrivalLocation ?? '',
  departureDate: trip.departureDate ?? '',
  departureTime: trip.departureTime ?? '',
  arrivalDate: trip.arrivalDate ?? '',
  arrivalTime: trip.arrivalTime ?? '',
  plannedDistance: trip.plannedDistance ?? '',
  estimatedDuration: trip.estimatedDuration ?? '',
  departureMileage: trip.departureMileage ?? '',
  passengerCount: trip.passengerCount ?? '',
  cargoWeight: trip.cargoWeight ?? '',
  notes: trip.notes ?? '',
});

/**
 * Reconstruit le payload métier à partir des valeurs du formulaire.
 * Le véhicule et le chauffeur sont dérivés de l'affectation par le service.
 * @param {object} values — valeurs du formulaire
 * @returns {object}
 */
export const toTripPayload = (values) => ({
  companyId: values.companyId,
  assignmentId: values.assignmentId,
  tripType: values.tripType,
  purpose: values.purpose,
  departureLocation: values.departureLocation,
  arrivalLocation: values.arrivalLocation,
  departureDate: values.departureDate,
  departureTime: values.departureTime || '',
  arrivalDate: values.arrivalDate || '',
  arrivalTime: values.arrivalTime || '',
  plannedDistance: values.plannedDistance === '' ? 0 : Number(values.plannedDistance),
  estimatedDuration: values.estimatedDuration === '' ? 0 : Number(values.estimatedDuration),
  departureMileage: values.departureMileage === '' ? 0 : Number(values.departureMileage),
  passengerCount: values.passengerCount === '' ? 0 : Number(values.passengerCount),
  cargoWeight: values.cargoWeight === '' ? 0 : Number(values.cargoWeight),
  notes: values.notes,
});

/**
 * Payload de clôture d'un trajet (formulaire « Terminer le trajet »).
 * @param {object} values
 * @returns {object}
 */
export const toFinishValues = (values) => ({
  arrivalDate: values.arrivalDate,
  arrivalTime: values.arrivalTime || '',
  actualDistance: values.actualDistance === '' ? 0 : Number(values.actualDistance),
  arrivalMileage: values.arrivalMileage === '' ? 0 : Number(values.arrivalMileage),
  actualDuration: values.actualDuration === '' ? 0 : Number(values.actualDuration),
  notes: values.notes,
});
