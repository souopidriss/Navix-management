import { getPool } from '../../database/index.js';

function getDateRange(period, dateFrom, dateTo) {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'today': {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    }
    case 'week': {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    }
    case 'month': {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
    case 'quarter': {
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    }
    case 'year': {
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    }
    case 'custom': {
      startDate = dateFrom ? new Date(dateFrom) : new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
    default: {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  return {
    start: startDate.toISOString().split('T')[0],
    end: (dateTo ? new Date(dateTo) : now).toISOString().split('T')[0],
  };
}

function buildCompanyFilter(companyId) {
  if (companyId) return { clause: 'AND company_id = ?', params: [companyId] };
  return { clause: '', params: [] };
}

export async function getOverview({ companyId, period, dateFrom, dateTo }) {
  const pool = getPool();
  const { start, end } = getDateRange(period, dateFrom, dateTo);
  const cf = buildCompanyFilter(companyId);

  const fleetQuery = pool.query(
    `SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available,
      SUM(CASE WHEN status = 'in_use' THEN 1 ELSE 0 END) AS inUse,
      SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) AS maintenance,
      SUM(CASE WHEN status = 'out_of_service' THEN 1 ELSE 0 END) AS outOfService
     FROM vehicles WHERE deleted_at IS NULL ${cf.clause}`,
    cf.params
  );

  const tripsQuery = pool.query(
    `SELECT COUNT(*) AS activeTrips
     FROM trips t WHERE t.status IN ('in_progress')
     AND t.departure_date >= ? AND t.departure_date <= ?
     ${companyId ? 'AND t.company_id = ?' : ''}`,
    companyId ? [start, end, companyId] : [start, end]
  );

  const driversQuery = pool.query(
    `SELECT COUNT(DISTINCT t.driver_id) AS driversOnMission
     FROM trips t WHERE t.status IN ('in_progress')
     AND t.departure_date >= ? AND t.departure_date <= ?
     ${companyId ? 'AND t.company_id = ?' : ''}`,
    companyId ? [start, end, companyId] : [start, end]
  );

  const maintenanceQuery = pool.query(
    `SELECT COUNT(*) AS pendingMaintenance
     FROM maintenance_records
     WHERE status IN ('planned', 'pending')
     ${companyId ? 'AND company_id = ?' : ''}`,
    companyId ? [companyId] : []
  );

  const docsQuery = pool.query(
    `SELECT COUNT(*) AS expiringDocuments
     FROM vehicles
     WHERE (inspection_expiry < DATE_ADD(CURDATE(), INTERVAL 30 DAY)
            OR insurance_expiry < DATE_ADD(CURDATE(), INTERVAL 30 DAY))
     AND deleted_at IS NULL
     ${companyId ? 'AND company_id = ?' : ''}`,
    companyId ? [companyId] : []
  );

  const costsQuery = pool.query(
    `SELECT
      COALESCE(SUM(CASE WHEN transaction_type = 'fuel' THEN amount ELSE 0 END), 0) AS monthFuelCost,
      COALESCE(SUM(CASE WHEN transaction_type = 'maintenance' THEN amount ELSE 0 END), 0) AS monthMaintenanceCost,
      COALESCE(SUM(amount), 0) AS totalMonthlyCost
     FROM financial_transactions
     WHERE transaction_date >= ? AND transaction_date <= ?
     ${companyId ? 'AND company_id = ?' : ''}`,
    companyId ? [start, end, companyId] : [start, end]
  );

  const [fleet, trips, drivers, maintenance, docs, costs] = await Promise.all([
    fleetQuery, tripsQuery, driversQuery, maintenanceQuery, docsQuery, costsQuery,
  ]);

  const f = fleet[0][0] || {};
  const t = trips[0][0] || {};
  const d = drivers[0][0] || {};
  const m = maintenance[0][0] || {};
  const doc = docs[0][0] || {};
  const c = costs[0][0] || {};

  return {
    fleet: {
      total: f.total || 0,
      available: f.available || 0,
      inUse: f.inUse || 0,
      maintenance: f.maintenance || 0,
      outOfService: f.outOfService || 0,
      availabilityRate: f.total > 0 ? Math.round(((f.available || 0) / f.total) * 100) : 0,
      utilizationRate: f.total > 0 ? Math.round(((f.inUse || 0) / f.total) * 100) : 0,
    },
    activeTrips: t.activeTrips || 0,
    driversOnMission: d.driversOnMission || 0,
    pendingMaintenance: m.pendingMaintenance || 0,
    expiringDocuments: doc.expiringDocuments || 0,
    monthFuelCost: Number(c.monthFuelCost) || 0,
    monthMaintenanceCost: Number(c.monthMaintenanceCost) || 0,
    totalMonthlyCost: Number(c.totalMonthlyCost) || 0,
    period: { start, end },
  };
}

export async function getFleetStatistics({ companyId }) {
  const pool = getPool();
  const cf = buildCompanyFilter(companyId);

  const byGroupResult = await pool.query(
    `SELECT COALESCE(group_code, 'N/A') AS groupCode, COUNT(*) AS count
     FROM vehicles WHERE deleted_at IS NULL ${cf.clause}
     GROUP BY group_code ORDER BY count DESC`,
    cf.params
  );

  const totalResult = await pool.query(
    `SELECT COUNT(*) AS total,
      SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available,
      SUM(CASE WHEN status = 'in_use' THEN 1 ELSE 0 END) AS inUse,
      SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) AS maintenance,
      SUM(CASE WHEN status = 'out_of_service' THEN 1 ELSE 0 END) AS outOfService
     FROM vehicles WHERE deleted_at IS NULL ${cf.clause}`,
    cf.params
  );

  return {
    byGroup: byGroupResult[0],
    total: totalResult[0][0] || { total: 0, available: 0, inUse: 0, maintenance: 0, outOfService: 0 },
  };
}

export async function getFuelStatistics({ companyId, period, dateFrom, dateTo }) {
  const pool = getPool();
  const { start, end } = getDateRange(period, dateFrom, dateTo);

  const result = await pool.query(
    `SELECT
      COALESCE(SUM(cost), 0) AS totalCost,
      COALESCE(SUM(quantity), 0) AS totalQuantity,
      COUNT(*) AS fuelCount,
      COUNT(DISTINCT vehicle_id) AS vehicleCount
     FROM fuel_records
     WHERE record_date >= ? AND record_date <= ?
     AND deleted_at IS NULL
     ${companyId ? 'AND company_id = ?' : ''}`,
    companyId ? [start, end, companyId] : [start, end]
  );

  const r = result[0][0] || {};
  const vehicleCount = r.vehicleCount || 1;

  return {
    totalCost: Number(r.totalCost) || 0,
    totalQuantity: Number(r.totalQuantity) || 0,
    fuelCount: r.fuelCount || 0,
    averageCostPerVehicle: vehicleCount > 0 ? Math.round((Number(r.totalCost) || 0) / vehicleCount) : 0,
    averageConsumption: vehicleCount > 0 ? Math.round((Number(r.totalQuantity) || 0) / vehicleCount) : 0,
  };
}

export async function getMaintenanceStatistics({ companyId, period, dateFrom, dateTo }) {
  const pool = getPool();
  const { start, end } = getDateRange(period, dateFrom, dateTo);

  const result = await pool.query(
    `SELECT
      COUNT(*) AS totalCount,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completedCount,
      SUM(CASE WHEN status IN ('planned', 'pending') THEN 1 ELSE 0 END) AS pendingCount,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS inProgressCount,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelledCount,
      COALESCE(SUM(actual_cost), 0) AS totalCost,
      COALESCE(SUM(CASE WHEN scheduled_date < CURDATE() AND status != 'completed' THEN 1 ELSE 0 END), 0) AS overdueCount
     FROM maintenance_records
     WHERE scheduled_date >= ? AND scheduled_date <= ?
     ${companyId ? 'AND company_id = ?' : ''}`,
    companyId ? [start, end, companyId] : [start, end]
  );

  const r = result[0][0] || {};
  return {
    totalCount: r.totalCount || 0,
    completedCount: r.completedCount || 0,
    pendingCount: r.pendingCount || 0,
    inProgressCount: r.inProgressCount || 0,
    cancelledCount: r.cancelledCount || 0,
    overdueCount: r.overdueCount || 0,
    totalCost: Number(r.totalCost) || 0,
    monthCost: Number(r.totalCost) || 0,
  };
}

export async function getFinancialStatistics({ companyId, period, dateFrom, dateTo }) {
  const pool = getPool();
  const { start, end } = getDateRange(period, dateFrom, dateTo);

  const result = await pool.query(
    `SELECT
      COALESCE(SUM(amount), 0) AS totalAmount,
      COALESCE(SUM(CASE WHEN transaction_type = 'fuel' THEN amount ELSE 0 END), 0) AS fuelAmount,
      COALESCE(SUM(CASE WHEN transaction_type = 'maintenance' THEN amount ELSE 0 END), 0) AS maintenanceAmount,
      COUNT(DISTINCT vehicle_id) AS vehicleCount
     FROM financial_transactions
     WHERE transaction_date >= ? AND transaction_date <= ?
     ${companyId ? 'AND company_id = ?' : ''}`,
    companyId ? [start, end, companyId] : [start, end]
  );

  const r = result[0][0] || {};
  const vehicleCount = r.vehicleCount || 1;

  return {
    monthTotal: Number(r.totalAmount) || 0,
    monthFuel: Number(r.fuelAmount) || 0,
    monthMaintenance: Number(r.maintenanceAmount) || 0,
    totalAmount: Number(r.totalAmount) || 0,
    averageCostPerVehicle: vehicleCount > 0 ? Math.round((Number(r.totalAmount) || 0) / vehicleCount) : 0,
  };
}

export async function getAlerts({ companyId }) {
  const pool = getPool();
  const cf = buildCompanyFilter(companyId);

  const result = await pool.query(
    `SELECT * FROM alerts
     WHERE dismissed_at IS NULL
     ${companyId ? 'AND company_id = ?' : ''}
     ORDER BY created_at DESC LIMIT 20`,
    cf.params
  );

  const alerts = result[0].map((a) => ({
    id: a.id,
    severity: a.severity,
    type: a.alert_type,
    title: a.title,
    description: a.description,
    entityType: a.entity_type,
    entityId: a.entity_id,
    createdAt: a.created_at,
  }));

  return {
    items: alerts,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    warning: alerts.filter((a) => a.severity === 'warning').length,
    info: alerts.filter((a) => a.severity === 'info').length,
  };
}

export async function getRecentActivities({ companyId, period, dateFrom, dateTo }) {
  const pool = getPool();
  const { start, end } = getDateRange(period, dateFrom, dateTo);

  const result = await pool.query(
    `SELECT id, entity_type AS entityType, entity_id AS entityId, action_type AS actionType,
            description, created_at AS createdAt
     FROM audit_logs
     WHERE created_at >= ? AND created_at <= ?
     ${companyId ? 'AND company_id = ?' : ''}
     ORDER BY created_at DESC LIMIT 20`,
    companyId ? [start, end, companyId] : [start, end]
  );

  return result[0];
}

export async function getTopVehicles({ companyId, period, dateFrom, dateTo }) {
  const pool = getPool();
  const { start, end } = getDateRange(period, dateFrom, dateTo);

  const result = await pool.query(
    `SELECT vehicle_id AS vehicleId,
      COUNT(*) AS tripCount,
      COALESCE(SUM(distance), 0) AS distanceKm
     FROM trips
     WHERE departure_date >= ? AND departure_date <= ?
     AND status = 'completed'
     ${companyId ? 'AND company_id = ?' : ''}
     GROUP BY vehicle_id
     ORDER BY distanceKm DESC LIMIT 10`,
    companyId ? [start, end, companyId] : [start, end]
  );

  return result[0];
}

export async function getTopDrivers({ companyId, period, dateFrom, dateTo }) {
  const pool = getPool();
  const { start, end } = getDateRange(period, dateFrom, dateTo);

  const result = await pool.query(
    `SELECT driver_id AS driverId,
      COUNT(*) AS tripCount,
      COALESCE(SUM(distance), 0) AS distanceKm
     FROM trips
     WHERE departure_date >= ? AND departure_date <= ?
     AND status = 'completed'
     ${companyId ? 'AND company_id = ?' : ''}
     GROUP BY driver_id
     ORDER BY distanceKm DESC LIMIT 10`,
    companyId ? [start, end, companyId] : [start, end]
  );

  return result[0];
}
