import { z } from 'zod';

const agencyStatusEnum = z.enum(['active', 'inactive', 'closed']);

export const createAgencySchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255).trim(),
  code: z.string().min(1, 'Le code est requis').max(50).trim().toUpperCase(),
  email: z.string().email('Email invalide').max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).default('Cameroun'),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  status: agencyStatusEnum.default('active'),
});

export const updateAgencySchema = z.object({
  name: z.string().min(1).max(255).trim().optional(),
  code: z.string().min(1).max(50).trim().toUpperCase().optional(),
  email: z.string().email().max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  status: agencyStatusEnum.optional(),
});

export const agencyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['name', 'code', 'status', 'created_at', 'updated_at']).default('created_at'),
  order: z.enum(['ASC', 'DESC', 'asc', 'desc']).default('DESC'),
  status: agencyStatusEnum.optional(),
  search: z.string().max(200).optional(),
  companyScopeId: z.string().optional(),
});

export const agencyIdParamSchema = z.object({
  id: z.string().min(26).max(26),
});
