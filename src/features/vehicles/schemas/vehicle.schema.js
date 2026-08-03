/**
 * Navix Vehicles — Schéma de validation Zod du formulaire Véhicule
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate). Le contrôle
 * d'unicité de l'immatriculation est simulé côté formulaire (compare avec
 * les véhicules déjà chargés) puis réappliqué par le service (409).
 * Les dates sont saisies via <input type="date"> (format 'yyyy-mm-dd').
 */
import { z } from 'zod';
import {
  VEHICLE_GROUP_VALUES,
  VEHICLE_STATUS_VALUES,
  FUEL_TYPE_VALUES,
  TRANSMISSION_VALUES,
  MIN_VEHICLE_YEAR,
} from '../constants';

const currentYear = new Date().getFullYear();

const optionalUrl = (message) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || z.string().url().safeParse(value).success, message);

const optionalDate = (message) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), message);

export const vehicleSchema = z.object({
  registrationNumber: z
    .string()
    .trim()
    .min(1, 'L’immatriculation est requise.')
    .min(5, 'L’immatriculation doit contenir au moins 5 caractères.'),
  vin: z
    .string()
    .trim()
    .min(1, 'Le VIN est requis.')
    .min(17, 'Le VIN doit contenir 17 caractères.')
    .max(17, 'Le VIN doit contenir 17 caractères.')
    .regex(/^[A-Za-z0-9]+$/, 'Le VIN ne peut contenir que des lettres et des chiffres.'),
  companyId: z.string().trim().min(1, 'L’entreprise est requise.'),
  brand: z.string().trim().min(1, 'La marque est requise.'),
  model: z.string().trim().min(1, 'Le modèle est requis.'),
  version: z.string().trim().optional(),
  year: z.coerce
    .number({ invalid_type_error: 'Année invalide.' })
    .int('Année invalide.')
    .min(MIN_VEHICLE_YEAR, `L’année doit être supérieure ou égale à ${MIN_VEHICLE_YEAR}.`)
    .max(currentYear + 1, 'Année invalide.'),
  color: z.string().trim().optional(),
  fuelType: z.enum(FUEL_TYPE_VALUES, { errorMap: () => ({ message: 'Type de carburant invalide.' }) }),
  transmission: z.enum(TRANSMISSION_VALUES, { errorMap: () => ({ message: 'Transmission invalide.' }) }),
  mileage: z.coerce
    .number({ invalid_type_error: 'Kilométrage invalide.' })
    .int('Kilométrage invalide.')
    .min(0, 'Le kilométrage doit être positif ou nul.'),
  capacity: z.coerce
    .number({ invalid_type_error: 'Capacité invalide.' })
    .int('Capacité invalide.')
    .min(0, 'La capacité doit être positive ou nulle.'),
  group: z.enum(VEHICLE_GROUP_VALUES, { errorMap: () => ({ message: 'Groupe invalide.' }) }),
  category: z.string().trim().min(1, 'La catégorie est requise.'),
  status: z.enum(VEHICLE_STATUS_VALUES, { errorMap: () => ({ message: 'Statut invalide.' }) }),
  purchaseDate: optionalDate('Date d’achat invalide.').optional(),
  insuranceExpiry: optionalDate('Date d’expiration invalide.').optional(),
  inspectionExpiry: optionalDate('Date d’expiration invalide.').optional(),
  registrationExpiry: optionalDate('Date d’expiration invalide.').optional(),
  currentDriver: z.string().trim().optional(),
  agency: z.string().trim().optional(),
  photo: optionalUrl('URL de la photo invalide.').optional(),
  qrCode: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const vehicleDefaultValues = {
  registrationNumber: '',
  vin: '',
  companyId: '',
  brand: '',
  model: '',
  version: '',
  year: currentYear,
  color: '',
  fuelType: 'diesel',
  transmission: 'manuelle',
  mileage: 0,
  capacity: 0,
  group: '',
  category: '',
  status: 'available',
  purchaseDate: '',
  insuranceExpiry: '',
  inspectionExpiry: '',
  registrationExpiry: '',
  currentDriver: '',
  agency: '',
  photo: '',
  qrCode: '',
  notes: '',
};

/**
 * Aplatit le modèle métier en valeurs de formulaire.
 * @param {object} vehicle
 * @returns {object}
 */
export const toVehicleFormValues = (vehicle = {}) => ({
  registrationNumber: vehicle.registrationNumber ?? '',
  vin: vehicle.vin ?? '',
  companyId: vehicle.companyId ?? '',
  brand: vehicle.brand ?? '',
  model: vehicle.model ?? '',
  version: vehicle.version ?? '',
  year: vehicle.year ?? currentYear,
  color: vehicle.color ?? '',
  fuelType: vehicle.fuelType ?? 'diesel',
  transmission: vehicle.transmission ?? 'manuelle',
  mileage: vehicle.mileage ?? 0,
  capacity: vehicle.capacity ?? 0,
  group: vehicle.group ?? '',
  category: vehicle.category ?? '',
  status: vehicle.status ?? 'available',
  purchaseDate: vehicle.purchaseDate ?? '',
  insuranceExpiry: vehicle.insuranceExpiry ?? '',
  inspectionExpiry: vehicle.inspectionExpiry ?? '',
  registrationExpiry: vehicle.registrationExpiry ?? '',
  currentDriver: vehicle.currentDriver ?? '',
  agency: vehicle.agency ?? '',
  photo: vehicle.photo ?? '',
  qrCode: vehicle.qrCode ?? '',
  notes: vehicle.notes ?? '',
});

/**
 * Reconstruit le payload métier à partir des valeurs du formulaire.
 * @param {object} values — valeurs du formulaire
 * @returns {object}
 */
export const toVehiclePayload = (values) => ({
  registrationNumber: values.registrationNumber,
  vin: values.vin,
  companyId: values.companyId,
  brand: values.brand,
  model: values.model,
  version: values.version,
  year: values.year,
  color: values.color,
  fuelType: values.fuelType,
  transmission: values.transmission,
  mileage: values.mileage,
  capacity: values.capacity,
  group: values.group,
  category: values.category,
  status: values.status,
  purchaseDate: values.purchaseDate,
  insuranceExpiry: values.insuranceExpiry,
  inspectionExpiry: values.inspectionExpiry,
  registrationExpiry: values.registrationExpiry,
  currentDriver: values.currentDriver,
  agency: values.agency,
  photo: values.photo,
  qrCode: values.qrCode,
  notes: values.notes,
});
