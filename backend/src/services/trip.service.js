import tripRepository from '../repositories/TripRepository.js';
import assignmentRepository from '../repositories/AssignmentRepository.js';

import { ConflictError, NotFoundError, ValidationError, BadRequestError } from '../errors/index.js';
import { VALID_STATUS_TRANSITIONS } from '../modules/trips/index.js';

function normalizeTripPayload(data) {
  const out = {};
  const stringFields = ['assignmentId', 'tripType', 'purpose', 'departureLocation', 'arrivalLocation', 'departureDate', 'departureTime', 'arrivalDate', 'arrivalTime', 'notes'];
  for (const f of stringFields) {
    if (data[f] !== undefined && data[f] !== null) {
      out[f] = typeof data[f] === 'string' ? data[f].trim() : data[f];
    }
  }
  const numFields = ['plannedDistance', 'estimatedDuration', 'departureMileage', 'passengerCount', 'cargoWeight'];
  for (const f of numFields) {
    if (data[f] !== undefined && data[f] !== null && data[f] !== '') {
      out[f] = Number(data[f]);
    }
  }

  const snakeMap = {
    assignmentId: 'assignment_id',
    tripType: 'trip_type',
    purpose: 'purpose',
    departureLocation: 'origin',
    arrivalLocation: 'destination',
    departureDate: 'departure_date',
    departureTime: 'departure_time',
    arrivalDate: 'arrival_date',
    arrivalTime: 'arrival_time',
    plannedDistance: 'distance',
    estimatedDuration: 'duration_minutes',
    departureMileage: 'start_mileage',
    passengerCount: 'passenger_count',
    cargoWeight: 'cargo_weight',
    notes: 'notes',
  };

  const result = {};
  for (const [key, value] of Object.entries(out)) {
    const dbKey = snakeMap[key] || key;
    result[dbKey] = value;
  }
  return result;
}

function formatTripResponse(row) {
  if (!row) return null;

  const actualDistance = Number(row.actual_distance) || 0;
  let actualDuration = Number(row.actual_duration) || 0;
  let averageSpeed = Number(row.average_speed) || 0;

  if (row.started_at && row.completed_at) {
    const start = new Date(row.started_at);
    const end = new Date(row.completed_at);
    const durationMs = end - start;
    actualDuration = actualDuration || Math.max(1, Math.round(durationMs / 60000));
    if (actualDistance > 0 && actualDuration > 0) {
      averageSpeed = averageSpeed || Math.round(actualDistance / (actualDuration / 60));
    }
  }

  return {
    id: row.id,
    companyId: row.company_id,
    assignmentId: row.assignment_id,
    vehicleId: row.vehicle_id,
    driverId: row.driver_id,
    missionId: row.mission_id,
    tripNumber: row.trip_number,
    tripType: row.trip_type,
    purpose: row.purpose || '',
    status: row.status,
    departureLocation: row.origin || '',
    arrivalLocation: row.destination || '',
    departureDate: row.departure_date || '',
    departureTime: row.departure_time || '',
    arrivalDate: row.arrival_date || '',
    arrivalTime: row.arrival_time || '',
    plannedDistance: Number(row.distance) || 0,
    estimatedDuration: Number(row.duration_minutes) || 0,
    actualDistance,
    actualDuration,
    averageSpeed,
    departureMileage: Number(row.start_mileage) || 0,
    arrivalMileage: Number(row.end_mileage) || 0,
    passengerCount: Number(row.passenger_count) || 0,
    cargoWeight: Number(row.cargo_weight) || 0,
    notes: row.notes || '',
    createdBy: row.created_by || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    startedAt: row.started_at || null,
    completedAt: row.completed_at || null,
    pausedAt: row.paused_at || null,
    resumedAt: row.resumed_at || null,
    pausedByDriver: !!row.paused_by_driver,
    driverFirstName: row.driver_first_name || null,
    driverLastName: row.driver_last_name || null,
    driverFullName: row.driver_full_name || null,
    driverEmployeeCode: row.driver_employee_code || null,
    driverPhone: row.driver_phone || null,
    vehicleRegistration: row.vehicle_registration || null,
    vehicleBrand: row.vehicle_brand || null,
    vehicleModel: row.vehicle_model || null,
    vehicleMileage: row.vehicle_mileage || null,
    assignmentNumber: row.assignment_number || null,
    assignmentType: row.assignment_type || null,
    authorFirstName: null,
    authorLastName: null,
    authorFullName: null,
  };
}

