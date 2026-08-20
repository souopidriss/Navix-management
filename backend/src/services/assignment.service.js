import assignmentRepository from '../repositories/AssignmentRepository.js';
import vehicleRepository from '../repositories/VehicleRepository.js';
import driverRepository from '../repositories/DriverRepository.js';
import { getPool } from '../database/index.js';
import { ConflictError, NotFoundError, ValidationError, BadRequestError } from '../errors/index.js';
import { VALID_STATUS_TRANSITIONS } from '../modules/assignments/index.js';
import { recordAudit } from './audit.service.js';

function normalizeAssignmentPayload(data) {
  const out = {};
  const stringFields = ['vehicleId', 'driverId', 'agencyId', 'assignmentType', 'startDate', 'expectedEndDate', 'reason', 'destination', 'notes'];
  for (const f of stringFields) {
    if (data[f] !== undefined && data[f] !== null) {
      out[f] = typeof data[f] === 'string' ? data[f].trim() : data[f];
    }
  }
  const numFields = ['startMileage', 'fuelLevelStart'];
  for (const f of numFields) {
    if (data[f] !== undefined && data[f] !== null && data[f] !== '') {
      out[f] = Number(data[f]);
    }
  }

  const snakeMap = {
    vehicleId: 'vehicle_id',
    driverId: 'driver_id',
    agencyId: 'agency_id',
    assignmentType: 'assignment_type',
    startDate: 'start_date',
    expectedEndDate: 'expected_end_date',
    startMileage: 'start_mileage',
    fuelLevelStart: 'fuel_level_start',
    reason: 'reason',
    destination: 'destination',
    notes: 'notes',
  };

  const result = {};
  for (const [key, value] of Object.entries(out)) {
    const dbKey = snakeMap[key] || key;
    result[dbKey] = value;
  }
  return result;
}

function formatAssignmentResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    companyId: row.company_id,
    agencyId: row.agency_id,
    vehicleId: row.vehicle_id,
    driverId: row.driver_id,
    missionId: row.mission_id,
    assignmentNumber: row.assignment_number,
    assignmentType: row.assignment_type,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    expectedEndDate: row.expected_end_date,
    startMileage: row.start_mileage,
    endMileage: row.end_mileage,
    fuelLevelStart: row.fuel_level_start,
    fuelLevelEnd: row.fuel_level_end,
    reason: row.reason,
    destination: row.destination,
    createdBy: row.created_by,
    validatedBy: row.validated_by,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    vehicle: row.vehicle_registration ? {
      id: row.vehicle_id,
      registrationNumber: row.vehicle_registration,
      brand: row.vehicle_brand,
      model: row.vehicle_model,
      status: row.vehicle_status,
      mileage: row.vehicle_mileage,
      fuelType: row.vehicle_fuel_type,
    } : null,
    driver: row.driver_full_name ? {
      id: row.driver_id,
      fullName: row.driver_full_name,
      firstName: row.driver_first_name,
      lastName: row.driver_last_name,
      employeeCode: row.driver_employee_code,
      phone: row.driver_phone,
      status: row.driver_status,
    } : null,
    agencyName: row.agency_name || null,
  };
}

