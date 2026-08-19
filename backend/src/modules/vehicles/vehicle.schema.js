import { z } from 'zod';

const currentYear = new Date().getFullYear();
const MIN_YEAR = 1980;

const fuelTypeEnum = z.enum(['diesel', 'essence', 'hybride', 'electrique']);
const transmissionEnum = z.enum(['manuelle', 'automatique']);
const statusEnum = z.enum(['available', 'in_use', 'maintenance', 'out_of_service']);
const groupCodeEnum = z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']);

export const createVehicleSchema = z.object({
  registrationNumber: z.string().min(3, 'Le numéro d\'immatriculation est requis').max(50).trim().toUpperCase(),
  vin: z.string().length(17, 'Le VIN doit contenir exactement 17 caractères').toUpperCase().optional(),
  engineNumber: z.string().max(100).optional(),
  brand: z.string().min(1, 'La marque est requise').max(100).trim(),
  model: z.string().min(1, 'Le modèle est requis').max(100).trim(),
  version: z.string().max(100).optional(),
  year: z.number().int().min(MIN_YEAR, `L'année minimum est ${MIN_YEAR}`).max(currentYear + 1).optional(),
  color: z.string().max(50).optional(),
  fuelType: fuelTypeEnum.default('diesel'),
  transmission: transmissionEnum.default('manuelle'),
  capacity: z.number().int().min(0).optional().default(5),
  mileage: z.number().int().min(0).optional().default(0),
  groupCode: groupCodeEnum.optional(),
  category: z.string().max(100).optional(),
  vehicleTypeId: z.string().min(26).max(26).optional(),
  agencyId: z.string().min(26).max(26).optional().nullable(),
  status: statusEnum.default('available'),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)').optional(),
  purchasePrice: z.number().min(0).optional(),
  insuranceExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)').optional(),
  inspectionExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)').optional(),
  registrationExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)').optional(),
  photoUrl: z.string().url('URL invalide').optional().nullable(),
  qrCode: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateVehicleSchema = z.object({
  registrationNumber: z.string().min(3).max(50).trim().toUpperCase().optional(),
  vin: z.string().length(17).toUpperCase().optional().nullable(),
  engineNumber: z.string().max(100).optional().nullable(),
  brand: z.string().min(1).max(100).trim().optional(),
  model: z.string().min(1).max(100).trim().optional(),
  version: z.string().max(100).optional().nullable(),
  year: z.number().int().min(MIN_YEAR).max(currentYear + 1).optional(),
  color: z.string().max(50).optional().nullable(),
  fuelType: fuelTypeEnum.optional(),
  transmission: transmissionEnum.optional(),
  capacity: z.number().int().min(0).optional(),
  mileage: z.number().int().min(0).optional(),
  groupCode: groupCodeEnum.optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  vehicleTypeId: z.string().min(26).max(26).optional().nullable(),
  agencyId: z.string().min(26).max(26).optional().nullable(),
  status: statusEnum.optional(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  purchasePrice: z.number().min(0).optional().nullable(),
  insuranceExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  inspectionExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  registrationExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  qrCode: z.string().max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const vehicleQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['brand', 'model', 'year', 'mileage', 'status', 'fuel_type', 'group_code', 'created_at', 'updated_at']).default('created_at'),
  order: z.enum(['ASC', 'DESC', 'asc', 'desc']).default('DESC'),
  status: statusEnum.optional(),
  groupCode: groupCodeEnum.optional(),
  fuelType: fuelTypeEnum.optional(),
  transmission: transmissionEnum.optional(),
  brand: z.string().max(100).optional(),
  search: z.string().max(200).optional(),
});

export const vehicleIdParamSchema = z.object({
  id: z.string().min(26, 'Identifiant invalide').max(26, 'Identifiant invalide'),
});