export async function createTrip(data, { companyId, userName }) {
  const payload = normalizeTripPayload(data);

  if (!payload.assignment_id) {
    throw new ValidationError('L\'affectation est requise.');
  }
  if (!payload.origin) {
    throw new ValidationError('Le lieu de départ est requis.');
  }
  if (!payload.destination) {
    throw new ValidationError('Le lieu d\'arrivée est requis.');
  }
  if (!payload.departure_date) {
    throw new ValidationError('La date de départ est requise.');
  }

  const assignment = await assignmentRepository.findById(payload.assignment_id);
  if (!assignment) {
    throw new NotFoundError('Affectation');
  }
  if (assignment.company_id !== companyId) {
    throw new NotFoundError('Affectation');
  }
  if (assignment.status !== 'active') {
    throw new ConflictError('L\'affectation sélectionnée n\'est pas active.');
  }

  const vehicleId = assignment.vehicle_id;
  const driverId = assignment.driver_id;

  const tripNumber = await tripRepository.getNextTripNumber(companyId);
  const { generateId } = await import('../utils/id.js');
  const newId = generateId();

  await tripRepository.create({
    id: newId,
    company_id: companyId,
    assignment_id: payload.assignment_id,
    vehicle_id: vehicleId,
    driver_id: driverId,
    mission_id: payload.mission_id || null,
    trip_number: tripNumber,
    trip_type: payload.trip_type || 'mission',
    purpose: payload.purpose || null,
    status: 'planned',
    origin: payload.origin,
    destination: payload.destination,
    departure_date: payload.departure_date,
    departure_time: payload.departure_time || null,
    arrival_date: payload.arrival_date || null,
    arrival_time: payload.arrival_time || null,
    distance: payload.distance || 0,
    duration_minutes: payload.duration_minutes || 0,
    start_mileage: payload.start_mileage || 0,
    end_mileage: 0,
    actual_distance: 0,
    actual_duration: 0,
    average_speed: 0,
    passenger_count: payload.passenger_count || 0,
    cargo_weight: payload.cargo_weight || 0,
    fuel_consumed: null,
    notes: payload.notes || null,
    created_by: userName || null,
  });

  const full = await tripRepository.findByCompanyIdAndId(companyId, newId);
  return formatTripResponse(full);
}

export async function getTripById(id, { companyId }) {
  const trip = await tripRepository.findByCompanyIdAndId(companyId, id);
  if (!trip) {
    throw new NotFoundError('Trajet');
  }
  return formatTripResponse(trip);
}

export async function listTrips({ page, limit, sort, order, status, tripType, vehicleId, driverId, search }, { companyId }) {
  const filters = {};
  if (status) filters.status = status;
  if (tripType) filters.trip_type = tripType;
  if (vehicleId) filters.vehicle_id = vehicleId;
  if (driverId) filters.driver_id = driverId;

  let result;
  if (search) {
    result = await tripRepository.search(companyId, search, {
      page: page || 1,
      limit: limit || 20,
      sort: sort || 'departure_date',
      order: order || 'DESC',
    });
  } else {
    result = await tripRepository.findByCompanyId(companyId, {
      page: page || 1,
      limit: limit || 20,
      filters,
      sort: sort || 'departure_date',
      order: order || 'DESC',
    });
  }

  return {
    trips: result.rows.map(formatTripResponse),
    pagination: {
      page: page || 1,
      limit: limit || 20,
      total: result.total,
      totalPages: Math.ceil(result.total / (limit || 20)),
    },
  };
}

