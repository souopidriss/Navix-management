import { z } from 'zod';
import { FUEL_TYPES, FUEL_STATUSES, PAYMENT_METHODS } from './index.js';

const positiveNumber = (message) =>
  z.coerce.number({ invalid_type_error: message }).min(0.01, message);

export const createFuelSchema = z.object({
  vehicleId: z.string().trim().min(1, 'Le véhicule est requis.'),
  driverId: z.string().trim().optional().default(''),
  tripId: z.string().trim().optional().default(''),
  fuelType: z.enum(FUEL_TYPES, { errorMap: () => ({ message: 'Type de carburant invalide.' }) }),
  stationName: z.string().trim().min(1, 'La station-service est requise.'),
  stationCity: z.string().trim().optional().default(''),
  quantity: positiveNumber('La quantité doit être supérieure à zéro.'),
  unitPrice: positiveNumber('Le prix unitaire doit être supérieur à zéro.'),
  mileage: z.coerce.number().int().min(0, 'Le kilométrage doit être positif ou nul.'),
  paymentMethod: z.enum(PAYMENT_METHODS, { errorMap: () => ({ message: 'Mode de paiement invalide.' }) }).optional().default('cash'),
  invoiceNumber: z.string().trim().optional().default(''),
  notes: z.string().trim().optional().default(''),
});

export const updateFuelSchema = z.object({
  vehicleId: z.string().trim().optional(),
  driverId: z.string().trim().optional(),
  tripId: z.string().trim().optional(),
  fuelType: z.enum(FUEL_TYPES).optional(),
  stationName: z.string().trim().optional(),
  stationCity: z.string().trim().optional(),
  quantity: z.coerce.number().min(0.01).optional(),
  unitPrice: z.coerce.number().min(0.01).optional(),
  mileage: z.coerce.number().int().min(0).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  invoiceNumber: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  status: z.enum(FUEL_STATUSES).optional(),
});

export const fuelQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['created_at', 'filled_at', 'quantity', 'unit_price', 'total_amount', 'mileage']).default('created_at'),
  order: z.enum(['ASC', 'DESC']).default('DESC'),
  vehicleId: z.string().trim().optional(),
  driverId: z.string().trim().optional(),
  tripId: z.string().trim().optional(),
  fuelType: z.enum(FUEL_TYPES).optional(),
  status: z.enum(FUEL_STATUSES).optional(),
  search: z.string().trim().optional(),
});

export const fuelIdParamSchema = z.object({
  id: z.string().trim().min(1, 'ID requis.'),
});
