import fuelRepository from '../repositories/FuelRepository.js';
import vehicleRepository from '../repositories/VehicleRepository.js';
import driverRepository from '../repositories/DriverRepository.js';
import tripRepository from '../repositories/TripRepository.js';
import { getPool } from '../database/index.js';
import { NotFoundError, ConflictError, ValidationError } from '../errors/index.js';
import { VALID_STATUS_TRANSITIONS } from '../modules/fuel/index.js';

function formatFuelResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    companyId: row.company_id,
    vehicleId: row.vehicle_id,
    driverId: row.driver_id || '',
    tripId: row.trip_id || '',
    fuelNumber: row.fuel_number,
    fuelType: row.fuel_type,
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    totalCost: Number(row.total_amount),
    currency: row.currency,
    mileage: row.mileage,
    station: row.station || '',
    stationName: row.station_name || row.station || '',
    stationCity: row.station_city || '',
    paymentMethod: row.payment_method || 'cash',
    invoiceNumber: row.invoice_number || '',
    receiptImage: row.receipt_image || '',
    status: row.status,
    notes: row.notes || '',
    createdBy: row.created_by || '',
    vehicleRegistration: row.vehicle_registration || '',
    vehicleBrand: row.vehicle_brand || '',
    vehicleModel: row.vehicle_model || '',
    vehicleMileage: row.vehicle_mileage || 0,
    driverFirstName: row.driver_first_name || '',
    driverLastName: row.driver_last_name || '',
    tripNumber: row.trip_number || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function computeConsumption(quantity, currentMileage, previousMileage) {
  const distance = currentMileage - previousMileage;
  if (distance <= 0 || quantity <= 0) return 0;
  return Math.round((quantity / distance) * 100 * 10) / 10;
}