export async function updateTrip(id, data, { companyId }) {
  const existing = await tripRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) {
    throw new NotFoundError('Trajet');
  }
  if (existing.status === 'completed') {
    throw new ConflictError('Un trajet terminé ne peut plus être modifié.');
  }

  const payload = normalizeTripPayload(data);

  if (payload.assignment_id && payload.assignment_id !== existing.assignment_id) {
    const assignment = await assignmentRepository.findById(payload.assignment_id);
    if (!assignment) {
      throw new NotFoundError('Affectation');
    }
    if (assignment.company_id !== companyId) {
      throw new NotFoundError('Affectation');
    }
    if (assignment.status !== 'active') {
      throw new ConflictError('L\'affectation sélectionnée n\'est pas active.');
    }
  }

  const updateData = {};
  const allowedFields = ['assignment_id', 'trip_type', 'purpose', 'origin', 'destination', 'departure_date', 'departure_time', 'arrival_date', 'arrival_time', 'distance', 'duration_minutes', 'start_mileage', 'passenger_count', 'cargo_weight', 'notes'];
  for (const field of allowedFields) {
    if (payload[field] !== undefined && payload[field] !== null) {
      updateData[field] = payload[field] === '' ? null : payload[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new ValidationError('Aucun champ à mettre à jour.');
  }

  if (payload.assignment_id && payload.assignment_id !== existing.assignment_id) {
    const assignment = await assignmentRepository.findById(payload.assignment_id);
    updateData.vehicle_id = assignment.vehicle_id;
    updateData.driver_id = assignment.driver_id;
  }

  await tripRepository.update(id, updateData);
  const full = await tripRepository.findByCompanyIdAndId(companyId, id);
  return formatTripResponse(full);
}

export async function deleteTrip(id, { companyId }) {
  const existing = await tripRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) {
    throw new NotFoundError('Trajet');
  }
  if (existing.status === 'in_progress' || existing.status === 'suspended') {
    throw new BadRequestError('Impossible de supprimer un trajet en cours ou suspendu. Terminez ou annulez-le d\'abord.');
  }

  await tripRepository.softDelete(id);
  return { id, message: 'Trajet supprimé avec succès.' };
}

export async function startTrip(id, { companyId, userName }) {
  const existing = await tripRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) {
    throw new NotFoundError('Trajet');
  }
  if (existing.status !== 'planned') {
    throw new BadRequestError('Seuls les trajets prévus peuvent être démarrés.');
  }

  const conn = await tripRepository.beginTransaction();
  try {
    await tripRepository.queryWithConnection(conn,
      `UPDATE trips SET status = 'in_progress', started_at = NOW(), created_by = COALESCE(?, created_by), updated_at = NOW() WHERE id = ?`,
      [userName || null, id]
    );

    if (existing.vehicle_id) {
      await tripRepository.queryWithConnection(conn,
        `UPDATE vehicles SET status = 'in_use', updated_at = NOW() WHERE id = ?`,
        [existing.vehicle_id]
      );
    }
    if (existing.driver_id) {
      await tripRepository.queryWithConnection(conn,
        `UPDATE drivers SET status = 'on_mission', availability = 'busy', updated_at = NOW() WHERE id = ?`,
        [existing.driver_id]
      );
    }

    await tripRepository.commitTransaction(conn);

    const full = await tripRepository.findByCompanyIdAndId(companyId, id);
    return formatTripResponse(full);
  } catch (error) {
    await tripRepository.rollbackTransaction(conn);
    throw error;
  }
}

