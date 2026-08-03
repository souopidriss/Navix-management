/**
 * Navix Fuel — Schémas de validation Zod des formulaires de carburant
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate). Champs obligatoires :
 * entreprise, véhicule, type de carburant, station, quantité (> 0), prix
 * unitaire (> 0) et kilométrage (> 0). Le montant total (totalCost) et la
 * consommation moyenne sont calculés automatiquement par le service (mock).
 * Le véhicule et l'entreprise déterminent les options des listes liées
 * (chauffeur, trajet).
 */
import { z } from 'zod';
import { FUEL_TYPE_VALUES, PAYMENT_METHOD_VALUES } from '../constants';

const positiveNumber = (message) =>
  z.coerce
    .number({ invalid_type_error: message })
    .min(0.01, message);

export const fuelSchema = z.object({
  companyId: z.string().trim().min(1, 'L’entreprise est requise.'),
  vehicleId: z.string().trim().min(1, 'Le véhicule est requis.'),
  driverId: z.string().trim().optional(),
  tripId: z.string().trim().optional(),
  fuelType: z.enum(FUEL_TYPE_VALUES, {
    errorMap: () => ({ message: 'Type de carburant invalide.' }),
  }),
  stationName: z.string().trim().min(1, 'La station-service est requise.'),
  stationCity: z.string().trim().optional(),
  quantity: positiveNumber('La quantité doit être supérieure à zéro.'),
  unitPrice: positiveNumber('Le prix unitaire doit être supérieur à zéro.'),
  mileage: positiveNumber('Le kilométrage est requis et doit être supérieur à zéro.'),
  paymentMethod: z.enum(PAYMENT_METHOD_VALUES, {
    errorMap: () => ({ message: 'Mode de paiement invalide.' }),
  }),
  invoiceNumber: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const fuelDefaultValues = {
  companyId: '',
  vehicleId: '',
  driverId: '',
  tripId: '',
  fuelType: '',
  stationName: '',
  stationCity: '',
  quantity: '',
  unitPrice: '',
  mileage: '',
  paymentMethod: '',
  invoiceNumber: '',
  notes: '',
};

/** Aplatit le modèle métier en valeurs de formulaire (création / édition). */
export const toFuelFormValues = (fuel = {}) => ({
  companyId: fuel.companyId ?? '',
  vehicleId: fuel.vehicleId ?? '',
  driverId: fuel.driverId ?? '',
  tripId: fuel.tripId ?? '',
  fuelType: fuel.fuelType ?? '',
  stationName: fuel.stationName ?? '',
  stationCity: fuel.stationCity ?? '',
  quantity: fuel.quantity ?? '',
  unitPrice: fuel.unitPrice ?? '',
  mileage: fuel.mileage ?? '',
  paymentMethod: fuel.paymentMethod ?? '',
  invoiceNumber: fuel.invoiceNumber ?? '',
  notes: fuel.notes ?? '',
});

/**
 * Reconstruit le payload métier à partir des valeurs du formulaire.
 * Le montant total est calculé automatiquement (quantité × prix unitaire) ;
 * la consommation moyenne est recalculée par le service (mock).
 */
export const toFuelPayload = (values) => ({
  companyId: values.companyId,
  vehicleId: values.vehicleId,
  driverId: values.driverId || '',
  tripId: values.tripId || '',
  fuelType: values.fuelType,
  stationName: values.stationName,
  stationCity: values.stationCity || '',
  quantity: Number(values.quantity),
  unitPrice: Number(values.unitPrice),
  totalCost: Math.round(Number(values.quantity) * Number(values.unitPrice) * 100) / 100,
  mileage: Number(values.mileage),
  paymentMethod: values.paymentMethod,
  invoiceNumber: values.invoiceNumber || '',
  notes: values.notes || '',
});
