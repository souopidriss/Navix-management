import { BaseRepository } from './BaseRepository.js';

class MaintenanceRepository extends BaseRepository {
  constructor() {
    super('maintenance_records');
  }

  allowedFilterFields() {
    return [
      'id', 'company_id', 'vehicle_id', 'maintenance_number',
      'maintenance_type', 'priority', 'status', 'workshop',
      'scheduled_date', 'created_at', 'deleted_at',
    ];
  }

  allowedSortFields() {
    return [
      'id', 'created_at', 'updated_at', 'scheduled_date',
      'next_maintenance_date', 'actual_cost', 'estimated_cost', 'priority', 'status',
    ];
  }

  async findByCompanyIdAll(companyId) {
    return this.query(
      `SELECT m.*,
        v.registration_number AS vehicle_registration,
        v.brand AS vehicle_brand,
        v.model AS vehicle_model,
        v.mileage AS vehicle_mileage
      FROM maintenance_records m
      LEFT JOIN vehicles v ON v.id = m.vehicle_id AND v.deleted_at IS NULL
      WHERE m.company_id = ? AND m.deleted_at IS NULL
      ORDER BY m.created_at DESC`,
      [companyId]
    );
  }

  async findByCompanyIdAndId(companyId, id) {
    return this.queryOne(
      `SELECT m.*,
        v.registration_number AS vehicle_registration,
        v.brand AS vehicle_brand,
        v.model AS vehicle_model,
        v.mileage AS vehicle_mileage
      FROM maintenance_records m
      LEFT JOIN vehicles v ON v.id = m.vehicle_id AND v.deleted_at IS NULL
      WHERE m.id = ? AND m.company_id = ? AND m.deleted_at IS NULL`,
      [id, companyId]
    );
  }

  async getNextMaintenanceNumber(companyId) {
    const result = await this.queryOne(
      `SELECT maintenance_number FROM maintenance_records WHERE company_id = ? ORDER BY created_at DESC LIMIT 1`,
      [companyId]
    );
    if (!result) return 'MT-0001';
    const match = result.maintenance_number.match(/(\d+)$/);
    if (!match) return 'MT-0001';
    const num = Number(match[1]) + 1;
    return `MT-${String(num).padStart(4, '0')}`;
  }

  async findActiveForVehicle(vehicleId, excludeId = null) {
    const conditions = [
      `vehicle_id = ?`,
      `status = 'in_progress'`,
      `deleted_at IS NULL`,
    ];
    const params = [vehicleId];

    if (excludeId) {
      conditions.push(`id != ?`);
      params.push(excludeId);
    }

    return this.queryOne(
      `SELECT id FROM maintenance_records WHERE ${conditions.join(' AND ')}`,
      params
    );
  }

  async findByVehicleId(companyId, vehicleId) {
    return this.query(
      `SELECT * FROM maintenance_records
      WHERE company_id = ? AND vehicle_id = ? AND deleted_at IS NULL
      ORDER BY scheduled_date DESC`,
      [companyId, vehicleId]
    );
  }

  async getCalendarEvents(companyId, from, to) {
    const conditions = ['m.company_id = ?', 'm.deleted_at IS NULL'];
    const params = [companyId];

    if (from && to) {
      conditions.push(
        '(m.scheduled_date BETWEEN ? AND ? OR m.next_maintenance_date BETWEEN ? AND ?)'
      );
      params.push(from, to, from, to);
    } else if (from) {
      conditions.push(
        '(m.scheduled_date >= ? OR m.next_maintenance_date >= ?)'
      );
      params.push(from, from);
    } else if (to) {
      conditions.push(
        '(m.scheduled_date <= ? OR m.next_maintenance_date <= ?)'
      );
      params.push(to, to);
    }

    return this.query(
      `SELECT m.id, m.maintenance_number, m.maintenance_type, m.status, m.priority,
        m.description, m.scheduled_date, m.next_maintenance_date, m.vehicle_id,
        v.registration_number AS vehicle_registration, v.brand AS vehicle_brand,
        v.model AS vehicle_model
      FROM maintenance_records m
      LEFT JOIN vehicles v ON v.id = m.vehicle_id AND v.deleted_at IS NULL
      WHERE ${conditions.join(' AND ')}
      ORDER BY m.scheduled_date ASC`,
      params
    );
  }