export async function pauseTrip(id, { companyId }) {
  const existing = await tripRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) {
    throw new NotFoundError('Trajet');
  }
  if (existing.status !== 'in_progress') {
    throw new BadRequestError('Seuls les trajets en cours peuvent être suspendus.');
  }

  const allowed = VALID_STATUS_TRANSITIONS[existing.status];
  if (!allowed || !allowed.includes('suspended')) {
    throw new BadRequestError(`Transition invalide : ${existing.status} → suspended.`);
  }

  await tripRepository.update(id, {
    status: 'suspended',
    paused_at: new Date().toISOString(),
    paused_by_driver: 1,
  });

  const full = await tripRepository.findByCompanyIdAndId(companyId, id);
  return formatTripResponse(full);
}

export async function resumeTrip(id, { companyId }) {
  const existing = await tripRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) {
    throw new NotFoundError('Trajet');
  }
  if (existing.status !== 'suspended') {
    throw new BadRequestError('Seuls les trajets suspendus peuvent être repris.');
  }

  const allowed = VALID_STATUS_TRANSITIONS[existing.status];
  if (!allowed || !allowed.includes('in_progress')) {
    throw new BadRequestError(`Transition invalide : ${existing.status} → in_progress.`);
  }

  await tripRepository.update(id, {
    status: 'in_progress',
    resumed_at: new Date().toISOString(),
    paused_by_driver: 0,
  });

  const full = await tripRepository.findByCompanyIdAndId(companyId, id);
  return formatTripResponse(full);
}

export async function finishTrip(id, data, { companyId, userName: _userName }) {
  const existing = await tripRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) {
    throw new NotFoundError('Trajet');
  }
  if (existing.status === 'completed') {
    throw new ConflictError('Ce trajet est déjà terminé.');
  }
  if (existing.status === 'planned') {
    throw new ConflictError('Un trajet prévu ne peut pas être terminé sans avoir été démarré.');
  }

  const now = new Date();
  const arrivalDate = data.arrivalDate || now.toISOString().split('T')[0];
  const arrivalTime = data.arrivalTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const actualDistance = Number(data.actualDistance) || 0;
  const arrivalMileage = Number(data.arrivalMileage) || 0;
  let actualDuration = Number(data.actualDuration) || 0;

  if (existing.started_at) {
    const start = new Date(existing.started_at);
    const durationMs = now - start;
    actualDuration = actualDuration || Math.max(1, Math.round(durationMs / 60000));
  }

  let averageSpeed = 0;
  if (actualDistance > 0 && actualDuration > 0) {
    averageSpeed = Math.round(actualDistance / (actualDuration / 60));
  }

  const conn = await tripRepository.beginTransaction();
  try {
    await tripRepository.queryWithConnection(conn,
      `UPDATE trips SET
        status = 'completed',
        arrival_date = ?,
        arrival_time = ?,
        end_mileage = ?,
        actual_distance = ?,
        actual_duration = ?,
        average_speed = ?,
        completed_at = ?,
        notes = COALESCE(?, notes),
        updated_at = NOW()
      WHERE id = ?`,
      [
        arrivalDate,
        arrivalTime,
        arrivalMileage,
        actualDistance,
        actualDuration,
        averageSpeed,
        now.toISOString(),
        data.notes || null,
        id,
      ]
    );

    if (existing.assignment_id) {
      const assignment = await assignmentRepository.queryOneWithConnection(conn,
        `SELECT id FROM assignments WHERE id = ? AND status = 'active'`,
        [existing.assignment_id]
      );
      if (assignment) {
        await tripRepository.queryWithConnection(conn,
          `UPDATE assignments SET status = 'completed', end_date = ?, end_mileage = ?, updated_at = NOW() WHERE id = ? AND status = 'active'`,
          [arrivalDate, arrivalMileage, existing.assignment_id]
        );
        await tripRepository.queryWithConnection(conn,
          `        UPDATE vehicles SET status = 'available', mileage = GREATEST(COALESCE(mileage, 0), ?), updated_at = NOW() WHERE id = ?`,
          [arrivalMileage, existing.vehicle_id]
        );
        await tripRepository.queryWithConnection(conn,
          `UPDATE drivers SET status = 'available', availability = 'available', updated_at = NOW() WHERE id = ?`,
          [existing.driver_id]
        );
      }
    } else if (existing.vehicle_id) {
      await tripRepository.queryWithConnection(conn,
        `UPDATE vehicles SET status = 'available', mileage = GREATEST(COALESCE(mileage, 0), ?), updated_at = NOW() WHERE id = ?`,
          [arrivalMileage, existing.vehicle_id]
      );
    } else if (existing.driver_id) {
      await tripRepository.queryWithConnection(conn,
        `UPDATE drivers SET status = 'available', availability = 'available', updated_at = NOW() WHERE id = ?`,
        [existing.driver_id]
      );
    }

    await tripRepository.commitTransaction(conn);

    const full = await tripRepository.findByCompanyIdAndId(companyId, id);
    return formatTripResponse(full);
  } catch (error) {
    await tripRepository.rollbackTransaction(conn);
    throw error;
  }
}

