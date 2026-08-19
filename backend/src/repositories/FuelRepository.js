import { BaseRepository } from './BaseRepository.js';

class FuelRepository extends BaseRepository {
  constructor() {
    super('fuel_records');
  }

  allowedFilterFields() {
    return [
      'id', 'company_id', 'vehicle_id', 'driver_id', 'trip_id',
      'fuel_type', 'status', 'created_at', 'deleted_at',
    ];
  }

  allowedSortFields() {
    return [
      'id', 'created_at', 'updated_at', 'filled_at',
      'quantity', 'unit_price', 'total_amount', 'mileage',
    ];
  }

  async findByCompanyIdWithDetails(companyId, { page = 1, limit = 20, sort = 'created_at', order = 'DESC', filters = {} } = {}) {
    const conditions = ['f.company_id = ?', 'f.deleted_at IS NULL'];
    const params = [companyId];

    if (filters.vehicle_id) { conditions.push('f.vehicle_id = ?'); params.push(filters.vehicle_id); }
    if (filters.driver_id) { conditions.push('f.driver_id = ?'); params.push(filters.driver_id); }
    if (filters.trip_id) { conditions.push('f.trip_id = ?'); params.push(filters.trip_id); }
    if (filters.fuel_type) { conditions.push('f.fuel_type = ?'); params.push(filters.fuel_type); }
    if (filters.status) { conditions.push('f.status = ?'); params.push(filters.status); }

    if (filters.search) {
      conditions.push('(f.fuel_number LIKE ? OR f.station LIKE ? OR f.station_name LIKE ? OR f.invoice_number LIKE ?)');
      const like = `%${filters.search}%`;
      params.push(like, like, like, like);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM fuel_records f ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(
      `SELECT f.*,
        v.registration_number AS vehicle_registration, v.brand AS vehicle_brand,
        v.model AS vehicle_model, v.mileage AS vehicle_mileage,
        d.first_name AS driver_first_name, d.last_name AS driver_last_name,
        t.trip_number AS trip_number
      FROM fuel_records f
      LEFT JOIN vehicles v ON v.id = f.vehicle_id AND v.deleted_at IS NULL
      LEFT JOIN drivers d ON d.id = f.driver_id AND d.deleted_at IS NULL
      LEFT JOIN trips t ON t.id = f.trip_id AND t.deleted_at IS NULL
      ${where}
      ORDER BY f.${allowedSort} ${allowedOrder}
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { rows, total };
  }

  async findByCompanyIdAndId(companyId, id) {
    return this.queryOne(
      `SELECT f.*,
        v.registration_number AS vehicle_registration, v.brand AS vehicle_brand,
        v.model AS vehicle_model, v.mileage AS vehicle_mileage,
        d.first_name AS driver_first_name, d.last_name AS driver_last_name,
        t.trip_number AS trip_number
      FROM fuel_records f
      LEFT JOIN vehicles v ON v.id = f.vehicle_id AND v.deleted_at IS NULL
      LEFT JOIN drivers d ON d.id = f.driver_id AND d.deleted_at IS NULL
      LEFT JOIN trips t ON t.id = f.trip_id AND t.deleted_at IS NULL
      WHERE f.id = ? AND f.company_id = ? AND f.deleted_at IS NULL`,
      [id, companyId]
    );
  }

  async getNextFuelNumber(companyId) {
    const result = await this.queryOne(
      `SELECT fuel_number FROM fuel_records WHERE company_id = ? ORDER BY created_at DESC LIMIT 1`,
      [companyId]
    );
    if (!result) return 'FL-0001';
    const match = result.fuel_number.match(/(\d+)$/);
    if (!match) return 'FL-0001';
    const num = Number(match[1]) + 1;
    return `FL-${String(num).padStart(4, '0')}`;
  }

  async getMaxMileageForVehicle(vehicleId) {
    const result = await this.queryOne(
      `SELECT MAX(mileage) AS max_mileage FROM fuel_records WHERE vehicle_id = ? AND deleted_at IS NULL`,
      [vehicleId]
    );
    return result?.max_mileage || 0;
  }

  async findByVehicleId(companyId, vehicleId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM fuel_records WHERE company_id = ? AND vehicle_id = ? AND deleted_at IS NULL`,
      [companyId, vehicleId]
    );
    const total = countResult?.total || 0;
    const rows = await this.query(
      `SELECT * FROM fuel_records WHERE company_id = ? AND vehicle_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [companyId, vehicleId, limit, offset]
    );
    return { rows, total };
  }

  async getStats(companyId) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const totals = await this.queryOne(
      `SELECT
        COUNT(*) AS fuel_count,
        COALESCE(SUM(total_amount), 0) AS total_cost,
        COALESCE(SUM(quantity), 0) AS total_quantity,
        COALESCE(AVG(unit_price), 0) AS avg_unit_price
      FROM fuel_records
      WHERE company_id = ? AND deleted_at IS NULL`,
      [companyId]
    );

    const monthly = await this.queryOne(
      `SELECT
        COALESCE(SUM(total_amount), 0) AS month_total_cost,
        COALESCE(SUM(quantity), 0) AS month_quantity,
        COUNT(*) AS month_count
      FROM fuel_records
      WHERE company_id = ? AND deleted_at IS NULL
        AND DATE_FORMAT(filled_at, '%Y-%m') = ?`,
      [companyId, currentMonth]
    );

    const topVehicles = await this.query(
      `SELECT vehicle_id,
        COALESCE(SUM(quantity), 0) AS quantity,
        COALESCE(SUM(total_amount), 0) AS total_cost,
        COUNT(*) AS count
      FROM fuel_records
      WHERE company_id = ? AND deleted_at IS NULL
      GROUP BY vehicle_id
      ORDER BY quantity DESC
      LIMIT 5`,
      [companyId]
    );

    const monthlyEvolution = await this.query(
      `SELECT
        DATE_FORMAT(filled_at, '%Y-%m') AS month,
        COALESCE(SUM(total_amount), 0) AS total_cost,
        COALESCE(SUM(quantity), 0) AS quantity
      FROM fuel_records
      WHERE company_id = ? AND deleted_at IS NULL
        AND filled_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(filled_at, '%Y-%m')
      ORDER BY month ASC`,
      [companyId]
    );

    return {
      totalCost: Number(totals?.total_cost || 0),
      fuelCount: Number(totals?.fuel_count || 0),
      totalQuantity: Number(totals?.total_quantity || 0),
      avgUnitPrice: Number(totals?.avg_unit_price || 0),
      monthTotalCost: Number(monthly?.month_total_cost || 0),
      monthQuantity: Number(monthly?.month_quantity || 0),
      monthCount: Number(monthly?.month_count || 0),
      pendingCount: 0,
      validatedCount: 0,
      cancelledCount: 0,
      topVehicles,
      monthlyEvolution,
    };
  }
}

export default new FuelRepository();
