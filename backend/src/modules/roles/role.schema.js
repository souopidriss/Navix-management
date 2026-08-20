import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100).trim(),
  code: z.string().min(1, 'Le code est requis').max(100).trim().toLowerCase(),
  displayName: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).optional().nullable(),
  companyId: z.string().length(26).optional().nullable(),
  permissions: z.array(z.string()).optional().default([]),
  isActive: z.boolean().default(true),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  code: z.string().min(1).max(100).trim().toLowerCase().optional(),
  displayName: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).optional().nullable(),
  companyId: z.string().length(26).optional().nullable(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const roleQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sort: z.enum(['name', 'code', 'is_active', 'created_at', 'updated_at']).default('created_at'),
  order: z.enum(['ASC', 'DESC', 'asc', 'desc']).default('DESC'),
  search: z.string().max(200).optional(),
  is_active: z.coerce.boolean().optional(),
  type: z.enum(['system', 'custom']).optional(),
  companyScopeId: z.string().optional(),
});

export const roleIdParamSchema = z.object({
  id: z.string().min(26).max(26),
});

export const assignPermissionsSchema = z.object({
  permissionCodes: z.array(z.string()).default([]),
});
