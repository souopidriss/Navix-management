import { z } from 'zod';

const statusEnum = z.enum(['active', 'inactive', 'suspended', 'pending']);
const roleEnum = z.enum(['company_owner', 'company_admin', 'fleet_manager', 'dispatcher', 'driver', 'mechanic', 'accountant', 'viewer', 'client_enterprise', 'client_individual', 'partner']);

export const createUserSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis').max(100).trim(),
  lastName: z.string().min(1, 'Le nom est requis').max(100).trim(),
  email: z.string().email('Email invalide').max(255).trim().toLowerCase(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional(),
  phone: z.string().max(50).optional().nullable(),
  role: roleEnum.default('viewer'),
  agencyId: z.string().length(26).optional().nullable(),
  status: statusEnum.default('active'),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  email: z.string().email().max(255).trim().toLowerCase().optional(),
  phone: z.string().max(50).optional().nullable(),
  role: roleEnum.optional(),
  agencyId: z.string().length(26).optional().nullable(),
  status: statusEnum.optional(),
});

export const userQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['first_name', 'last_name', 'email', 'role', 'status', 'created_at', 'updated_at', 'last_login_at']).default('created_at'),
  order: z.enum(['ASC', 'DESC', 'asc', 'desc']).default('DESC'),
  status: statusEnum.optional(),
  role: roleEnum.optional(),
  search: z.string().max(200).optional(),
  companyScopeId: z.string().optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().min(26).max(26),
});