export async function createFuelRecord(payload, { companyId, userName }) {
  const vehicle = await vehicleRepository.findById(payload.vehicleId);
  if (!vehicle || vehicle.company_id !== companyId || vehicle.deleted_at) {
    throw new NotFoundError('Véhicule');
  }

  if (payload.driverId) {
    const driver = await driverRepository.findById(payload.driverId);
    if (!driver || driver.company_id !== companyId || driver.deleted_at) {
      throw new NotFoundError('Chauffeur');
    }
  }

  if (payload.tripId) {
    const trip = await tripRepository.findById(payload.tripId);
    if (!trip || trip.company_id !== companyId || trip.deleted_at) {
      throw new NotFoundError('Trajet');
    }
    if (trip.vehicle_id !== payload.vehicleId) {
      throw new ConflictError('Le trajet sélectionné ne correspond pas au véhicule.');
    }
  }

  const maxMileage = await fuelRepository.getMaxMileageForVehicle(payload.vehicleId);
  if (payload.mileage < maxMileage) {
    throw new ConflictError(`Le kilométrage doit être supérieur au dernier plein connu (${maxMileage} km).`);
  }

  const fuelNumber = await fuelRepository.getNextFuelNumber(companyId);
  const totalAmount = Math.round(payload.quantity * payload.unitPrice * 100) / 100;

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    const id = (await import('../utils/id.js')).generateId();

    await conn.execute(
      `INSERT INTO fuel_records
        (id, company_id, vehicle_id, driver_id, trip_id, fuel_number, fuel_type, quantity, unit_price, total_amount, currency, mileage, station, station_name, station_city, payment_method, invoice_number, notes, status, created_by, filled_at, created_at, updated_at)
        VALUES (?, ?, ?, NULLIF(?, ''), NULLIF(?, ''), ?, ?, ?, ?, ?, 'XAF', ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW(), NOW(), NOW())`,
      [
        id, companyId, payload.vehicleId, payload.driverId || '', payload.tripId || '',
        fuelNumber, payload.fuelType, payload.quantity, payload.unitPrice, totalAmount,
        payload.mileage, payload.stationName || '', payload.stationName || '', payload.stationCity || '',
        payload.paymentMethod || 'cash', payload.invoiceNumber || '', payload.notes || '',
        userName || '',
      ]
    );

    if (payload.mileage > (vehicle.mileage || 0)) {
      await conn.execute(
        `UPDATE vehicles SET mileage = ?, updated_at = NOW() WHERE id = ?`,
        [payload.mileage, payload.vehicleId]
      );
    }

    await conn.commit();

    const full = await fuelRepository.findByCompanyIdAndId(companyId, id);
    return formatFuelResponse(full);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function getFuelRecordById(id, { companyId }) {
  const record = await fuelRepository.findByCompanyIdAndId(companyId, id);
  if (!record) throw new NotFoundError('Plein de carburant');

  const formatted = formatFuelResponse(record);

  const prevRecord = await fuelRepository.queryOne(
    `SELECT mileage FROM fuel_records WHERE vehicle_id = ? AND company_id = ? AND deleted_at IS NULL AND filled_at < ? ORDER BY filled_at DESC LIMIT 1`,
    [record.vehicle_id, companyId, record.filled_at]
  );
  const prevMileage = prevRecord?.mileage || 0;
  formatted.consumptionAverage = computeConsumption(formatted.quantity, formatted.mileage, prevMileage);

  return formatted;
}

export async function listFuelRecords({ page, limit, sort, order, vehicleId, driverId, tripId, fuelType, status, search }, { companyId }) {
  const filters = {};
  if (vehicleId) filters.vehicle_id = vehicleId;
  if (driverId) filters.driver_id = driverId;
  if (tripId) filters.trip_id = tripId;
  if (fuelType) filters.fuel_type = fuelType;
  if (status) filters.status = status;
  if (search) filters.search = search;

  const result = await fuelRepository.findByCompanyIdWithDetails(companyId, {
    page: page || 1,
    limit: limit || 20,
    sort: sort || 'created_at',
    order: order || 'DESC',
    filters,
  });

  const items = result.rows.map((row) => formatFuelResponse(row));

  return {
    fuelRecords: items,
    total: result.total,
    page: page || 1,
    limit: limit || 20,
    totalPages: Math.ceil(result.total / (limit || 20)),
  };
}

export async function updateFuelRecord(id, payload, { companyId }) {
  const existing = await fuelRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) throw new NotFoundError('Plein de carburant');
  if (existing.status === 'validated' || existing.status === 'cancelled') {
    throw new ConflictError('Un plein validé ou annulé ne peut plus être modifié.');
  }

  if (payload.status) {
    const allowed = VALID_STATUS_TRANSITIONS[existing.status] || [];
    if (!allowed.includes(payload.status)) {
      throw new ConflictError(`Transition de statut invalide : ${existing.status} → ${payload.status}.`);
    }
  }

  if (payload.vehicleId && payload.vehicleId !== existing.vehicle_id) {
    const vehicle = await vehicleRepository.findById(payload.vehicleId);
    if (!vehicle || vehicle.company_id !== companyId || vehicle.deleted_at) {
      throw new NotFoundError('Véhicule');
    }
  }

  if (payload.tripId && payload.tripId !== existing.trip_id) {
    const trip = await tripRepository.findById(payload.tripId);
    if (!trip || trip.company_id !== companyId || trip.deleted_at) {
      throw new NotFoundError('Trajet');
    }
    const vehicleId = payload.vehicleId || existing.vehicle_id;
    if (trip.vehicle_id !== vehicleId) {
      throw new ConflictError('Le trajet sélectionné ne correspond pas au véhicule.');
    }
  }

  const vehicleId = payload.vehicleId || existing.vehicle_id;
  const newMileage = payload.mileage !== undefined ? payload.mileage : existing.mileage;
  const maxMileage = await fuelRepository.getMaxMileageForVehicle(vehicleId);
  if (newMileage < maxMileage && newMileage !== existing.mileage) {
    throw new ConflictError(`Le kilométrage doit être supérieur ou égal au dernier plein connu (${maxMileage} km).`);
  }

  const newQuantity = payload.quantity !== undefined ? payload.quantity : existing.quantity;
  const newUnitPrice = payload.unitPrice !== undefined ? payload.unitPrice : existing.unit_price;
  const totalAmount = Math.round(newQuantity * newUnitPrice * 100) / 100;

  const updateData = {};
  const snakeMap = {
    vehicleId: 'vehicle_id', driverId: 'driver_id', tripId: 'trip_id',
    fuelType: 'fuel_type', stationName: 'station_name', stationCity: 'station_city',
    paymentMethod: 'payment_method', invoiceNumber: 'invoice_number',
  };
  for (const [camel, snake] of Object.entries(snakeMap)) {
    if (payload[camel] !== undefined) updateData[snake] = payload[camel] || null;
  }
  if (payload.stationName !== undefined) {
    updateData.station = payload.stationName || '';
    updateData.station_name = payload.stationName || '';
  }
  if (payload.quantity !== undefined) updateData.quantity = payload.quantity;
  if (payload.unitPrice !== undefined) updateData.unit_price = payload.unitPrice;
  updateData.total_amount = totalAmount;
  if (payload.mileage !== undefined) updateData.mileage = payload.mileage;
  if (payload.status !== undefined) updateData.status = payload.status;
  if (payload.notes !== undefined) updateData.notes = payload.notes || '';

  await fuelRepository.update(id, updateData);

  if (updateData.mileage && updateData.mileage > (existing.vehicle_mileage || 0)) {
    await vehicleRepository.query(
      `UPDATE vehicles SET mileage = ?, updated_at = NOW() WHERE id = ?`,
      [updateData.mileage, vehicleId]
    );
  }

  const full = await fuelRepository.findByCompanyIdAndId(companyId, id);
  return formatFuelResponse(full);
}

