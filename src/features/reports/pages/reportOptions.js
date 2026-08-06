/**
 * Navix Reports — Options de statuts (panneau de filtres)
 * --------------------------------------------------------------------------
 * Convertisseur des constantes de statuts des modules métier en options
 * FilterBar ({ value, label }) — aucune duplication.
 */
import { VEHICLE_STATUSES } from '@/features/vehicles/constants';
import { DRIVER_STATUSES } from '@/features/drivers/constants';
import { TRIP_STATUSES } from '@/features/trips/constants';
import { FUEL_STATUSES } from '@/features/fuel/constants';
import { MAINTENANCE_STATUSES } from '@/features/maintenance/constants';
import { ASSIGNMENT_STATUSES } from '@/features/assignments/constants';
import { INVOICE_STATUSES } from '@/features/billing/constants';
import { SUBSCRIPTION_STATUSES } from '@/features/subscriptions/constants';
import { COMPANY_STATUSES } from '@/features/companies/constants';

export const statusOptions = (statuses) =>
  Object.entries(statuses).map(([value, meta]) => ({ value, label: meta.label }));

export const VEHICLE_STATUS_OPTIONS = statusOptions(VEHICLE_STATUSES);
export const DRIVER_STATUS_OPTIONS = statusOptions(DRIVER_STATUSES);
export const TRIP_STATUS_OPTIONS = statusOptions(TRIP_STATUSES);
export const FUEL_STATUS_OPTIONS = statusOptions(FUEL_STATUSES);
export const MAINTENANCE_STATUS_OPTIONS = statusOptions(MAINTENANCE_STATUSES);
export const ASSIGNMENT_STATUS_OPTIONS = statusOptions(ASSIGNMENT_STATUSES);
export const INVOICE_STATUS_OPTIONS = statusOptions(INVOICE_STATUSES);
export const SUBSCRIPTION_STATUS_OPTIONS = statusOptions(SUBSCRIPTION_STATUSES);
export const COMPANY_STATUS_OPTIONS = statusOptions(COMPANY_STATUSES);
