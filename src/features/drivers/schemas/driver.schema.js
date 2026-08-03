/**
 * Navix Drivers — Schéma de validation Zod du formulaire Chauffeur
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate). Le contrôle
 * d'unicité du code employé est simulé côté formulaire (compare avec les
 * chauffeurs déjà chargés) puis réappliqué par le service (409).
 * Les dates sont saisies via <input type="date"> (format 'yyyy-mm-dd').
 */
import { z } from 'zod';
import {
  DRIVER_STATUS_VALUES,
  DRIVER_AVAILABILITY_VALUES,
  LICENSE_CATEGORY_VALUES,
  GENDER_VALUES,
} from '../constants';

const optionalUrl = (message) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || z.string().url().safeParse(value).success, message);

const requiredDate = (message) =>
  z.string().trim().refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), message);

const optionalDate = (message) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), message);

export const driverSchema = z.object({
  firstName: z.string().trim().min(1, 'Le prénom est requis.'),
  lastName: z.string().trim().min(1, 'Le nom est requis.'),
  gender: z.enum(GENDER_VALUES, { errorMap: () => ({ message: 'Genre invalide.' }) }),
  birthDate: requiredDate('La date de naissance est requise.'),
  phone: z
    .string()
    .trim()
    .min(1, 'Le téléphone est requis.')
    .min(8, 'Numéro de téléphone invalide.'),
  email: z.string().trim().min(1, 'L’email est requis.').email('Adresse email invalide.'),
  companyId: z.string().trim().min(1, 'L’entreprise est requise.'),
  agencyId: z.string().trim().min(1, 'L’agence est requise.'),
  employeeCode: z.string().trim().min(1, 'Le code employé est requis.'),
  licenseNumber: z.string().trim().min(1, 'Le numéro de permis est requis.'),
  licenseCategory: z.enum(LICENSE_CATEGORY_VALUES, { errorMap: () => ({ message: 'Catégorie invalide.' }) }),
  licenseIssueDate: optionalDate('Date de délivrance invalide.').optional(),
  licenseExpiryDate: requiredDate('La date d’expiration du permis est requise.'),
  yearsExperience: z.coerce
    .number({ invalid_type_error: 'Expérience invalide.' })
    .int('Expérience invalide.')
    .min(0, 'L’expérience doit être positive ou nulle.'),
  status: z.enum(DRIVER_STATUS_VALUES, { errorMap: () => ({ message: 'Statut invalide.' }) }),
  availability: z.enum(DRIVER_AVAILABILITY_VALUES, { errorMap: () => ({ message: 'Disponibilité invalide.' }) }),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  country: z.string().trim().optional(),
  nationality: z.string().trim().optional(),
  photo: optionalUrl('URL de la photo invalide.').optional(),
  identityDocument: z.string().trim().optional(),
  emergencyContactName: z.string().trim().optional(),
  emergencyContactPhone: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const driverDefaultValues = {
  firstName: '',
  lastName: '',
  gender: 'male',
  birthDate: '',
  phone: '',
  email: '',
  companyId: '',
  agencyId: '',
  employeeCode: '',
  licenseNumber: '',
  licenseCategory: '',
  licenseIssueDate: '',
  licenseExpiryDate: '',
  yearsExperience: 0,
  status: 'active',
  availability: 'available',
  address: '',
  city: '',
  country: '',
  nationality: '',
  photo: '',
  identityDocument: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  notes: '',
};

/**
 * Aplatit le modèle métier en valeurs de formulaire.
 * @param {object} driver
 * @returns {object}
 */
export const toDriverFormValues = (driver = {}) => ({
  firstName: driver.firstName ?? '',
  lastName: driver.lastName ?? '',
  gender: driver.gender ?? 'male',
  birthDate: driver.birthDate ?? '',
  phone: driver.phone ?? '',
  email: driver.email ?? '',
  companyId: driver.companyId ?? '',
  agencyId: driver.agencyId ?? '',
  employeeCode: driver.employeeCode ?? '',
  licenseNumber: driver.licenseNumber ?? '',
  licenseCategory: driver.licenseCategory ?? '',
  licenseIssueDate: driver.licenseIssueDate ?? '',
  licenseExpiryDate: driver.licenseExpiryDate ?? '',
  yearsExperience: driver.yearsExperience ?? 0,
  status: driver.status ?? 'active',
  availability: driver.availability ?? 'available',
  address: driver.address ?? '',
  city: driver.city ?? '',
  country: driver.country ?? '',
  nationality: driver.nationality ?? '',
  photo: driver.photo ?? '',
  identityDocument: driver.identityDocument ?? '',
  emergencyContactName: driver.emergencyContactName ?? '',
  emergencyContactPhone: driver.emergencyContactPhone ?? '',
  notes: driver.notes ?? '',
});

/**
 * Reconstruit le payload métier à partir des valeurs du formulaire.
 * @param {object} values — valeurs du formulaire
 * @returns {object}
 */
export const toDriverPayload = (values) => ({
  firstName: values.firstName,
  lastName: values.lastName,
  gender: values.gender,
  birthDate: values.birthDate,
  phone: values.phone,
  email: values.email,
  companyId: values.companyId,
  agencyId: values.agencyId,
  employeeCode: values.employeeCode,
  licenseNumber: values.licenseNumber,
  licenseCategory: values.licenseCategory,
  licenseIssueDate: values.licenseIssueDate,
  licenseExpiryDate: values.licenseExpiryDate,
  yearsExperience: values.yearsExperience,
  status: values.status,
  availability: values.availability,
  address: values.address,
  city: values.city,
  country: values.country,
  nationality: values.nationality,
  photo: values.photo,
  identityDocument: values.identityDocument,
  emergencyContactName: values.emergencyContactName,
  emergencyContactPhone: values.emergencyContactPhone,
  notes: values.notes,
});
