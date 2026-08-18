/**
 * Navix Partner Portal — Schéma de validation Zod du formulaire Véhicule Partenaire
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate, cf. useZodForm).
 * Champs du formulaire PROMPT 063 : Marque, Modèle, Année, Immatriculation,
 * Type, Agence, Kilométrage, Date de mise en service, Couleur, Statut.
 * L'unicité de l'immatriculation est contrôlée côté formulaire (comparaison
 * avec la flotte déjà chargée) puis réappliquée par le service (409).
 * Les dates sont saisies via <input type="date"> (format 'yyyy-mm-dd').
 * Statuts : référentiel partagé vehicles (available/in_use/maintenance/
 * out_of_service) — mêmes libellés que PROMPT 063.
 */
import { z } from 'zod';
import { MIN_VEHICLE_YEAR, normalizeRegistrationNumber, VEHICLE_STATUS_VALUES } from '@/features/vehicles/constants';
import { PARTNER_VEHICLE_TYPE_VALUES, PARTNER_AGENCIES } from '../constants/partner.constants';

const currentYear = new Date().getFullYear();

const optionalDate = (message) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), message);

export const partnerVehicleSchema = z.object({
  registrationNumber: z
    .string()
    .trim()
    .min(1, 'L’immatriculation est requise.')
    .min(5, 'L’immatriculation doit contenir au moins 5 caractères.')
    .transform((value) => normalizeRegistrationNumber(value)),
  brand: z.string().trim().min(1, 'La marque est requise.'),
  model: z.string().trim().min(1, 'Le modèle est requis.'),
  year: z.coerce
    .number({ invalid_type_error: 'Année invalide.' })
    .int('Année invalide.')
    .min(MIN_VEHICLE_YEAR, `L’année doit être supérieure ou égale à ${MIN_VEHICLE_YEAR}.`)
    .max(currentYear + 1, 'Année invalide.'),
  type: z.enum(PARTNER_VEHICLE_TYPE_VALUES, { errorMap: () => ({ message: 'Type de véhicule invalide.' }) }),
  agency: z.enum(PARTNER_AGENCIES, { errorMap: () => ({ message: 'Agence invalide.' }) }),
  mileage: z.coerce
    .number({ invalid_type_error: 'Kilométrage invalide.' })
    .int('Kilométrage invalide.')
    .min(0, 'Le kilométrage doit être positif ou nul.'),
  serviceStartDate: optionalDate('Date de mise en service invalide.').optional(),
  color: z.string().trim().optional(),
  status: z.enum(VEHICLE_STATUS_VALUES, { errorMap: () => ({ message: 'Statut invalide.' }) }),
});

export const partnerVehicleDefaultValues = {
  registrationNumber: '',
  brand: '',
  model: '',
  year: currentYear,
  type: '',
  agency: '',
  mileage: 0,
  serviceStartDate: '',
  color: '',
  status: 'available',
};

/**
 * Aplatit le modèle métier en valeurs de formulaire.
 * @param {object} vehicle
 * @returns {object}
 */
export const toPartnerVehicleFormValues = (vehicle = {}) => ({
  registrationNumber: vehicle.registrationNumber ?? '',
  brand: vehicle.brand ?? '',
  model: vehicle.model ?? '',
  year: vehicle.year ?? currentYear,
  type: vehicle.type ?? '',
  agency: vehicle.agency ?? '',
  mileage: vehicle.mileage ?? 0,
  serviceStartDate: vehicle.serviceStartDate ?? '',
  color: vehicle.color ?? '',
  status: vehicle.status ?? 'available',
});

/**
 * Reconstruit le payload métier à partir des valeurs du formulaire.
 * @param {object} values — valeurs du formulaire
 * @returns {object}
 */
export const toPartnerVehiclePayload = (values) => ({
  registrationNumber: normalizeRegistrationNumber(values.registrationNumber),
  brand: values.brand,
  model: values.model,
  year: Number(values.year),
  type: values.type,
  agency: values.agency,
  mileage: Number(values.mileage),
  serviceStartDate: values.serviceStartDate || undefined,
  color: values.color || undefined,
  status: values.status,
});
