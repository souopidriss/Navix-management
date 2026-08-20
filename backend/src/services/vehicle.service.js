import vehicleRepository from '../repositories/VehicleRepository.js';
import { ConflictError, NotFoundError, ValidationError, BadRequestError } from '../errors/index.js';
import { recordAudit } from './audit.service.js';

const VALID_STATUS_TRANSITIONS = {
  available: ['in_use', 'maintenance', 'out_of_service'],
  in_use: ['available', 'maintenance', 'out_of_service'],
  maintenance: ['available', 'out_of_service'],
  out_of_service: ['available', 'maintenance'],
};

function normalizeVehiclePayload(data) {
  const out = {};
  const stringFields = ['registrationNumber', 'vin', 'engineNumber', 'brand', 'model', 'version', 'color', 'groupCode', 'category', 'vehicleTypeId', 'agencyId', 'notes', 'qrCode'];
  for (const f of stringFields) {
    if (data[f] !== undefined && data[f] !== null) {
      out[f] = typeof data[f] === 'string' ? data[f].trim() : data[f];
    }
  }
  const snakeMap = {
    registrationNumber: 'registration_number',
    fuelType: 'fuel_type',
    groupCode: 'group_code',
    vehicleTypeId: 'vehicle_type_id',
    agencyId: 'agency_id',
    purchaseDate: 'purchase_date',
    purchasePrice: 'purchase_price',
    insuranceExpiry: 'insurance_expiry',
    inspectionExpiry: 'inspection_expiry',
    registrationExpiry: 'registration_expiry',
    photoUrl: 'photo_url',
    qrCode: 'qr_code',
  };

  const directFields = ['year', 'color', 'capacity', 'mileage', 'status', 'fuelType', 'transmission', 'notes', 'isActive'];
  for (const f of directFields) {
    if (data[f] !== undefined) {
      out[f] = data[f];
    }
  }

  const result = {};
  for (const [key, value] of Object.entries(out)) {
    const dbKey = snakeMap[key] || key;
    result[dbKey] = value;
  }
  return result;
}

function formatVehicleResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    companyId: row.company_id,
    agencyId: row.agency_id,
    vehicleTypeId: row.vehicle_type_id,
    registrationNumber: row.registration_number,
    vin: row.vin,
    engineNumber: row.engine_number,
    brand: row.brand,
    model: row.model,
    version: row.version,
    year: row.year,
    color: row.color,
    fuelType: row.fuel_type,
    transmission: row.transmission,
    capacity: row.capacity,
    mileage: row.mileage,
    groupCode: row.group_code,
    category: row.category,
    typeName: row.type_name,
    typeDisplayName: row.type_display_name,
    groupName: row.group_name,
    groupDisplayName: row.group_display_name,
    status: row.status,
    purchaseDate: row.purchase_date,
    purchasePrice: row.purchase_price,
    insuranceExpiry: row.insurance_expiry,
    inspectionExpiry: row.inspection_expiry,
    registrationExpiry: row.registration_expiry,
    photoUrl: row.photo_url,
    qrCode: row.qr_code,
    notes: row.notes,
    isActive: !!row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createVehicle(data, { companyId }) {
  const payload = normalizeVehiclePayload(data);

  if (!payload.registration_number) {
    throw new ValidationError('Le numéro d\'immatriculation est requis');
  }
  if (!payload.brand) {
    throw new ValidationError('La marque est requise');
  }
  if (!payload.model) {
    throw new ValidationError('Le modèle est requis');
  }

  if (await vehicleRepository.registrationExists(companyId, payload.registration_number)) {
    throw new ConflictError('Un véhicule avec ce numéro d\'immatriculation existe déjà dans cette entreprise.');
  }

  if (payload.vin && await vehicleRepository.vinExists(payload.vin)) {
    throw new ConflictError('Un véhicule avec ce VIN existe déjà.');
  }

  const vehicle = await vehicleRepository.create({
    company_id: companyId,
    registration_number: payload.registration_number,
    vin: payload.vin || null,
    engine_number: payload.engine_number || null,
    brand: payload.brand,
    model: payload.model,
    version: payload.version || null,
    year: payload.year || null,
    color: payload.color || null,
    fuel_type: payload.fuel_type || 'diesel',
    transmission: payload.transmission || 'manuelle',
    capacity: payload.capacity || 5,
    mileage: payload.mileage || 0,
    group_code: payload.group_code || null,
    category: payload.category || null,
    vehicle_type_id: payload.vehicle_type_id || null,
    agency_id: payload.agency_id || null,
    status: payload.status || 'available',
    purchase_date: payload.purchase_date || null,
    purchase_price: payload.purchase_price || null,
    insurance_expiry: payload.insurance_expiry || null,
    inspection_expiry: payload.inspection_expiry || null,
    registration_expiry: payload.registration_expiry || null,
    photo_url: payload.photo_url || null,
    qr_code: payload.qr_code || null,
    notes: payload.notes || null,
    is_active: true,
  });

  await recordAudit({
    action: 'CREATE',
    actionType: 'creation',
    entityType: 'vehicle',
    entityId: vehicle.id,
    description: `Véhicule créé: ${payload.brand} ${payload.model} (${payload.registration_number})`,
    newValues: { registrationNumber: payload.registration_number, brand: payload.brand, model: payload.model, status: payload.status || 'available' },
    companyId,
  });

  const full = await vehicleRepository.findByIdWithDetails(vehicle.id);
  return formatVehicleResponse(full);
}

