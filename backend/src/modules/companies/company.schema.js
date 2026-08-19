import { z } from 'zod';

const MAX_CODE_LENGTH = 12;
const MAX_NAME_LENGTH = 200;

const codeRegex = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Le nom de l\'entreprise est requis').max(MAX_NAME_LENGTH),
  code: z
    .string()
    .max(MAX_CODE_LENGTH, `Le code ne peut pas dépasser ${MAX_CODE_LENGTH} caractères`)
    .regex(codeRegex, 'Le code ne peut contenir que des lettres, chiffres et tirets')
    .optional(),
  legal_name: z.string().max(200).optional(),
  trading_name: z.string().max(200).optional(),
  registration_number: z.string().max(100).optional(),
  tax_number: z.string().max(100).optional(),
  email: z.string().email('Email invalide').toLowerCase().trim().optional(),
  phone: z.string().max(30).optional(),
  website: z.string().url('URL invalide').optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  logo_url: z.string().url('URL invalide').optional(),
  max_users: z.number().int().min(1).optional(),
  max_vehicles: z.number().int().min(1).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export const updateCompanySchema = z.object({
  name: z.string().min(1).max(MAX_NAME_LENGTH).optional(),
  code: z
    .string()
    .min(1)
    .max(MAX_CODE_LENGTH)
    .regex(codeRegex, 'Le code ne peut contenir que des lettres, chiffres et tirets')
    .optional(),
  legal_name: z.string().max(200).optional(),
  trading_name: z.string().max(200).optional(),
  registration_number: z.string().max(100).optional(),
  tax_number: z.string().max(100).optional(),
  email: z.string().email('Email invalide').toLowerCase().trim().optional(),
  phone: z.string().max(30).optional(),
  website: z.string().url('URL invalide').optional().nullable(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  description: z.string().max(2000).optional().nullable(),
  logo_url: z.string().url('URL invalide').optional().nullable(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
  is_active: z.boolean().optional(),
  max_users: z.number().int().min(1).optional(),
  max_vehicles: z.number().int().min(1).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export const companyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['name', 'code', 'slug', 'status', 'created_at', 'updated_at']).default('created_at'),
  order: z.enum(['ASC', 'DESC', 'asc', 'desc']).default('DESC'),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
  search: z.string().max(200).optional(),
});

export const companyIdParamSchema = z.object({
  id: z.string().min(26, 'Identifiant invalide').max(26, 'Identifiant invalide'),
});
