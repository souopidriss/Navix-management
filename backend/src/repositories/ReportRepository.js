import { getPool } from '../database/index.js';

class ReportRepository {
  async query(sql, params = []) {
    const [rows] = await getPool().query(sql, params);
    return rows;
  }

  async queryOne(sql, params = []) {
    const rows = await this.query(sql, params);
    return rows[0] || null;
  }

  _whereCompany(companyId) {
    return companyId ? 'AND v.company_id = ?' : '';
  }

  _params(companyId, extra = []) {
    return companyId ? [companyId, ...extra] : extra;
  }

  /* -----------------------------------------------------------------------
     FLEET REPORT
     ----------------------------------------------------------------------- */

  async getFleetData(companyId, range) {
    let where = 'WHERE 1=1';
    const params = [];
    if (companyId) { where += ' AND v.company_id = ?'; params.push(companyId); }
    if (range.from) { where += ' AND v.created_at >= ?'; params.push(range.from); }
    if (range.to) { where += ' AND v.created_at <= ?'; params.push(range.to); }

    const vehicles = await this.query(
      `SELECT v.id, v.registration_number, v.brand, v.model, v.status, v.mileage,
              v.fuel_type, v.group_code, v.agency_id, v.company_id, v.created_at
       FROM vehicles v ${where} AND v.deleted_at IS NULL`,
      params,
    );
    return vehicles;
  }

  async getFleetDataForPeriod(companyId, range) {
    let where = 'WHERE 1=1 AND v.deleted_at IS NULL';
    const params = [];
    if (companyId) { where += ' AND v.company_id = ?'; params.push(companyId); }
    if (range.from) { where += ' AND v.created_at >= ?'; params.push(range.from); }
    if (range.to) { where += ' AND v.created_at <= ?'; params.push(range.to); }

    return this.query(
      `SELECT v.id, v.registration_number, v.brand, v.model, v.status, v.mileage,
              v.fuel_type, v.group_code, v.agency_id, v.company_id, v.created_at
       FROM vehicles v ${where}`,
      params,
    );
  }

  /* -----------------------------------------------------------------------
     VEHICLE REPORT
     ----------------------------------------------------------------------- */

  async getVehicleReportData(companyId, range) {
    const vehicles = await this.getFleetData(companyId, { from: '', to: '' });

    const vIds = vehicles.map((v) => v.id);
    if (!vIds.length) return { vehicles: [], fuelCosts: [], maintenanceCosts: [], tripCounts: [] };

    const placeholders = vIds.map(() => '?').join(',');
    const baseParams = companyId ? [companyId, ...vIds] : vIds;

    const fuelWhere = companyId
      ? 'WHERE f.company_id = ? AND f.vehicle_id IN (' + placeholders + ') AND f.deleted_at IS NULL'
      : 'WHERE f.vehicle_id IN (' + placeholders + ') AND f.deleted_at IS NULL';
    const fuelCostParams = [...baseParams];
    if (range.from) { /* push later */ }
    let fuelSql = `SELECT f.vehicle_id, SUM(f.total_amount) as fuel_cost
                   FROM fuel_records f ${fuelWhere}`;
    if (range.from) { fuelSql += ' AND f.created_at >= ?'; fuelCostParams.push(range.from); }
    if (range.to) { fuelSql += ' AND f.created_at <= ?'; fuelCostParams.push(range.to); }
    fuelSql += ' GROUP BY f.vehicle_id';
    const fuelCosts = await this.query(fuelSql, fuelCostParams);

    const maintParams = [...baseParams];
    const maintWhere = companyId
      ? 'WHERE m.company_id = ? AND m.vehicle_id IN (' + placeholders + ') AND m.deleted_at IS NULL'
      : 'WHERE m.vehicle_id IN (' + placeholders + ') AND m.deleted_at IS NULL';
    let maintSql = `SELECT m.vehicle_id, COALESCE(SUM(m.actual_cost), 0) as maintenance_cost
                    FROM maintenance_records m ${maintWhere}`;
    if (range.from) { maintSql += ' AND COALESCE(m.completed_at, m.scheduled_date, m.created_at) >= ?'; maintParams.push(range.from); }
    if (range.to) { maintSql += ' AND COALESCE(m.completed_at, m.scheduled_date, m.created_at) <= ?'; maintParams.push(range.to); }
    maintSql += ' GROUP BY m.vehicle_id';
    const maintenanceCosts = await this.query(maintSql, maintParams);

    const tripParams = [...baseParams];
    const tripWhere = companyId
      ? 'WHERE t.company_id = ? AND t.vehicle_id IN (' + placeholders + ') AND t.deleted_at IS NULL'
      : 'WHERE t.vehicle_id IN (' + placeholders + ') AND t.deleted_at IS NULL';
    let tripSql = `SELECT t.vehicle_id, COUNT(*) as trip_count,
                   COALESCE(SUM(COALESCE(t.actual_distance, t.distance, 0)), 0) as trip_distance
                   FROM trips t ${tripWhere}`;
    if (range.from) { tripSql += ' AND COALESCE(t.departure_date, t.created_at) >= ?'; tripParams.push(range.from); }
    if (range.to) { tripSql += ' AND COALESCE(t.departure_date, t.created_at) <= ?'; tripParams.push(range.to); }
    tripSql += ' GROUP BY t.vehicle_id';
    const tripCounts = await this.query(tripSql, tripParams);

    return { vehicles, fuelCosts, maintenanceCosts, tripCounts };
  }

