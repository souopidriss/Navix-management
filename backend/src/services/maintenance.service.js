import maintenanceRepository from '../repositories/MaintenanceRepository.js';
import vehicleRepository from '../repositories/VehicleRepository.js';
import { getPool } from '../database/index.js';
import { generateId } from '../utils/id.js';
import { NotFoundError, ConflictError, ValidationError } from '../errors/index.js';
import { VALID_STATUS_TRANSITIONS, FINISHED_STATUSES, IMMOBILIZING_STATUSES, DEFAULT_CURRENCY } from '../modules/maintenance/index.js';
import { recordAudit } from './audit.service.js';

function formatDate(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.split('T')[0];
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  return String(value);
}

function formatMaintenanceResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    companyId: row.company_id,
    vehicleId: row.vehicle_id,
    maintenanceNumber: row.maintenance_number,
    maintenanceType: row.maintenance_type,
    priority: row.priority,
    status: row.status,
    workshop: row.workshop || '',
    mechanic: row.mechanic || '',
    supplier: row.supplier || row.provider || '',
    scheduledDate: formatDate(row.scheduled_date),
    startedAt: row.started_at || '',
    completedAt: row.completed_at || '',
    nextMaintenanceDate: formatDate(row.next_maintenance_date),
    mileage: row.mileage_at_service || 0,
    nextMileage: row.next_maintenance_mileage || 0,
    estimatedCost: Number(row.estimated_cost) || 0,
    actualCost: Number(row.actual_cost) || 0,
    currency: row.currency || DEFAULT_CURRENCY,
    description: row.description || '',
    diagnostic: row.diagnostic || '',
    performedWork: row.performed_work || '',
    replacedParts: row.replaced_parts ? JSON.parse(row.replaced_parts) : [],
    attachments: row.attachments ? JSON.parse(row.attachments) : [],
    notes: row.notes || '',
    createdBy: row.created_by || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isFinished(status) {
  return FINISHED_STATUSES.includes(status);
}

function isImmobilizing(status) {
  return IMMOBILIZING_STATUSES.includes(status);
}

function validateStatusTransition(currentStatus, newStatus) {
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw new ValidationError(`Transition de statut invalide : ${currentStatus} → ${newStatus}.`);
  }
}