  async getStats(companyId) {
    const totals = await this.queryOne(
      `SELECT
        COUNT(*) AS totalCount,
        SUM(CASE WHEN status = 'planned' THEN 1 ELSE 0 END) AS plannedCount,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingCount,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS inProgressCount,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completedCount,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelledCount,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS immobilizedCount,
        SUM(CASE WHEN priority = 'urgent' AND status NOT IN ('completed', 'cancelled') THEN 1 ELSE 0 END) AS urgentCount,
        SUM(CASE WHEN status NOT IN ('completed', 'cancelled') AND (scheduled_date < CURDATE() OR (next_maintenance_date IS NOT NULL AND next_maintenance_date < CURDATE())) THEN 1 ELSE 0 END) AS lateCount,
        SUM(CASE WHEN status NOT IN ('completed', 'cancelled') AND next_maintenance_date IS NOT NULL AND next_maintenance_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS dueSoonCount
      FROM maintenance_records
      WHERE company_id = ? AND deleted_at IS NULL`,
      [companyId]
    );

    const costs = await this.queryOne(
      `SELECT
        COALESCE(SUM(CASE WHEN MONTH(completed_at) = MONTH(NOW()) AND YEAR(completed_at) = YEAR(NOW()) THEN actual_cost ELSE 0 END), 0) AS monthCost,
        COALESCE(SUM(CASE WHEN YEAR(completed_at) = YEAR(NOW()) THEN actual_cost ELSE 0 END), 0) AS yearCost,
        COALESCE(AVG(CASE WHEN status = 'completed' THEN actual_cost END), 0) AS averageCost
      FROM maintenance_records
      WHERE company_id = ? AND deleted_at IS NULL`,
      [companyId]
    );

    const statusDistribution = await this.query(
      `SELECT status, COUNT(*) AS count
      FROM maintenance_records
      WHERE company_id = ? AND deleted_at IS NULL
      GROUP BY status`,
      [companyId]
    );

    const typeDistribution = await this.query(
      `SELECT maintenance_type AS type, COUNT(*) AS count
      FROM maintenance_records
      WHERE company_id = ? AND deleted_at IS NULL
      GROUP BY maintenance_type`,
      [companyId]
    );

    const priorityDistribution = await this.query(
      `SELECT priority, COUNT(*) AS count
      FROM maintenance_records
      WHERE company_id = ? AND deleted_at IS NULL
      GROUP BY priority`,
      [companyId]
    );

    const monthlyEvolution = await this.query(
      `SELECT
        DATE_FORMAT(scheduled_date, '%Y-%m') AS month,
        COUNT(*) AS count,
        COALESCE(SUM(actual_cost), 0) AS cost
      FROM maintenance_records
      WHERE company_id = ? AND deleted_at IS NULL
        AND scheduled_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(scheduled_date, '%Y-%m')
      ORDER BY month ASC`,
      [companyId]
    );

    const topWorkshops = await this.query(
      `SELECT workshop, COUNT(*) AS count
      FROM maintenance_records
      WHERE company_id = ? AND deleted_at IS NULL AND workshop IS NOT NULL AND workshop != ''
      GROUP BY workshop
      ORDER BY count DESC
      LIMIT 5`,
      [companyId]
    );

    const topVehicles = await this.query(
      `SELECT vehicle_id, COUNT(*) AS count
      FROM maintenance_records
      WHERE company_id = ? AND deleted_at IS NULL
      GROUP BY vehicle_id
      ORDER BY count DESC
      LIMIT 5`,
      [companyId]
    );

    const nextDueSoon = await this.query(
      `SELECT m.*,
        v.registration_number AS vehicle_registration,
        v.brand AS vehicle_brand,
        v.model AS vehicle_model
      FROM maintenance_records m
      LEFT JOIN vehicles v ON v.id = m.vehicle_id AND v.deleted_at IS NULL
      WHERE m.company_id = ? AND m.deleted_at IS NULL
        AND m.status NOT IN ('completed', 'cancelled')
        AND m.next_maintenance_date IS NOT NULL
      ORDER BY m.next_maintenance_date ASC
      LIMIT 6`,
      [companyId]
    );

    return {
      totalCount: Number(totals?.totalCount || 0),
      plannedCount: Number(totals?.plannedCount || 0),
      pendingCount: Number(totals?.pendingCount || 0),
      inProgressCount: Number(totals?.inProgressCount || 0),
      completedCount: Number(totals?.completedCount || 0),
      cancelledCount: Number(totals?.cancelledCount || 0),
      immobilizedCount: Number(totals?.immobilizedCount || 0),
      urgentCount: Number(totals?.urgentCount || 0),
      lateCount: Number(totals?.lateCount || 0),
      dueSoonCount: Number(totals?.dueSoonCount || 0),
      monthCost: Number(costs?.monthCost || 0),
      yearCost: Number(costs?.yearCost || 0),
      averageCost: Number(costs?.averageCost || 0),
      statusDistribution,
      typeDistribution,
      priorityDistribution,
      monthlyEvolution,
      topWorkshops,
      topVehicles,
      nextDueSoon,
    };
  }
}

export default new MaintenanceRepository();
