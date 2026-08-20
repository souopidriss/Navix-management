import subscriptionPlanRepository from '../repositories/SubscriptionPlanRepository.js';
import { NotFoundError, ConflictError, ValidationError } from '../errors/index.js';
import { generateId } from '../utils/id.js';
import { recordAudit } from './audit.service.js';

function formatPlanResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    displayName: row.display_name,
    description: row.description || '',
    priceMonthly: Number(row.price_monthly) || 0,
    priceYearly: Number(row.price_yearly) || 0,
    currency: row.currency || 'XAF',
    maxVehicles: row.max_vehicles,
    maxDrivers: row.max_drivers,
    maxUsers: row.max_users,
    maxAgencies: row.max_agencies,
    maxDocuments: row.max_documents,
    maxStorageGb: row.max_storage_gb,
    maxTripsPerMonth: row.max_trips_per_month,
    maxFuelRecordsPerMonth: row.max_fuel_records_per_month,
    maxMaintenanceRecordsPerMonth: row.max_maintenance_records_per_month,
    features: typeof row.features === 'string' ? JSON.parse(row.features) : (row.features || []),
    trialDays: row.trial_days || 14,
    isPopular: !!row.is_popular,
    isActive: !!row.is_active,
    sortOrder: row.sort_order || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listPlans() {
  const plans = await subscriptionPlanRepository.findActivePlans();
  return plans.map(formatPlanResponse);
}

export async function getPlanById(id) {
  const plan = await subscriptionPlanRepository.findByIdWithFeatures(id);
  if (!plan) throw new NotFoundError('Plan');
  return formatPlanResponse(plan);
}

export async function getPlanByCode(code) {
  const plan = await subscriptionPlanRepository.findByCode(code);
  return formatPlanResponse(plan);
}

export async function createPlan(data, { userId } = {}) {
  if (!data.name || !data.code) {
    throw new ValidationError('Le nom et le code sont requis.');
  }

  const existing = await subscriptionPlanRepository.findByCode(data.code);
  if (existing) {
    throw new ConflictError('Un plan avec ce code existe déjà.');
  }

  const plan = await subscriptionPlanRepository.create({
    id: generateId(),
    name: data.name,
    code: data.code,
    display_name: data.displayName || data.name,
    description: data.description || null,
    price_monthly: data.priceMonthly || 0,
    price_yearly: data.priceYearly || 0,
    currency: data.currency || 'XAF',
    max_vehicles: data.maxVehicles ?? 5,
    max_drivers: data.maxDrivers ?? 5,
    max_users: data.maxUsers ?? 3,
    max_agencies: data.maxAgencies ?? 1,
    max_documents: data.maxDocuments ?? 100,
    max_storage_gb: data.maxStorageGb ?? 5,
    max_trips_per_month: data.maxTripsPerMonth ?? 50,
    max_fuel_records_per_month: data.maxFuelRecordsPerMonth ?? 50,
    max_maintenance_records_per_month: data.maxMaintenanceRecordsPerMonth ?? 50,
    features: data.features ? JSON.stringify(data.features) : '[]',
    trial_days: data.trialDays ?? 14,
    is_popular: data.isPopular ?? false,
    is_active: data.isActive ?? true,
    sort_order: data.sortOrder ?? 0,
  });

  if (userId) {
    recordAudit({ action: 'plan.create', actionType: 'CREATE', entityType: 'plan', entityId: plan.id, userId, description: `Plan ${data.code} créé` }).catch(() => {});
  }

  return formatPlanResponse(plan);
}

export async function updatePlan(id, data, { userId } = {}) {
  const existing = await subscriptionPlanRepository.findById(id);
  if (!existing) throw new NotFoundError('Plan');

  const payload = {};
  if (data.name) payload.name = data.name;
  if (data.displayName) payload.display_name = data.displayName;
  if (data.description !== undefined) payload.description = data.description;
  if (data.priceMonthly !== undefined) payload.price_monthly = data.priceMonthly;
  if (data.priceYearly !== undefined) payload.price_yearly = data.priceYearly;
  if (data.maxVehicles !== undefined) payload.max_vehicles = data.maxVehicles;
  if (data.maxDrivers !== undefined) payload.max_drivers = data.maxDrivers;
  if (data.maxUsers !== undefined) payload.max_users = data.maxUsers;
  if (data.maxAgencies !== undefined) payload.max_agencies = data.maxAgencies;
  if (data.maxDocuments !== undefined) payload.max_documents = data.maxDocuments;
  if (data.maxStorageGb !== undefined) payload.max_storage_gb = data.maxStorageGb;
  if (data.maxTripsPerMonth !== undefined) payload.max_trips_per_month = data.maxTripsPerMonth;
  if (data.maxFuelRecordsPerMonth !== undefined) payload.max_fuel_records_per_month = data.maxFuelRecordsPerMonth;
  if (data.maxMaintenanceRecordsPerMonth !== undefined) payload.max_maintenance_records_per_month = data.maxMaintenanceRecordsPerMonth;
  if (data.features !== undefined) payload.features = JSON.stringify(data.features);
  if (data.trialDays !== undefined) payload.trial_days = data.trialDays;
  if (data.isPopular !== undefined) payload.is_popular = data.isPopular;
  if (data.isActive !== undefined) payload.is_active = data.isActive;
  if (data.sortOrder !== undefined) payload.sort_order = data.sortOrder;

  if (Object.keys(payload).length === 0) {
    throw new ValidationError('Aucun champ à mettre à jour');
  }

  await subscriptionPlanRepository.update(id, payload);

  if (userId) {
    recordAudit({ action: 'plan.update', actionType: 'UPDATE', entityType: 'plan', entityId: id, userId, description: `Plan mis à jour`, newValues: payload }).catch(() => {});
  }

  return getPlanById(id);
}

export async function archivePlan(id, { userId } = {}) {
  const existing = await subscriptionPlanRepository.findById(id);
  if (!existing) throw new NotFoundError('Plan');
  await subscriptionPlanRepository.archive(id);

  if (userId) {
    recordAudit({ action: 'plan.archive', actionType: 'UPDATE', entityType: 'plan', entityId: id, userId, description: `Plan archivé` }).catch(() => {});
  }

  return getPlanById(id);
}