  /* -----------------------------------------------------------------------
     DRIVER REPORT
     ----------------------------------------------------------------------- */

  async getDriverReportData(companyId, range) {
    let where = 'WHERE d.deleted_at IS NULL';
    const params = [];
    if (companyId) { where += ' AND d.company_id = ?'; params.push(companyId); }

    const drivers = await this.query(
      `SELECT d.id, d.full_name, d.status, d.availability, d.license_category, d.company_id
       FROM drivers d ${where}`,
      params,
    );

    const dIds = drivers.map((d) => d.id);
    if (!dIds.length) return { drivers, trips: [], fuelRecords: [] };

    const placeholders = dIds.map(() => '?').join(',');

    let tripSql = `SELECT t.driver_id, COUNT(*) as trip_count,
                   COALESCE(SUM(COALESCE(t.actual_distance, t.distance, 0)), 0) as distance,
                   COALESCE(SUM(COALESCE(t.actual_duration, t.duration_minutes, 0)), 0) as duration
                   FROM trips t WHERE t.driver_id IN (${placeholders}) AND t.deleted_at IS NULL`;
    const tripParams = [...dIds];
    if (range.from) { tripSql += ' AND COALESCE(t.departure_date, t.created_at) >= ?'; tripParams.push(range.from); }
    if (range.to) { tripSql += ' AND COALESCE(t.departure_date, t.created_at) <= ?'; tripParams.push(range.to); }
    tripSql += ' GROUP BY t.driver_id';
    const trips = await this.query(tripSql, tripParams);

    let fuelSql = `SELECT f.driver_id, COUNT(*) as fuel_count,
                   COALESCE(SUM(f.total_amount), 0) as fuel_cost
                   FROM fuel_records f WHERE f.driver_id IN (${placeholders}) AND f.deleted_at IS NULL`;
    const fuelParams = [...dIds];
    if (range.from) { fuelSql += ' AND f.created_at >= ?'; fuelParams.push(range.from); }
    if (range.to) { fuelSql += ' AND f.created_at <= ?'; fuelParams.push(range.to); }
    fuelSql += ' GROUP BY f.driver_id';
    const fuelRecords = await this.query(fuelSql, fuelParams);

    return { drivers, trips, fuelRecords };
  }

  /* -----------------------------------------------------------------------
     ASSIGNMENT REPORT
     ----------------------------------------------------------------------- */

  async getAssignmentReportData(companyId, range) {
    let where = 'WHERE a.deleted_at IS NULL';
    const params = [];
    if (companyId) { where += ' AND a.company_id = ?'; params.push(companyId); }
    if (range.from) { where += ' AND a.start_date >= ?'; params.push(range.from); }
    if (range.to) { where += ' AND a.start_date <= ?'; params.push(range.to); }

    const assignments = await this.query(
      `SELECT a.id, a.assignment_number, a.assignment_type, a.status,
              a.start_date, a.expected_end_date, a.end_date,
              a.vehicle_id, a.driver_id, a.company_id,
              a.start_mileage, a.end_mileage, a.created_at
       FROM assignments a ${where}`,
      params,
    );
    return assignments;
  }

  /* -----------------------------------------------------------------------
     TRIP REPORT
     ----------------------------------------------------------------------- */

  async getTripReportData(companyId, range) {
    let where = 'WHERE t.deleted_at IS NULL';
    const params = [];
    if (companyId) { where += ' AND t.company_id = ?'; params.push(companyId); }
    if (range.from) { where += ' AND COALESCE(t.departure_date, t.created_at) >= ?'; params.push(range.from); }
    if (range.to) { where += ' AND COALESCE(t.departure_date, t.created_at) <= ?'; params.push(range.to); }

    const trips = await this.query(
      `SELECT t.id, t.trip_number, t.trip_type, t.purpose, t.status,
              t.departure_date, t.origin as departure_location, t.destination as arrival_location,
              COALESCE(t.actual_distance, t.distance, 0) as distance,
              COALESCE(t.actual_duration, t.duration_minutes, 0) as duration,
              t.vehicle_id, t.driver_id, t.company_id, t.created_at
       FROM trips t ${where}`,
      params,
    );
    return trips;
  }