export async function cancelTrip(id, { companyId }) {
  const existing = await tripRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) {
    throw new NotFoundError('Trajet');
  }
  if (existing.status === 'completed' || existing.status === 'cancelled') {
    throw new BadRequestError('Impossible d\'annuler un trajet terminé ou déjà annulé.');
  }

  const allowed = VALID_STATUS_TRANSITIONS[existing.status];
  if (!allowed || !allowed.includes('cancelled')) {
    throw new BadRequestError(`Transition invalide : ${existing.status} → cancelled.`);
  }

  const conn = await tripRepository.beginTransaction();
  try {
    await tripRepository.queryWithConnection(conn,
      `UPDATE trips SET status = 'cancelled', updated_at = NOW() WHERE id = ?`,
      [id]
    );

    if (existing.status === 'in_progress' || existing.status === 'suspended') {
      if (existing.vehicle_id) {
        await tripRepository.queryWithConnection(conn,
          `UPDATE vehicles SET status = 'available', updated_at = NOW() WHERE id = ?`,
          [existing.vehicle_id]
        );
      }
      if (existing.driver_id) {
        await tripRepository.queryWithConnection(conn,
          `UPDATE drivers SET status = 'available', availability = 'available', updated_at = NOW() WHERE id = ?`,
          [existing.driver_id]
        );
      }
    }

    if (existing.assignment_id) {
      await tripRepository.queryWithConnection(conn,
        `UPDATE assignments SET status = 'cancelled', updated_at = NOW() WHERE id = ? AND status IN ('active', 'planned')`,
        [existing.assignment_id]
      );
    }

    await tripRepository.commitTransaction(conn);

    const full = await tripRepository.findByCompanyIdAndId(companyId, id);
    return formatTripResponse(full);
  } catch (error) {
    await tripRepository.rollbackTransaction(conn);
    throw error;
  }
}

export async function getTripStats({ companyId }) {
  return tripRepository.getStats(companyId);
}

export async function getHistory({ page, limit, sort, order }, { companyId }) {
  const result = await tripRepository.getHistory(companyId, {
    page: page || 1,
    limit: limit || 20,
    sort: sort || 'departure_date',
    order: order || 'DESC',
  });

  return {
    trips: result.rows.map(formatTripResponse),
    pagination: {
      page: page || 1,
      limit: limit || 20,
      total: result.total,
      totalPages: Math.ceil(result.total / (limit || 20)),
    },
  };
}

export async function getTripsByDriver(driverId, { companyId }) {
  const result = await tripRepository.findByDriverId(driverId, companyId, {
    page: 1,
    limit: 100,
    sort: 'departure_date',
    order: 'DESC',
  });

  return {
    trips: result.rows.map(formatTripResponse),
    pagination: {
      page: 1,
      limit: 100,
      total: result.total,
      totalPages: 1,
    },
  };
}

export async function getTripsByAssignment(assignmentId, { companyId }) {
  const trips = await tripRepository.findByAssignmentId(assignmentId, companyId);
  return trips.map(formatTripResponse);
}
