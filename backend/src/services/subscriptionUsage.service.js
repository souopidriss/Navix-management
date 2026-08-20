import { getPool } from '../database/index.js';
import subscriptionRepository from '../repositories/SubscriptionRepository.js';

export async function getUsage(companyId) {
  const [vehicles] = await getPool().query(
    "SELECT COUNT(*) as cnt FROM vehicles WHERE company_id = ? AND deleted_at IS NULL", [companyId]
  );
  const [drivers] = await getPool().query(
    "SELECT COUNT(*) as cnt FROM drivers WHERE company_id = ? AND deleted_at IS NULL", [companyId]
  );
  const [users] = await getPool().query(
    "SELECT COUNT(*) as cnt FROM users WHERE company_id = ? AND deleted_at IS NULL", [companyId]
  );
  const [trips] = await getPool().query(
    "SELECT COUNT(*) as cnt FROM trips WHERE company_id = ? AND deleted_at IS NULL", [companyId]
  );
  const [fuelRecords] = await getPool().query(
    "SELECT COUNT(*) as cnt FROM fuel_records WHERE company_id = ? AND deleted_at IS NULL", [companyId]
  );
  const [maintenanceRecords] = await getPool().query(
    "SELECT COUNT(*) as cnt FROM maintenance_records WHERE company_id = ? AND deleted_at IS NULL", [companyId]
  );

  return {
    companyId,
    vehiclesUsed: vehicles[0]?.cnt || 0,
    driversUsed: drivers[0]?.cnt || 0,
    usersUsed: users[0]?.cnt || 0,
    tripsUsed: trips[0]?.cnt || 0,
    fuelRecordsUsed: fuelRecords[0]?.cnt || 0,
    maintenanceRecordsUsed: maintenanceRecords[0]?.cnt || 0,
    updatedAt: new Date().toISOString(),
  };
}

export async function getUsageWithLimits(companyId) {
  const usage = await getUsage(companyId);
  const sub = await subscriptionRepository.findActiveByCompanyId(companyId);

  if (!sub) {
    return { usage, limits: null, plan: null, percentages: {} };
  }

  const limits = {
    maxVehicles: sub.max_vehicles,
    maxDrivers: sub.max_drivers,
    maxUsers: sub.max_users,
    maxAgencies: sub.max_agencies,
    maxDocuments: sub.max_documents,
    maxStorageGb: sub.max_storage_gb,
    maxTripsPerMonth: sub.max_trips_per_month,
    maxFuelRecordsPerMonth: sub.max_fuel_records_per_month,
    maxMaintenanceRecordsPerMonth: sub.max_maintenance_records_per_month,
  };

  const percentages = {};
  if (limits.maxVehicles > 0) percentages.vehicles = Math.min(100, Math.round((usage.vehiclesUsed / limits.maxVehicles) * 100));
  if (limits.maxDrivers > 0) percentages.drivers = Math.min(100, Math.round((usage.driversUsed / limits.maxDrivers) * 100));
  if (limits.maxUsers > 0) percentages.users = Math.min(100, Math.round((usage.usersUsed / limits.maxUsers) * 100));
  if (limits.maxTripsPerMonth > 0) percentages.trips = Math.min(100, Math.round((usage.tripsUsed / limits.maxTripsPerMonth) * 100));

  return {
    usage,
    limits,
    plan: { code: sub.plan_code, name: sub.plan_display_name },
    percentages,
  };
}
