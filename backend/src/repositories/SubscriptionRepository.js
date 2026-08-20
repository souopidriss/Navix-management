import { BaseRepository } from './BaseRepository.js';

class SubscriptionRepository extends BaseRepository {
  constructor() {
    super('subscriptions');
  }

  allowedFilterFields() {
    return ['id', 'company_id', 'plan_id', 'status', 'billing_interval'];
  }

  allowedSortFields() {
    return ['id', 'created_at', 'updated_at', 'start_date', 'end_date', 'status'];
  }

  async findByCompanyId(companyId) {
    return this.queryOne(
      `SELECT s.*, sp.name AS plan_name, sp.code AS plan_code, sp.display_name AS plan_display_name
       FROM subscriptions s
       LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
       WHERE s.company_id = ? AND s.status IN ('trialing', 'active', 'past_due')
       ORDER BY s.created_at DESC LIMIT 1`,
      [companyId]
    );
  }

  async findActiveByCompanyId(companyId) {
    return this.queryOne(
      `SELECT s.*, sp.name AS plan_name, sp.code AS plan_code, sp.display_name AS plan_display_name
       FROM subscriptions s
       LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
       WHERE s.company_id = ? AND s.status IN ('trialing', 'active')
       ORDER BY s.created_at DESC LIMIT 1`,
      [companyId]
    );
  }

  async findWithPlanById(id) {
    return this.queryOne(
      `SELECT s.*, sp.name AS plan_name, sp.code AS plan_code, sp.display_name AS plan_display_name,
              sp.price_monthly, sp.price_yearly, sp.currency AS plan_currency,
              sp.max_vehicles, sp.max_drivers, sp.max_users, sp.max_agencies,
              sp.max_documents, sp.max_storage_gb, sp.max_trips_per_month,
              sp.max_fuel_records_per_month, sp.max_maintenance_records_per_month,
              sp.features AS plan_features
       FROM subscriptions s
       LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
       WHERE s.id = ?`,
      [id]
    );
  }

  async findByCompanyIdWithPlan(companyId) {
    return this.query(
      `SELECT s.*, sp.name AS plan_name, sp.code AS plan_code, sp.display_name AS plan_display_name,
              sp.price_monthly, sp.price_yearly, sp.currency AS plan_currency,
              sp.max_vehicles, sp.max_drivers, sp.max_users, sp.max_agencies,
              sp.max_documents, sp.max_storage_gb, sp.max_trips_per_month,
              sp.max_fuel_records_per_month, sp.max_maintenance_records_per_month,
              sp.features AS plan_features
       FROM subscriptions s
       LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
       WHERE s.company_id = ?
       ORDER BY s.created_at DESC`,
      [companyId]
    );
  }

  async findListWithPlans({ page = 1, limit = 20, filters = {}, sort = 'created_at', order = 'DESC' } = {}) {
    const conditions = [];
    const params = [];

    if (filters.company_id) { conditions.push('s.company_id = ?'); params.push(filters.company_id); }
    if (filters.status) { conditions.push('s.status = ?'); params.push(filters.status); }
    if (filters.plan_id) { conditions.push('s.plan_id = ?'); params.push(filters.plan_id); }
    if (filters.billing_interval) { conditions.push('s.billing_interval = ?'); params.push(filters.billing_interval); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const allowedSort = ['created_at', 'updated_at', 'start_date', 'status'].includes(sort) ? `s.${sort}` : 's.created_at';
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM subscriptions s ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(
      `SELECT s.*, sp.name AS plan_name, sp.code AS plan_code, sp.display_name AS plan_display_name,
              sp.price_monthly, sp.price_yearly, sp.currency AS plan_currency,
              c.name AS company_name
       FROM subscriptions s
       LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
       LEFT JOIN companies c ON c.id = s.company_id
       ${where}
       ORDER BY ${allowedSort} ${allowedOrder}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { rows, total };
  }

  async countActiveByStatus(status) {
    const result = await this.queryOne(
      'SELECT COUNT(*) as total FROM subscriptions WHERE status = ?',
      [status]
    );
    return result?.total || 0;
  }

  async hasActiveSubscription(companyId) {
    const result = await this.queryOne(
      "SELECT 1 as exists_flag FROM subscriptions WHERE company_id = ? AND status IN ('trialing', 'active', 'past_due') LIMIT 1",
      [companyId]
    );
    return !!result;
  }

  async countExpiringTrials(beforeDate) {
    const result = await this.queryOne(
      "SELECT COUNT(*) as total FROM subscriptions WHERE status = 'trialing' AND trial_end_date <= ? AND trial_end_date >= CURDATE()",
      [beforeDate]
    );
    return result?.total || 0;
  }

  async findExpiringTrials(beforeDate) {
    return this.query(
      `SELECT s.*, sp.name AS plan_name, sp.display_name AS plan_display_name,
              c.name AS company_name, c.email AS company_email
       FROM subscriptions s
       LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
       LEFT JOIN companies c ON c.id = s.company_id
       WHERE s.status = 'trialing' AND s.trial_end_date <= ? AND s.trial_end_date >= CURDATE()`,
      [beforeDate]
    );
  }
}

export default new SubscriptionRepository();