export async function deleteFuelRecord(id, { companyId }) {
  const existing = await fuelRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) throw new NotFoundError('Plein de carburant');
  await fuelRepository.softDelete(id);
  return { id };
}

export async function getVehicleFuelHistory(vehicleId, { companyId, page = 1, limit = 20 }) {
  const vehicle = await vehicleRepository.findById(vehicleId);
  if (!vehicle || vehicle.company_id !== companyId || vehicle.deleted_at) {
    throw new NotFoundError('Véhicule');
  }

  const result = await fuelRepository.findByVehicleId(companyId, vehicleId, { page, limit });
  return {
    fuelRecords: result.rows.map(formatFuelResponse),
    total: result.total,
    page,
    limit,
    totalPages: Math.ceil(result.total / limit),
  };
}

export async function getFuelStatistics({ companyId }) {
  const stats = await fuelRepository.getStats(companyId);

  const statusCounts = stats.statusCounts || [];
  for (const sc of statusCounts) {
    if (sc.status === 'pending') stats.pendingCount = Number(sc.count);
    if (sc.status === 'validated') stats.validatedCount = Number(sc.count);
    if (sc.status === 'cancelled') stats.cancelledCount = Number(sc.count);
  }
  delete stats.statusCounts;

  const validatedRecords = await fuelRepository.query(
    `SELECT f.quantity, f.mileage, f.filled_at
     FROM fuel_records f
     WHERE f.company_id = ? AND f.deleted_at IS NULL AND f.status = 'validated'
     ORDER BY f.vehicle_id, f.filled_at ASC`,
    [companyId]
  );

  const consumptions = [];
  for (let i = 1; i < validatedRecords.length; i++) {
    const prev = validatedRecords[i - 1];
    const curr = validatedRecords[i];
    if (curr.mileage > prev.mileage) {
      consumptions.push(Math.round((curr.quantity / (curr.mileage - prev.mileage)) * 100 * 10) / 10);
    }
  }
  stats.averageConsumption = consumptions.length
    ? Math.round(consumptions.reduce((a, b) => a + b, 0) / consumptions.length * 10) / 10
    : 0;

  return stats;
}