export async function createMaintenance(data, { companyId, userName }) {
  const vehicle = await vehicleRepository.findById(data.vehicleId);
  if (!vehicle || vehicle.company_id !== companyId || vehicle.deleted_at) {
    throw new NotFoundError('Véhicule');
  }

  if (data.status === 'in_progress') {
    const active = await maintenanceRepository.findActiveForVehicle(data.vehicleId);
    if (active) {
      throw new ConflictError('Un entretien est déjà en cours pour ce véhicule.');
    }
  }

  const conn = await getPool().getConnection();
  try {
    await conn.query(
      `INSERT INTO maintenance_counters (company_id, current_number) VALUES (?, 1)
       ON DUPLICATE KEY UPDATE current_number = LAST_INSERT_ID(current_number + 1)`,
      [companyId]
    );
    const [counterRows] = await conn.query('SELECT LAST_INSERT_ID() AS num');
    const nextNum = Number(counterRows[0].num);
    const maintenanceNumber = `MT-${String(nextNum).padStart(4, '0')}`;

    const id = generateId();
    const now = new Date().toISOString();

    let startedAt = null;
    let completedAt = null;
    if (data.status === 'in_progress') {
      startedAt = now;
    } else if (data.status === 'completed') {
      startedAt = now;
      completedAt = now;
    }

    await conn.query(
      `INSERT INTO maintenance_records
        (id, company_id, vehicle_id, maintenance_number, maintenance_type, priority, status,
          workshop, mechanic, supplier, scheduled_date, started_at, completed_at,
          next_maintenance_date, mileage_at_service, next_maintenance_mileage,
          estimated_cost, actual_cost, currency, description, diagnostic,
          performed_work, replaced_parts, attachments, notes, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id, companyId, data.vehicleId, maintenanceNumber,
        data.maintenanceType || 'autre', data.priority || 'normal', data.status || 'planned',
        data.workshop || '', data.mechanic || '', data.supplier || '',
        data.scheduledDate || null, startedAt, completedAt,
        data.nextMaintenanceDate || null, data.mileage || 0, data.nextMileage || 0,
        data.estimatedCost || 0, data.actualCost || 0, data.currency || DEFAULT_CURRENCY,
        data.description || '', data.diagnostic || '', data.performedWork || '',
        data.replacedParts ? JSON.stringify(data.replacedParts) : '[]',
        data.attachments ? JSON.stringify(data.attachments) : '[]',
        data.notes || '', userName || '',
      ]
    );

    await recordAudit({
      action: 'CREATE',
      actionType: 'creation',
      entityType: 'maintenance',
      entityId: id,
      description: `Entretien créé: ${maintenanceNumber}`,
      newValues: { maintenanceNumber, vehicleId: data.vehicleId, maintenanceType: data.maintenanceType || 'autre', priority: data.priority || 'normal' },
      companyId,
    });

    const full = await maintenanceRepository.findByCompanyIdAndId(companyId, id);
    return formatMaintenanceResponse(full);
  } finally {
    conn.release();
  }
}

export async function listMaintenances({ page, limit, sort, order, status, priority, vehicleId, maintenanceType, search } = {}, { companyId }) {
  const filters = {};
  if (vehicleId) filters.vehicle_id = vehicleId;
  if (status) filters.status = status;
  if (priority) filters.priority = priority;
  if (maintenanceType) filters.maintenance_type = maintenanceType;
  if (search) filters.search = search;

  const result = await maintenanceRepository.findAll({
    page: page || 1,
    limit: limit || 20,
    sort: sort || 'created_at',
    order: order || 'DESC',
    filters: { ...filters, company_id: companyId },
  });

  const items = result.rows.map((row) => formatMaintenanceResponse(row));

  return {
    maintenances: items,
    total: result.total,
    page: page || 1,
    limit: limit || 20,
    totalPages: Math.ceil(result.total / (limit || 20)),
  };
}

export async function getMaintenanceById(id, { companyId }) {
  const record = await maintenanceRepository.findByCompanyIdAndId(companyId, id);
  if (!record) throw new NotFoundError('Enregistrement d\'entretien');
  return formatMaintenanceResponse(record);
}

export async function updateMaintenance(id, data, { companyId }) {
  const existing = await maintenanceRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) throw new NotFoundError('Enregistrement d\'entretien');

  if (isFinished(existing.status)) {
    throw new ConflictError('Un entretien terminé ou annulé ne peut plus être modifié.');
  }

  if (data.vehicleId && data.vehicleId !== existing.vehicle_id) {
    const vehicle = await vehicleRepository.findById(data.vehicleId);
    if (!vehicle || vehicle.company_id !== companyId || vehicle.deleted_at) {
      throw new NotFoundError('Véhicule');
    }
    const active = await maintenanceRepository.findActiveForVehicle(data.vehicleId, id);
    if (active) {
      throw new ConflictError('Un entretien est déjà en cours pour ce véhicule.');
    }
  }

  if (data.status) {
    validateStatusTransition(existing.status, data.status);
  }

  let startedAt = undefined;
  let completedAt = undefined;

  if (data.status === 'in_progress' && existing.status !== 'in_progress') {
    startedAt = new Date().toISOString();
    const active = await maintenanceRepository.findActiveForVehicle(existing.vehicle_id, id);
    if (active) {
      throw new ConflictError('Un entretien est déjà en cours pour ce véhicule.');
    }
  }

  if (data.status === 'completed' && existing.status !== 'completed') {
    completedAt = new Date().toISOString();
  }

  const snakeMap = {
    vehicleId: 'vehicle_id', maintenanceType: 'maintenance_type',
    scheduledDate: 'scheduled_date', nextMaintenanceDate: 'next_maintenance_date',
    mileage: 'mileage_at_service', nextMileage: 'next_maintenance_mileage',
    estimatedCost: 'estimated_cost', actualCost: 'actual_cost',
    performedWork: 'performed_work', replacedParts: 'replaced_parts',
  };

  const updateData = {};
  for (const [camel, snake] of Object.entries(snakeMap)) {
    if (data[camel] !== undefined) updateData[snake] = data[camel];
  }
  if (data.workshop !== undefined) updateData.workshop = data.workshop || '';
  if (data.mechanic !== undefined) updateData.mechanic = data.mechanic || '';
  if (data.supplier !== undefined) updateData.supplier = data.supplier || '';
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.currency !== undefined) updateData.currency = data.currency || DEFAULT_CURRENCY;
  if (data.description !== undefined) updateData.description = data.description || '';
  if (data.diagnostic !== undefined) updateData.diagnostic = data.diagnostic || '';
  if (data.notes !== undefined) updateData.notes = data.notes || '';
  if (data.replacedParts !== undefined) updateData.replaced_parts = JSON.stringify(data.replacedParts || []);
  if (data.attachments !== undefined) updateData.attachments = JSON.stringify(data.attachments || []);
  if (startedAt !== undefined) updateData.started_at = startedAt;
  if (completedAt !== undefined) updateData.completed_at = completedAt;

  await maintenanceRepository.update(id, updateData);

  await recordAudit({
    action: 'UPDATE',
    actionType: 'modification',
    entityType: 'maintenance',
    entityId: id,
    description: `Entretien mis à jour: ${existing.maintenance_number}`,
    companyId,
  });

  const full = await maintenanceRepository.findByCompanyIdAndId(companyId, id);
  return formatMaintenanceResponse(full);
}

export async function deleteMaintenance(id, { companyId }) {
  const existing = await maintenanceRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) throw new NotFoundError('Enregistrement d\'entretien');
  await maintenanceRepository.softDelete(id);

  await recordAudit({
    action: 'DELETE',
    actionType: 'suppression',
    entityType: 'maintenance',
    entityId: id,
    description: `Entretien supprimé: ${existing.maintenance_number}`,
    companyId,
  });

  return { id };
}

export async function startMaintenance(id, { companyId }) {
  const existing = await maintenanceRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) throw new NotFoundError('Enregistrement d\'entretien');

  if (existing.status !== 'planned' && existing.status !== 'pending') {
    throw new ConflictError('Cet entretien ne peut pas être démarré dans son état actuel.');
  }

  const active = await maintenanceRepository.findActiveForVehicle(existing.vehicle_id, id);
  if (active) {
    throw new ConflictError('Un entretien est déjà en cours pour ce véhicule.');
  }

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    const now = new Date().toISOString();
    await conn.execute(
      `UPDATE maintenance_records SET status = 'in_progress', started_at = ?, updated_at = NOW() WHERE id = ?`,
      [now, id]
    );

    await conn.execute(
      `UPDATE vehicles SET status = 'maintenance', updated_at = NOW() WHERE id = ?`,
      [existing.vehicle_id]
    );

    await conn.commit();

    await recordAudit({
      action: 'UPDATE',
      actionType: 'status_change',
      entityType: 'maintenance',
      entityId: id,
      description: `Entretien démarré: ${existing.maintenance_number}`,
      oldValues: { status: existing.status },
      newValues: { status: 'in_progress' },
      companyId,
    });

    const full = await maintenanceRepository.findByCompanyIdAndId(companyId, id);
    return formatMaintenanceResponse(full);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function completeMaintenance(id, { companyId }) {
  const existing = await maintenanceRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) throw new NotFoundError('Enregistrement d\'entretien');

  if (existing.status !== 'in_progress') {
    throw new ConflictError('Cet entretien ne peut être terminé que s\'il est en cours.');
  }

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    const now = new Date().toISOString();
    await conn.execute(
      `UPDATE maintenance_records SET status = 'completed', completed_at = ?, updated_at = NOW() WHERE id = ?`,
      [now, id]
    );

    if ((existing.mileage_at_service || 0) > (existing.vehicle_mileage || 0)) {
      await conn.execute(
        `UPDATE vehicles SET mileage = ?, updated_at = NOW() WHERE id = ?`,
        [existing.mileage_at_service, existing.vehicle_id]
      );
    }

    await conn.execute(
      `UPDATE vehicles SET status = 'available', updated_at = NOW() WHERE id = ?`,
      [existing.vehicle_id]
    );

    await conn.commit();

    await recordAudit({
      action: 'UPDATE',
      actionType: 'status_change',
      entityType: 'maintenance',
      entityId: id,
      description: `Entretien terminé: ${existing.maintenance_number}`,
      oldValues: { status: existing.status },
      newValues: { status: 'completed' },
      companyId,
    });

    const full = await maintenanceRepository.findByCompanyIdAndId(companyId, id);
    return formatMaintenanceResponse(full);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function cancelMaintenance(id, { companyId }) {
  const existing = await maintenanceRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) throw new NotFoundError('Enregistrement d\'entretien');

  if (existing.status === 'completed' || existing.status === 'cancelled') {
    throw new ConflictError('Un entretien terminé ou annulé ne peut pas être annulé.');
  }

  await maintenanceRepository.update(id, { status: 'cancelled' });

  await recordAudit({
    action: 'UPDATE',
    actionType: 'status_change',
    entityType: 'maintenance',
    entityId: id,
    description: `Entretien annulé: ${existing.maintenance_number}`,
    oldValues: { status: existing.status },
    newValues: { status: 'cancelled' },
    companyId,
  });

  const full = await maintenanceRepository.findByCompanyIdAndId(companyId, id);
  return formatMaintenanceResponse(full);
}

export async function getMaintenanceStatistics({ companyId }) {
  const stats = await maintenanceRepository.getStats(companyId);
  return {
    totalCount: Number(stats.totalCount || 0),
    plannedCount: Number(stats.plannedCount || 0),
    pendingCount: Number(stats.pendingCount || 0),
    inProgressCount: Number(stats.inProgressCount || 0),
    completedCount: Number(stats.completedCount || 0),
    cancelledCount: Number(stats.cancelledCount || 0),
    immobilizedCount: Number(stats.immobilizedCount || 0),
    urgentCount: Number(stats.urgentCount || 0),
    lateCount: Number(stats.lateCount || 0),
    dueSoonCount: Number(stats.dueSoonCount || 0),
    monthCost: Number(stats.monthCost || 0),
    yearCost: Number(stats.yearCost || 0),
    averageCost: Number(stats.averageCost || 0),
    statusDistribution: stats.statusDistribution || [],
    typeDistribution: stats.typeDistribution || [],
    priorityDistribution: stats.priorityDistribution || [],
    monthlyEvolution: stats.monthlyEvolution || [],
    topWorkshops: stats.topWorkshops || [],
    topVehicles: stats.topVehicles || [],
    nextDueSoon: (stats.nextDueSoon || []).map(formatMaintenanceResponse),
  };
}

export async function getCalendarEvents({ from, to } = {}, { companyId }) {
  const rows = await maintenanceRepository.getCalendarEvents(companyId, from, to);

  const events = [];
  for (const row of rows) {
    if (row.scheduled_date) {
      events.push({
        id: `${row.id}_scheduled`,
        maintenanceId: row.id,
        maintenanceNumber: row.maintenance_number,
        maintenanceType: row.maintenance_type,
        status: row.status,
        priority: row.priority,
        description: row.description || '',
        vehicleId: row.vehicle_id,
        eventDate: formatDate(row.scheduled_date),
        eventSource: 'scheduledDate',
      });
    }
    if (row.next_maintenance_date) {
      events.push({
        id: `${row.id}_next`,
        maintenanceId: row.id,
        maintenanceNumber: row.maintenance_number,
        maintenanceType: row.maintenance_type,
        status: row.status,
        priority: row.priority,
        description: row.description || '',
        vehicleId: row.vehicle_id,
        eventDate: formatDate(row.next_maintenance_date),
        eventSource: 'nextMaintenanceDate',
      });
    }
  }

  return events;
}

export async function getVehicleMaintenanceHistory(vehicleId, { companyId }) {
  const vehicle = await vehicleRepository.findById(vehicleId);
  if (!vehicle || vehicle.company_id !== companyId || vehicle.deleted_at) {
    throw new NotFoundError('Véhicule');
  }

  const rows = await maintenanceRepository.findByVehicleId(companyId, vehicleId);
  return rows.map(formatMaintenanceResponse);
}

export { validateStatusTransition, isFinished, isImmobilizing };