export async function createAssignment(data, { companyId, userName }) {
  const payload = normalizeAssignmentPayload(data);

  if (!payload.vehicle_id) {
    throw new ValidationError('Le véhicule est requis.');
  }
  if (!payload.driver_id) {
    throw new ValidationError('Le chauffeur est requis.');
  }
  if (!payload.start_date) {
    throw new ValidationError('La date de début est requise.');
  }

  const vehicle = await vehicleRepository.findByCompanyIdAndId(companyId, payload.vehicle_id);
  if (!vehicle) {
    throw new NotFoundError('Véhicule');
  }
  if (vehicle.status === 'out_of_service') {
    throw new ConflictError('Ce véhicule est hors service et ne peut pas être affecté.');
  }
  if (!vehicle.is_active) {
    throw new ConflictError('Ce véhicule est inactif et ne peut pas être affecté.');
  }

  const driver = await driverRepository.findByCompanyIdAndId(companyId, payload.driver_id);
  if (!driver) {
    throw new NotFoundError('Chauffeur');
  }
  if (driver.status === 'suspended' || driver.status === 'inactive') {
    throw new ConflictError('Ce chauffeur ne peut pas recevoir d\'affectation (statut : ' + driver.status + ').');
  }
  if (!driver.is_active) {
    throw new ConflictError('Ce chauffeur est inactif et ne peut pas recevoir d\'affectation.');
  }

  const vehicleConflict = await assignmentRepository.findActiveByVehicle(payload.vehicle_id);
  if (vehicleConflict) {
    throw new ConflictError('Ce véhicule est déjà affecté activement (affectation ' + vehicleConflict.id + ').');
  }

  const driverConflict = await assignmentRepository.findActiveByDriver(payload.driver_id);
  if (driverConflict) {
    throw new ConflictError('Ce chauffeur est déjà affecté activement (affectation ' + driverConflict.id + ').');
  }

  if (payload.end_date && payload.start_date > payload.end_date) {
    throw new BadRequestError('La date de fin doit être postérieure à la date de début.');
  }

  const assignmentNumber = await assignmentRepository.getNextAssignmentNumber(companyId);

  const conn = await assignmentRepository.beginTransaction();
  try {
    const { generateId } = await import('../utils/id.js');
    const newId = generateId();

    const insertResult = await assignmentRepository.queryWithConnection(conn,
      `INSERT INTO assignments (id, company_id, agency_id, vehicle_id, driver_id, assignment_number, assignment_type, status, start_date, expected_end_date, start_mileage, fuel_level_start, reason, destination, created_by, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'planned', ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        newId,
        companyId,
        payload.agency_id || null,
        payload.vehicle_id,
        payload.driver_id,
        assignmentNumber,
        payload.assignment_type || 'temporary',
        payload.start_date,
        payload.expected_end_date || null,
        payload.start_mileage || 0,
        payload.fuel_level_start || 0,
        payload.reason || null,
        payload.destination || null,
        userName || null,
        payload.notes || null,
      ]
    );

    await assignmentRepository.commitTransaction(conn);

    await recordAudit({
      action: 'CREATE',
      actionType: 'creation',
      entityType: 'assignment',
      entityId: newId,
      description: `Affectation créée: ${assignmentNumber}`,
      newValues: { assignmentNumber, vehicleId: payload.vehicle_id, driverId: payload.driver_id, startDate: payload.start_date },
      companyId,
    });

    const full = await assignmentRepository.findByCompanyIdAndId(companyId, insertResult.insertId ? newId : newId);
    return formatAssignmentResponse(full);
  } catch (error) {
    await assignmentRepository.rollbackTransaction(conn);
    throw error;
  }
}

export async function getAssignmentById(id, { companyId }) {
  const assignment = await assignmentRepository.findByCompanyIdAndId(companyId, id);
  if (!assignment) {
    throw new NotFoundError('Affectation');
  }
  return formatAssignmentResponse(assignment);
}

export async function listAssignments({ page, limit, sort, order, status, assignmentType, vehicleId, driverId, agencyId, search }, { companyId }) {
  const filters = {};
  if (status) filters.status = status;
  if (assignmentType) filters.assignment_type = assignmentType;
  if (vehicleId) filters.vehicle_id = vehicleId;
  if (driverId) filters.driver_id = driverId;
  if (agencyId) filters.agency_id = agencyId;

  let result;
  if (search) {
    result = await assignmentRepository.search(companyId, search, {
      page: page || 1,
      limit: limit || 20,
      sort: sort || 'created_at',
      order: order || 'DESC',
    });
  } else {
    result = await assignmentRepository.findByCompanyId(companyId, {
      page: page || 1,
      limit: limit || 20,
      filters,
      sort: sort || 'created_at',
      order: order || 'DESC',
    });
  }

  return {
    assignments: result.rows.map(formatAssignmentResponse),
    pagination: {
      page: page || 1,
      limit: limit || 20,
      total: result.total,
      totalPages: Math.ceil(result.total / (limit || 20)),
    },
  };
}

export async function updateAssignment(id, data, { companyId }) {
  const existing = await assignmentRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) {
    throw new NotFoundError('Affectation');
  }
  if (existing.status === 'completed' || existing.status === 'cancelled') {
    throw new BadRequestError('Impossible de modifier une affectation terminée ou annulée.');
  }

  const payload = normalizeAssignmentPayload(data);

  if (payload.vehicle_id && payload.vehicle_id !== existing.vehicle_id) {
    const vehicle = await vehicleRepository.findByCompanyIdAndId(companyId, payload.vehicle_id);
    if (!vehicle) throw new NotFoundError('Véhicule');
    if (vehicle.status === 'out_of_service') throw new ConflictError('Ce véhicule est hors service.');
    const conflict = await assignmentRepository.findActiveByVehicle(payload.vehicle_id, id);
    if (conflict) throw new ConflictError('Ce véhicule est déjà affecté activement.');
  }

  if (payload.driver_id && payload.driver_id !== existing.driver_id) {
    const driver = await driverRepository.findByCompanyIdAndId(companyId, payload.driver_id);
    if (!driver) throw new NotFoundError('Chauffeur');
    if (driver.status === 'suspended' || driver.status === 'inactive') throw new ConflictError('Ce chauffeur ne peut pas recevoir d\'affectation.');
    const conflict = await assignmentRepository.findActiveByDriver(payload.driver_id, id);
    if (conflict) throw new ConflictError('Ce chauffeur est déjà affecté activement.');
  }

  if (payload.start_date && payload.expected_end_date && payload.expected_end_date !== '') {
    if (payload.start_date > payload.expected_end_date) {
      throw new BadRequestError('La date de fin prévue doit être postérieure à la date de début.');
    }
  }

  const updateData = {};
  const allowedFields = ['agency_id', 'assignment_type', 'start_date', 'expected_end_date', 'start_mileage', 'fuel_level_start', 'reason', 'destination', 'notes'];
  for (const field of allowedFields) {
    if (payload[field] !== undefined && payload[field] !== null) {
      updateData[field] = payload[field] === '' ? null : payload[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new ValidationError('Aucun champ à mettre à jour.');
  }

  await assignmentRepository.update(id, updateData);

  await recordAudit({
    action: 'UPDATE',
    actionType: 'modification',
    entityType: 'assignment',
    entityId: id,
    description: `Affectation mise à jour: ${existing.assignment_number}`,
    companyId,
  });

  const full = await assignmentRepository.findByCompanyIdAndId(companyId, id);
  return formatAssignmentResponse(full);
}

export async function endAssignment(id, data, { companyId, userName }) {
  const existing = await assignmentRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) {
    throw new NotFoundError('Affectation');
  }
  if (existing.status === 'completed') {
    throw new BadRequestError('Cette affectation est déjà terminée.');
  }
  if (existing.status === 'cancelled') {
    throw new BadRequestError('Cette affectation est annulée.');
  }

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const endDate = data.endDate || new Date().toISOString().split('T')[0];

    await conn.query(
      `UPDATE assignments SET status = 'completed', end_date = ?, end_mileage = ?, fuel_level_end = ?, validated_by = ?, updated_at = NOW() WHERE id = ?`,
      [endDate, data.endMileage || 0, data.fuelLevelEnd || 0, userName || null, id]
    );

    await conn.query(
      `UPDATE vehicles SET status = 'available', updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      [existing.vehicle_id]
    );
    await conn.query(
      `UPDATE drivers SET status = 'available', availability = 'available', updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      [existing.driver_id]
    );

    await conn.commit();

    await recordAudit({
      action: 'UPDATE',
      actionType: 'status_change',
      entityType: 'assignment',
      entityId: id,
      description: `Affectation terminée: ${existing.assignment_number}`,
      oldValues: { status: existing.status },
      newValues: { status: 'completed' },
      companyId,
    });

    const full = await assignmentRepository.findByCompanyIdAndId(companyId, id);
    return formatAssignmentResponse(full);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function startAssignment(id, { companyId, userName }) {
  const existing = await assignmentRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) {
    throw new NotFoundError('Affectation');
  }
  if (existing.status !== 'planned') {
    throw new BadRequestError('Seules les affectations prévues peuvent être démarrées.');
  }

  const vehicleConflict = await assignmentRepository.findActiveByVehicle(existing.vehicle_id, id);
  if (vehicleConflict) {
    throw new ConflictError('Ce véhicule est déjà affecté activement à une autre affectation.');
  }
  const driverConflict = await assignmentRepository.findActiveByDriver(existing.driver_id, id);
  if (driverConflict) {
    throw new ConflictError('Ce chauffeur est déjà affecté activement à une autre affectation.');
  }

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE assignments SET status = 'active', validated_by = ?, updated_at = NOW() WHERE id = ?`,
      [userName || null, id]
    );

    await conn.query(
      `UPDATE vehicles SET status = 'in_use', updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      [existing.vehicle_id]
    );
    await conn.query(
      `UPDATE drivers SET status = 'on_mission', availability = 'busy', updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      [existing.driver_id]
    );

    await conn.commit();

    await recordAudit({
      action: 'UPDATE',
      actionType: 'status_change',
      entityType: 'assignment',
      entityId: id,
      description: `Affectation démarrée: ${existing.assignment_number}`,
      oldValues: { status: existing.status },
      newValues: { status: 'active' },
      companyId,
    });

    const full = await assignmentRepository.findByCompanyIdAndId(companyId, id);
    return formatAssignmentResponse(full);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function cancelAssignment(id, { companyId }) {
  const existing = await assignmentRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) {
    throw new NotFoundError('Affectation');
  }
  if (existing.status === 'completed' || existing.status === 'cancelled') {
    throw new BadRequestError('Impossible d\'annuler une affectation terminée ou déjà annulée.');
  }

  const allowed = VALID_STATUS_TRANSITIONS[existing.status];
  if (!allowed || !allowed.includes('cancelled')) {
    throw new BadRequestError(`Transition invalide : ${existing.status} → cancelled.`);
  }

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE assignments SET status = 'cancelled', updated_at = NOW() WHERE id = ?`,
      [id]
    );

    if (existing.status === 'active') {
      await conn.query(
        `UPDATE vehicles SET status = 'available', updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
        [existing.vehicle_id]
      );
      await conn.query(
        `UPDATE drivers SET status = 'available', availability = 'available', updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
        [existing.driver_id]
      );
    }

    await conn.commit();

    await recordAudit({
      action: 'UPDATE',
      actionType: 'status_change',
      entityType: 'assignment',
      entityId: id,
      description: `Affectation annulée: ${existing.assignment_number}`,
      oldValues: { status: existing.status },
      newValues: { status: 'cancelled' },
      companyId,
    });

    const full = await assignmentRepository.findByCompanyIdAndId(companyId, id);
    return formatAssignmentResponse(full);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function deleteAssignment(id, { companyId }) {
  const existing = await assignmentRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) {
    throw new NotFoundError('Affectation');
  }
  if (existing.status === 'active') {
    throw new BadRequestError('Impossible de supprimer une affectation active. Terminez ou annulez-la d\'abord.');
  }

  await assignmentRepository.softDelete(id);

  await recordAudit({
    action: 'DELETE',
    actionType: 'suppression',
    entityType: 'assignment',
    entityId: id,
    description: `Affectation supprimée: ${existing.assignment_number}`,
    companyId,
  });

  return { message: 'Affectation supprimée avec succès.' };
}

export async function getAssignmentStats({ companyId }) {
  return assignmentRepository.getStats(companyId);
}

export async function getHistory({ page, limit, sort, order }, { companyId }) {
  const result = await assignmentRepository.getHistory(companyId, {
    page: page || 1,
    limit: limit || 20,
    sort: sort || 'end_date',
    order: order || 'DESC',
  });

  return {
    assignments: result.rows.map(formatAssignmentResponse),
    pagination: {
      page: page || 1,
      limit: limit || 20,
      total: result.total,
      totalPages: Math.ceil(result.total / (limit || 20)),
    },
  };
}

export async function getCurrentByVehicle(vehicleId, { companyId }) {
  const vehicle = await vehicleRepository.findByCompanyIdAndId(companyId, vehicleId);
  if (!vehicle) throw new NotFoundError('Véhicule');
  const assignment = await assignmentRepository.getCurrentByVehicle(vehicleId);
  return formatAssignmentResponse(assignment);
}

export async function getCurrentByDriver(driverId, { companyId }) {
  const driver = await driverRepository.findByCompanyIdAndId(companyId, driverId);
  if (!driver) throw new NotFoundError('Chauffeur');
  const assignment = await assignmentRepository.getCurrentByDriver(driverId);
  return formatAssignmentResponse(assignment);
}

export async function getByVehicle(vehicleId, { companyId }) {
  const vehicle = await vehicleRepository.findByCompanyIdAndId(companyId, vehicleId);
  if (!vehicle) throw new NotFoundError('Véhicule');
  const assignments = await assignmentRepository.findByVehicleId(vehicleId, companyId);
  return assignments.map(formatAssignmentResponse);
}

export async function getByDriver(driverId, { companyId }) {
  const driver = await driverRepository.findByCompanyIdAndId(companyId, driverId);
  if (!driver) throw new NotFoundError('Chauffeur');
  const assignments = await assignmentRepository.findByDriverId(driverId, companyId);
  return assignments.map(formatAssignmentResponse);
}
