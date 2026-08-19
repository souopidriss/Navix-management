import { z } from 'zod';

const statusEnum = z.enum(['active', 'on_mission', 'available', 'suspended', 'on_leave', 'inactive']);
const availabilityEnum = z.enum(['available', 'busy', 'unavailable']);
const genderEnum = z.enum(['male', 'female', 'other']);
const licenseCategoryEnum = z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createDriverSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis').max(100).trim(),
  lastName: z.string().min(1, 'Le nom est requis').max(100).trim(),
  gender: genderEnum.optional(),
  birthDate: z.string().regex(dateRegex, 'Format de date invalide (YYYY-MM-DD)').optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email('Email invalide').max(255).optional(),
  address: z.string().max(2000).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional().default('Cameroun'),
  nationality: z.string().max(100).optional(),
  licenseNumber: z.string().max(100).optional(),
  licenseCategory: licenseCategoryEnum.optional(),
  licenseIssueDate: z.string().regex(dateRegex, 'Format de date invalide (YYYY-MM-DD)').optional(),
  licenseExpiryDate: z.string().regex(dateRegex, 'Format de date invalide (YYYY-MM-DD)').optional(),
  yearsExperience: z.number().int().min(0).optional().default(0),
  employeeCode: z.string().min(1, 'Le code employé est requis').max(50).trim(),
  agencyId: z.string().min(26).max(26).optional().nullable(),
  status: statusEnum.default('active'),
  availability: availabilityEnum.default('available'),
  photoUrl: z.string().url('URL invalide').optional().nullable(),
  identityDocument: z.string().max(255).optional(),
  emergencyContactName: z.string().max(255).optional(),
  emergencyContactPhone: z.string().max(50).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateDriverSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  gender: genderEnum.optional(),
  birthDate: z.string().regex(dateRegex).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  address: z.string().max(2000).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  nationality: z.string().max(100).optional().nullable(),
  licenseNumber: z.string().max(100).optional().nullable(),
  licenseCategory: licenseCategoryEnum.optional().nullable(),
  licenseIssueDate: z.string().regex(dateRegex).optional().nullable(),
  licenseExpiryDate: z.string().regex(dateRegex).optional().nullable(),
  yearsExperience: z.number().int().min(0).optional(),
  employeeCode: z.string().min(1).max(50).trim().optional(),
  agencyId: z.string().min(26).max(26).optional().nullable(),
  status: statusEnum.optional(),
  availability: availabilityEnum.optional(),
  photoUrl: z.string().url().optional().nullable(),
  identityDocument: z.string().max(255).optional().nullable(),
  emergencyContactName: z.string().max(255).optional().nullable(),
  emergencyContactPhone: z.string().max(50).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const driverQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['first_name', 'last_name', 'full_name', 'status', 'availability', 'license_expiry_date', 'years_experience', 'created_at', 'updated_at']).default('created_at'),
  order: z.enum(['ASC', 'DESC', 'asc', 'desc']).default('DESC'),
  status: statusEnum.optional(),
  availability: availabilityEnum.optional(),
  licenseCategory: licenseCategoryEnum.optional(),
  agencyId: z.string().max(26).optional(),
  search: z.string().max(200).optional(),
});

export const driverIdParamSchema = z.object({
  id: z.string().min(26, 'Identifiant invalide').max(26, 'Identifiant invalide'),
});
