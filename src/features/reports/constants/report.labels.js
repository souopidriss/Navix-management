/**
 * Navix Reports — Badges des statuts (mapping cross-modules)
 * --------------------------------------------------------------------------
 * Source unique de vérité des libellés/variantes de statuts affichés dans
 * les rapports. Délègue aux constantes métier de chaque module (aucune
 * duplication). Retourne toujours { label, variant } avec repli sûr.
 */
import { getVehicleStatus, getVehicleGroup, getFuelType as getVehicleFuelType } from '@/features/vehicles/constants';
import { getDriverStatus, getDriverAvailability } from '@/features/drivers/constants';
import { getTripType, getTripStatus } from '@/features/trips/constants';
import { getFuelType, getFuelStatus } from '@/features/fuel/constants';
import {
  getMaintenanceType,
  getMaintenancePriority,
  getMaintenanceStatus,
} from '@/features/maintenance/constants';
import { getAssignmentType, getAssignmentStatus } from '@/features/assignments/constants';
import { getInvoiceStatus } from '@/features/billing/constants';
import { getSubscriptionStatus } from '@/features/subscriptions/constants';
import { getAuditStatus, getAuditSeverity } from '@/features/audit/constants';
import {
  getCompanyStatus,
  getSubscriptionStatus as getCompanySubscriptionStatus,
} from '@/features/companies/constants';

const toLabel = (meta, value) => ({
  label: meta?.label ?? value,
  variant: meta?.variant ?? 'secondary',
});

/** Mapping centralisé : chaque entrée = (value) => { label, variant }. */
export const reportBadges = {
  vehicleGroup: (value) => toLabel(getVehicleGroup(value), value),
  vehicleStatus: (value) => toLabel(getVehicleStatus(value), value),
  vehicleFuel: (value) => toLabel(getVehicleFuelType(value), value),
  driverStatus: (value) => toLabel(getDriverStatus(value), value),
  driverAvailability: (value) => toLabel(getDriverAvailability(value), value),
  tripType: (value) => toLabel(getTripType(value), value),
  tripStatus: (value) => toLabel(getTripStatus(value), value),
  fuelType: (value) => toLabel(getFuelType(value), value),
  fuelStatus: (value) => toLabel(getFuelStatus(value), value),
  maintenanceType: (value) => toLabel(getMaintenanceType(value), value),
  maintenancePriority: (value) => toLabel(getMaintenancePriority(value), value),
  maintenanceStatus: (value) => toLabel(getMaintenanceStatus(value), value),
  assignmentType: (value) => toLabel(getAssignmentType(value), value),
  assignmentStatus: (value) => toLabel(getAssignmentStatus(value), value),
  invoiceStatus: (value) => toLabel(getInvoiceStatus(value), value),
  subscriptionStatus: (value) => toLabel(getSubscriptionStatus(value), value),
  auditStatus: (value) => toLabel(getAuditStatus(value), value),
  auditSeverity: (value) => toLabel(getAuditSeverity(value), value),
  companyStatus: (value) => toLabel(getCompanyStatus(value), value),
  companySubscriptionStatus: (value) => toLabel(getCompanySubscriptionStatus(value), value),
};

/** Options de statuts pour le panneau de filtres d'une catégorie. */
export const statusFilterOptions = (entries) =>
  entries.map(([value, meta]) => ({ value, label: meta.label }));