  /* -----------------------------------------------------------------------
     FUEL REPORT
     ----------------------------------------------------------------------- */

  async getFuelReportData(companyId, range) {
    let where = 'WHERE f.deleted_at IS NULL';
    const params = [];
    if (companyId) { where += ' AND f.company_id = ?'; params.push(companyId); }
    if (range.from) { where += ' AND f.created_at >= ?'; params.push(range.from); }
    if (range.to) { where += ' AND f.created_at <= ?'; params.push(range.to); }

    const records = await this.query(
      `SELECT f.id, f.fuel_number, f.fuel_type, f.quantity, f.unit_price,
              f.total_amount, f.status, f.station_name, f.station_city,
              f.vehicle_id, f.driver_id, f.company_id, f.filled_at, f.created_at
       FROM fuel_records f ${where}`,
      params,
    );
    return records;
  }

  /* -----------------------------------------------------------------------
     MAINTENANCE REPORT
     ----------------------------------------------------------------------- */

  async getMaintenanceReportData(companyId, range) {
    let where = 'WHERE m.deleted_at IS NULL';
    const params = [];
    if (companyId) { where += ' AND m.company_id = ?'; params.push(companyId); }
    if (range.from) { where += ' AND COALESCE(m.completed_at, m.scheduled_date, m.created_at) >= ?'; params.push(range.from); }
    if (range.to) { where += ' AND COALESCE(m.completed_at, m.scheduled_date, m.created_at) <= ?'; params.push(range.to); }

    const records = await this.query(
      `SELECT m.id, m.maintenance_number, m.maintenance_type, m.priority, m.status,
              m.scheduled_date, m.completed_at, m.estimated_cost, m.actual_cost,
              m.workshop, m.vehicle_id, m.company_id, m.created_at
       FROM maintenance_records m ${where}`,
      params,
    );
    return records;
  }

  /* -----------------------------------------------------------------------
     DOCUMENT REPORT
     ----------------------------------------------------------------------- */

  async getDocumentReportData(companyId, range) {
    let where = 'WHERE d.deleted_at IS NULL';
    const params = [];
    if (companyId) { where += ' AND d.company_id = ?'; params.push(companyId); }
    if (range.from) { where += ' AND d.created_at >= ?'; params.push(range.from); }
    if (range.to) { where += ' AND d.created_at <= ?'; params.push(range.to); }

    const documents = await this.query(
      `SELECT d.id, d.file_name as name, d.file_extension as extension, d.file_size as size,
              d.category, d.visibility, d.entity_type as association_type,
              d.uploaded_by, d.entity_id, d.company_id, d.created_at
       FROM documents d ${where}`,
      params,
    );
    return documents;
  }

  /* -----------------------------------------------------------------------
     FINANCIAL REPORT
     ----------------------------------------------------------------------- */

  async getFinancialReportData(companyId, range) {
    let where = 'WHERE 1=1';
    const params = [];
    if (companyId) { where += ' AND i.company_id = ?'; params.push(companyId); }
    if (range.from) { where += ' AND i.issued_at >= ?'; params.push(range.from); }
    if (range.to) { where += ' AND i.issued_at <= ?'; params.push(range.to); }

    const invoices = await this.query(
      `SELECT i.id, i.reference as number, i.status, i.currency,
              i.issued_at as issued_date, i.due_at as due_date, i.paid_at as paid_date,
              i.subtotal, i.tax_amount, i.total, i.amount_paid,
              (i.total - i.amount_paid) as amount_due, i.company_id, i.created_at
       FROM invoices i ${where}`,
      params,
    );

    let payWhere = 'WHERE 1=1';
    const payParams = [];
    if (companyId) { payWhere += ' AND p.company_id = ?'; payParams.push(companyId); }
    if (range.from) { payWhere += ' AND p.created_at >= ?'; payParams.push(range.from); }
    if (range.to) { payWhere += ' AND p.created_at <= ?'; payParams.push(range.to); }

    const payments = await this.query(
      `SELECT p.id, p.reference as number, p.status, p.method, p.amount, p.currency,
              COALESCE(p.paid_at, p.created_at) as payment_date, p.company_id, p.created_at
       FROM payments p ${payWhere}`,
      payParams,
    );

    return { invoices, payments };
  }

  /* -----------------------------------------------------------------------
     SUBSCRIPTION REPORT
     ----------------------------------------------------------------------- */

  async getSubscriptionReportData(companyId) {
    let where = 'WHERE 1=1';
    const params = [];
    if (companyId) { where += ' AND s.company_id = ?'; params.push(companyId); }

    const subscriptions = await this.query(
      `SELECT s.id, s.company_id, s.status, s.price, s.currency, s.billing_interval,
              s.start_date, s.current_period_end, s.renewal_date, s.created_at
       FROM subscriptions s ${where}`,
      params,
    );
    return subscriptions;
  }

