/**
 * Navix Users — Schémas de validation Zod
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate).
 *  - userSchema  : création / modification d'un utilisateur
 *  - roleSchema  : création / modification d'un rôle
 *  - filters     : normalisation de l'état de filtrage des listes
 */
import { z } from 'zod';
import {
  USER_STATUS_VALUES,
  ROLE_STATUS_VALUES,
  PAGE_SIZE_OPTIONS,
} from '../constants';

const optionalPhone = (message) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || /^[0-9+()\-. ]{6,20}$/.test(value), message);

export const userSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'Le prénom est requis.')
    .min(2, 'Le prénom doit contenir au moins 2 caractères.'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Le nom est requis.')
    .min(2, 'Le nom doit contenir au moins 2 caractères.'),
  email: z.string().trim().email('Adresse email invalide.'),
  phone: optionalPhone('Numéro de téléphone invalide.'),
  jobTitle: z.string().trim().max(120, 'Le poste est trop long.').optional(),
  companyId: z.string().trim().min(1, 'L’entreprise est requise.'),
  agencyId: z.string().trim().optional(),
  roleIds: z.array(z.string().trim().min(1)).min(1, 'Au moins un rôle est requis.'),
  status: z.enum(USER_STATUS_VALUES, { errorMap: () => ({ message: 'Statut invalide.' }) }),
});

export const userDefaultValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
  companyId: '',
  agencyId: '',
  roleIds: [],
  status: 'active',
};

/** Aplatit un utilisateur en valeurs de formulaire. */
export const toUserFormValues = (user = {}) => ({
  firstName: user.firstName ?? '',
  lastName: user.lastName ?? '',
  email: user.email ?? '',
  phone: user.phone ?? '',
  jobTitle: user.jobTitle ?? '',
  companyId: user.companyId ?? '',
  agencyId: user.agencyId ?? '',
  roleIds: Array.isArray(user.roleIds) ? [...user.roleIds] : [],
  status: user.status ?? 'active',
});

/** Reconstruit le payload métier (champs vides → undefined). */
export const toUserPayload = (values) => ({
  firstName: values.firstName,
  lastName: values.lastName,
  email: values.email,
  phone: values.phone || undefined,
  jobTitle: values.jobTitle || undefined,
  companyId: values.companyId,
  agencyId: values.agencyId || undefined,
  roleIds: values.roleIds,
  status: values.status,
});

/* --------------------------------------------------------------------------
   Rôle
   -------------------------------------------------------------------------- */

export const roleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Le nom du rôle est requis.')
    .min(2, 'Le nom doit contenir au moins 2 caractères.'),
  code: z
    .string()
    .trim()
    .min(1, 'Le code est requis.')
    .max(32, 'Le code ne doit pas dépasser 32 caractères.')
    .regex(/^[a-z][a-z0-9_]*$/, 'Code invalide (minuscules, chiffres, tirets bas).'),
  description: z.string().trim().max(255, 'Description trop longue.').optional(),
  companyId: z.string().trim().optional(),
  permissions: z.array(z.string().trim().min(1)).min(1, 'Au moins une permission est requise.'),
  isActive: z.enum(ROLE_STATUS_VALUES, { errorMap: () => ({ message: 'Statut invalide.' }) }),
});

export const roleDefaultValues = {
  name: '',
  code: '',
  description: '',
  companyId: '',
  permissions: [],
  isActive: 'active',
};

/** Aplatit un rôle en valeurs de formulaire. */
export const toRoleFormValues = (role = {}) => ({
  name: role.name ?? '',
  code: role.code ?? '',
  description: role.description ?? '',
  companyId: role.companyId ?? '',
  permissions: Array.isArray(role.permissions) ? [...role.permissions] : [],
  isActive: role.isActive ? 'active' : 'inactive',
});

/** Reconstruit le payload métier d'un rôle. */
export const toRolePayload = (values) => ({
  name: values.name,
  code: values.code,
  description: values.description || undefined,
  companyId: values.companyId || '',
  permissions: values.permissions,
  isActive: values.isActive === 'active',
});

/* --------------------------------------------------------------------------
   Filtres
   -------------------------------------------------------------------------- */

export const userFiltersSchema = z.object({
  search: z.string().trim().max(120, 'Recherche trop longue.'),
  companyId: z.string().optional(),
  agencyId: z.string().optional(),
  roleId: z.string().optional(),
  status: z.union([z.enum(USER_STATUS_VALUES), z.literal('')]).optional(),
  createdAtFrom: z.string().optional(),
  createdAtTo: z.string().optional(),
  lastLoginFrom: z.string().optional(),
  lastLoginTo: z.string().optional(),
});

export const userFilterDefaultValues = {
  search: '',
  companyId: '',
  agencyId: '',
  roleId: '',
  status: '',
  createdAtFrom: '',
  createdAtTo: '',
  lastLoginFrom: '',
  lastLoginTo: '',
};

/** Normalise un état de filtres arbitraire en état valide. */
export const sanitizeUserFilters = (values = {}) => {
  const parsed = userFiltersSchema.safeParse({ ...userFilterDefaultValues, ...values });
  return parsed.success ? parsed.data : userFilterDefaultValues;
};

export const roleFiltersSchema = z.object({
  search: z.string().trim().max(120, 'Recherche trop longue.'),
  companyId: z.string().optional(),
  type: z.union([z.enum(['system', 'custom']), z.literal('')]).optional(),
  status: z.union([z.enum(ROLE_STATUS_VALUES), z.literal('')]).optional(),
});

export const roleFilterDefaultValues = {
  search: '',
  companyId: '',
  type: '',
  status: '',
};

export const sanitizeRoleFilters = (values = {}) => {
  const parsed = roleFiltersSchema.safeParse({ ...roleFilterDefaultValues, ...values });
  return parsed.success ? parsed.data : roleFilterDefaultValues;
};

export const usersPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z
    .number()
    .int()
    .refine((value) => PAGE_SIZE_OPTIONS.includes(value), { message: 'Taille de page invalide.' })
    .default(10),
});
