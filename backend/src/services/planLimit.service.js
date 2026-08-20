import subscriptionRepository from '../repositories/SubscriptionRepository.js';
import { getPool } from '../database/index.js';
import { ForbiddenError } from '../errors/index.js';

async function getPlanLimits(companyId) {
  const sub = await subscriptionRepository.findActiveByCompanyId(companyId);
  if (!sub) return null;
  return {
    max_vehicles: sub.max_vehicles,
    max_drivers: sub.max_drivers,
    max_users: sub.max_users,
    max_agencies: sub.max_agencies,
    max_documents: sub.max_documents,
    max_storage_gb: sub.max_storage_gb,
    max_trips_per_month: sub.max_trips_per_month,
    max_fuel_records_per_month: sub.max_fuel_records_per_month,
    max_maintenance_records_per_month: sub.max_maintenance_records_per_month,
    plan_code: sub.plan_code,
    status: sub.status,
  };
}

async function getCount(table, companyId) {
  const [rows] = await getPool().query(
    `SELECT COUNT(*) as cnt FROM ${table} WHERE company_id = ? AND deleted_at IS NULL`,
    [companyId]
  );
  return rows[0]?.cnt || 0;
}

function checkLimit(current, max, resource) {
  if (max !== null && max !== undefined && current >= max) {
    throw new ForbiddenError(`Limite atteinte pour ${resource}. Plan actuel: ${max} maximum. Veuillez upgrader votre plan.`);
  }
}

export function checkSubscriptionActive(status) {
  if (status === 'suspended' || status === 'cancelled' || status === 'expired') {
    throw new ForbiddenError('Votre abonnement ne permet pas cette action. Veuillez vérifier votre statut d\'abonnement.');
  }
}

export async function canCreateVehicle(companyId) {
  const limits = await getPlanLimits(companyId);
  if (!limits) return;
  checkSubscriptionActive(limits.status);
  const count = await getCount('vehicles', companyId);
  checkLimit(count, limits.max_vehicles, 'véhicules');
}

export async function canCreateDriver(companyId) {
  const limits = await getPlanLimits(companyId);
  if (!limits) return;
  checkSubscriptionActive(limits.status);
  const count = await getCount('drivers', companyId);
  checkLimit(count, limits.max_drivers, 'chauffeurs');
}

export async function canCreateUser(companyId) {
  const limits = await getPlanLimits(companyId);
  if (!limits) return;
  checkSubscriptionActive(limits.status);
  const count = await getCount('users', companyId);
  checkLimit(count, limits.max_users, 'utilisateurs');
}

export async function canCreateTrip(companyId) {
  const limits = await getPlanLimits(companyId);
  if (!limits) return;
  checkSubscriptionActive(limits.status);
  if (limits.max_trips_per_month) {
    const [rows] = await getPool().query(
      "SELECT COUNT(*) as cnt FROM trips WHERE company_id = ? AND deleted_at IS NULL AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())",
      [companyId]
    );
    checkLimit(rows[0]?.cnt || 0, limits.max_trips_per_month, 'missions ce mois');
  }
}

export async function canCreateDocument(companyId) {
  const limits = await getPlanLimits(companyId);
  if (!limits) return;
  checkSubscriptionActive(limits.status);
  const count = await getCount('files', companyId);
  checkLimit(count, limits.max_documents, 'documents');
}

export async function getLimits(companyId) {
  return getPlanLimits(companyId);
}

export async function getRemainingLimits(companyId) {
  const limits = await getPlanLimits(companyId);
  if (!limits) return null;

  const vehicleCount = await getCount('vehicles', companyId);
  const driverCount = await getCount('drivers', companyId);
  const userCount = await getCount('users', companyId);

  return {
    vehicles: { used: vehicleCount, max: limits.max_vehicles, remaining: limits.max_vehicles !== null ? Math.max(0, limits.max_vehicles - vehicleCount) : null },
    drivers: { used: driverCount, max: limits.max_drivers, remaining: limits.max_drivers !== null ? Math.max(0, limits.max_drivers - driverCount) : null },
    users: { used: userCount, max: limits.max_users, remaining: limits.max_users !== null ? Math.max(0, limits.max_users - userCount) : null },
  };
}