export async function getVehicleById(id, { companyId }) {
  const vehicle = await vehicleRepository.findByCompanyIdAndId(companyId, id);
  if (!vehicle) {
    throw new NotFoundError('Véhicule');
  }
  return formatVehicleResponse(vehicle);
}

export async function listVehicles({ page, limit, sort, order, status, groupCode, fuelType, transmission, brand, search }, { companyId }) {
  const filters = {};
  if (status) filters.status = status;
  if (groupCode) filters.group_code = groupCode;
  if (fuelType) filters.fuel_type = fuelType;
  if (transmission) filters.transmission = transmission;
  if (brand) filters.brand = brand;

  let result;
  if (search) {
    result = await vehicleRepository.search(companyId, search, {
      page: page || 1,
      limit: limit || 20,
      sort: sort || 'created_at',
      order: order || 'DESC',
    });
  } else {
    result = await vehicleRepository.findByCompanyId(companyId, {
      page: page || 1,
      limit: limit || 20,
      filters,
      sort: sort || 'created_at',
      order: order || 'DESC',
    });
  }

  return {
    vehicles: result.rows.map(formatVehicleResponse),
    pagination: {
      page: page || 1,
      limit: limit || 20,
      total: result.total,
      totalPages: Math.ceil(result.total / (limit || 20)),
    },
  };
}

export async function updateVehicle(id, data, { companyId }) {
  const existing = await vehicleRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) {
    throw new NotFoundError('Véhicule');
  }

  const payload = normalizeVehiclePayload(data);

  if (payload.registration_number && await vehicleRepository.registrationExists(companyId, payload.registration_number, id)) {
    throw new ConflictError('Un véhicule avec ce numéro d\'immatriculation existe déjà dans cette entreprise.');
  }

  if (payload.vin && await vehicleRepository.vinExists(payload.vin, id)) {
    throw new ConflictError('Un véhicule avec ce VIN existe déjà.');
  }

  if (payload.status && payload.status !== existing.status) {
    const allowed = VALID_STATUS_TRANSITIONS[existing.status];
    if (!allowed || !allowed.includes(payload.status)) {
      throw new BadRequestError(
        `Transition de statut invalide : ${existing.status} → ${payload.status}`
      );
    }
  }

  if (Object.keys(payload).length === 0) {
    throw new ValidationError('Aucun champ à mettre à jour');
  }

  await vehicleRepository.update(id, payload);
  await recordAudit({
    action: 'UPDATE',
    actionType: 'modification',
    entityType: 'vehicle',
    entityId: id,
    description: `Véhicule mis à jour: ${existing.registration_number}`,
    companyId,
  });

  const full = await vehicleRepository.findByIdWithDetails(id);
  return formatVehicleResponse(full);
}

export async function deleteVehicle(id, { companyId }) {
  const existing = await vehicleRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) {
    throw new NotFoundError('Véhicule');
  }

  const dependencies = await vehicleRepository.findDependencies(id);
  if (dependencies.length > 0) {
    const depNames = dependencies.map((d) => `${d.table} (${d.count})`).join(', ');
    throw new BadRequestError(
      `Impossible de supprimer ce véhicule. Il est associé à : ${depNames}`
    );
  }

  await vehicleRepository.softDelete(id);
  await recordAudit({
    action: 'DELETE',
    actionType: 'suppression',
    entityType: 'vehicle',
    entityId: id,
    description: `Véhicule supprimé: ${existing.registration_number}`,
    companyId,
  });

  return { message: 'Véhicule supprimé avec succès.' };
}

export async function getVehicleStats({ companyId }) {
  const stats = await vehicleRepository.getStats(companyId);
  const groupStats = await vehicleRepository.getGroupStats(companyId);
  return { ...stats, byGroup: groupStats };
}

export async function changeVehicleStatus(id, newStatus, { companyId }) {
  const existing = await vehicleRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) {
    throw new NotFoundError('Véhicule');
  }

  const allowed = VALID_STATUS_TRANSITIONS[existing.status];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new BadRequestError(
      `Transition de statut invalide : ${existing.status} → ${newStatus}`
    );
  }

  await vehicleRepository.update(id, { status: newStatus });
  await recordAudit({
    action: 'UPDATE',
    actionType: 'modification',
    entityType: 'vehicle',
    entityId: id,
    description: `Statut changé: ${existing.status} → ${newStatus} (${existing.registration_number})`,
    oldValues: { status: existing.status },
    newValues: { status: newStatus },
    companyId,
  });

  const full = await vehicleRepository.findByIdWithDetails(id);
  return formatVehicleResponse(full);
}