  async getPlanNames() {
    const plans = await this.query('SELECT id, name, code FROM subscription_plans');
    return plans;
  }

  /* -----------------------------------------------------------------------
     AUDIT REPORT
     ----------------------------------------------------------------------- */

  async getAuditReportData(companyId, range) {
    let where = 'WHERE 1=1';
    const params = [];
    if (companyId) { where += ' AND a.company_id = ?'; params.push(companyId); }
    if (range.from) { where += ' AND a.created_at >= ?'; params.push(range.from); }
    if (range.to) { where += ' AND a.created_at <= ?'; params.push(range.to); }

    const logs = await this.query(
      `SELECT a.id, a.action, a.action_type, a.entity_type, a.entity_id,
              a.description, a.status, a.severity, a.company_id, a.created_at
       FROM audit_logs a ${where}`,
      params,
    );
    return logs;
  }

  /* -----------------------------------------------------------------------
     COMPANY REPORT
     ----------------------------------------------------------------------- */

  async getCompanyReportData(companyId) {
    let where = 'WHERE c.deleted_at IS NULL';
    const params = [];
    if (companyId) { where += ' AND c.id = ?'; params.push(companyId); }

    const companies = await this.query(
      `SELECT c.id, c.name, c.code, c.country, c.city, c.status,
              c.subscription_plan, c.subscription_status, c.created_at
       FROM companies c ${where}`,
      params,
    );

    if (!companies.length) return { companies: [], vehicleCounts: [], driverCounts: [], agencyCounts: [] };

    const cIds = companies.map((c) => c.id);
    const placeholders = cIds.map(() => '?').join(',');

    const vehicleCounts = await this.query(
      `SELECT company_id, COUNT(*) as vehicle_count
       FROM vehicles WHERE company_id IN (${placeholders}) AND deleted_at IS NULL
       GROUP BY company_id`,
      cIds,
    );

    const driverCounts = await this.query(
      `SELECT company_id, COUNT(*) as driver_count
       FROM drivers WHERE company_id IN (${placeholders}) AND deleted_at IS NULL
       GROUP BY company_id`,
      cIds,
    );

    const agencyCounts = await this.query(
      `SELECT company_id, COUNT(*) as agency_count
       FROM agencies WHERE company_id IN (${placeholders})
       GROUP BY company_id`,
      cIds,
    );

    return { companies, vehicleCounts, driverCounts, agencyCounts };
  }

  /* -----------------------------------------------------------------------
     DASHBOARD / OVERVIEW
     ----------------------------------------------------------------------- */

  async getDashboardData(companyId, range) {
    const [fleet, trips, fuel, maintenance, financial] = await Promise.all([
      this.getFleetData(companyId, range),
      this.getTripReportData(companyId, range),
      this.getFuelReportData(companyId, range),
      this.getMaintenanceReportData(companyId, range),
      this.getFinancialReportData(companyId, range),
    ]);

    let driverWhere = 'WHERE d.deleted_at IS NULL';
    const driverParams = [];
    if (companyId) { driverWhere += ' AND d.company_id = ?'; driverParams.push(companyId); }
    if (range.from) { driverWhere += ' AND d.created_at >= ?'; driverParams.push(range.from); }
    if (range.to) { driverWhere += ' AND d.created_at <= ?'; driverParams.push(range.to); }

    const drivers = await this.query(
      `SELECT d.id FROM drivers d ${driverWhere}`,
      driverParams,
    );

    return { vehicles: fleet, trips, fuel, maintenance, financial, drivers };
  }

  /* -----------------------------------------------------------------------
     LOOKUP HELPERS
     ----------------------------------------------------------------------- */

  async getVehicleNames(companyId) {
    let where = 'WHERE deleted_at IS NULL';
    const params = [];
    if (companyId) { where += ' AND company_id = ?'; params.push(companyId); }
    return this.query(
      `SELECT id, CONCAT(brand, ' ', model) as name, registration_number FROM vehicles ${where}`,
      params,
    );
  }

  async getDriverNames(companyId) {
    let where = 'WHERE deleted_at IS NULL';
    const params = [];
    if (companyId) { where += ' AND company_id = ?'; params.push(companyId); }
    return this.query(
      `SELECT id, full_name FROM drivers ${where}`,
      params,
    );
  }

  async getAgencyNames(companyId) {
    let where = 'WHERE 1=1';
    const params = [];
    if (companyId) { where += ' AND company_id = ?'; params.push(companyId); }
    return this.query(
      `SELECT id, name FROM agencies ${where}`,
      params,
    );
  }

  async getCompanyNames() {
    return this.query('SELECT id, name FROM companies WHERE deleted_at IS NULL');
  }
}

export default new ReportRepository();
