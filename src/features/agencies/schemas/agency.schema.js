/**
 * Navix Agencies — Schéma de validation Zod du formulaire Agence / Site
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate). Champs obligatoires :
 * entreprise, nom, code, type, ville, pays et statut. Le responsable
 * (managerId) est optionnel et référencé par un id de chauffeur. Les
 * coordonnées (latitude / longitude) sont optionnelles mais doivent être des
 * nombres valides (converties en Number à la soumission).
 */
import { z } from 'zod';
import {
  AGENCY_TYPE_VALUES,
  AGENCY_STATUS_VALUES,
} from '../constants';

const optionalPhone = (message) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || /^[0-9+()\-. ]{6,20}$/.test(value), message);

const optionalEmail = (message) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || z.string().email().safeParse(value).success, message);

const optionalCoordinate = (message) =>
  z
    .string()
    .trim()
    .refine(
      (value) => value === '' || /^-?\d+(\.\d+)?$/.test(value),
      message,
    );

export const agencySchema = z.object({
  companyId: z.string().trim().min(1, 'L’entreprise est requise.'),
  name: z
    .string()
    .trim()
    .min(1, 'Le nom de l’agence est requis.')
    .min(2, 'Le nom doit contenir au moins 2 caractères.'),
  code: z
    .string()
    .trim()
    .min(1, 'Le code est requis.')
    .max(12, 'Le code ne doit pas dépasser 12 caractères.')
    .regex(/^[A-Za-z0-9-]+$/, 'Le code ne peut contenir que des lettres, chiffres et tirets.'),
  type: z.enum(AGENCY_TYPE_VALUES, { errorMap: () => ({ message: 'Type d’agence invalide.' }) }),
  description: z.string().trim().optional(),
  phone: optionalPhone('Numéro de téléphone invalide.'),
  email: optionalEmail('Adresse email invalide.'),
  address: z.string().trim().optional(),
  city: z.string().trim().min(1, 'La ville est requise.'),
  region: z.string().trim().optional(),
  country: z.string().trim().min(1, 'Le pays est requis.'),
  postalCode: z.string().trim().optional(),
  latitude: optionalCoordinate('Latitude invalide.'),
  longitude: optionalCoordinate('Longitude invalide.'),
  managerId: z.string().trim().optional(),
  status: z.enum(AGENCY_STATUS_VALUES, { errorMap: () => ({ message: 'Statut invalide.' }) }),
  openingHours: z.string().trim().optional(),
});

export const agencyDefaultValues = {
  companyId: '',
  name: '',
  code: '',
  type: 'agence',
  description: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  region: '',
  country: 'Côte d’Ivoire',
  postalCode: '',
  latitude: '',
  longitude: '',
  managerId: '',
  status: 'active',
  openingHours: 'Lun–Ven : 08h00–18h00, Sam : 08h00–12h00',
};

/**
 * Aplatit le modèle métier en valeurs de formulaire (coordonnées → chaînes).
 * @param {object} agency
 * @returns {object}
 */
export const toAgencyFormValues = (agency = {}) => ({
  companyId: agency.companyId ?? '',
  name: agency.name ?? '',
  code: agency.code ?? '',
  type: agency.type ?? 'agence',
  description: agency.description ?? '',
  phone: agency.phone ?? '',
  email: agency.email ?? '',
  address: agency.address ?? '',
  city: agency.city ?? '',
  region: agency.region ?? '',
  country: agency.country ?? 'Côte d’Ivoire',
  postalCode: agency.postalCode ?? '',
  latitude: agency.latitude !== undefined && agency.latitude !== null ? String(agency.latitude) : '',
  longitude: agency.longitude !== undefined && agency.longitude !== null ? String(agency.longitude) : '',
  managerId: agency.managerId ?? '',
  status: agency.status ?? 'active',
  openingHours: agency.openingHours ?? 'Lun–Ven : 08h00–18h00, Sam : 08h00–12h00',
});

/**
 * Reconstruit le payload métier à partir des valeurs du formulaire
 * (coordonnées → Number, champs vides → undefined).
 * @param {object} values — valeurs du formulaire
 * @returns {object}
 */
export const toAgencyPayload = (values) => ({
  companyId: values.companyId,
  name: values.name,
  code: values.code,
  type: values.type,
  description: values.description || undefined,
  phone: values.phone || undefined,
  email: values.email || undefined,
  address: values.address || undefined,
  city: values.city,
  region: values.region || undefined,
  country: values.country,
  postalCode: values.postalCode || undefined,
  latitude: values.latitude !== '' ? Number(values.latitude) : undefined,
  longitude: values.longitude !== '' ? Number(values.longitude) : undefined,
  managerId: values.managerId || undefined,
  status: values.status,
  openingHours: values.openingHours || undefined,
});
