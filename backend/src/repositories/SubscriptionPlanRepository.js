import { BaseRepository } from './BaseRepository.js';

class SubscriptionPlanRepository extends BaseRepository {
  constructor() {
    super('subscription_plans');
  }

  allowedFilterFields() {
    return ['id', 'name', 'code', 'is_active'];
  }

  allowedSortFields() {
    return ['id', 'name', 'code', 'price_monthly', 'price_yearly', 'sort_order', 'created_at'];
  }

  async findActivePlans() {
    return this.query(
      'SELECT * FROM subscription_plans WHERE is_active = TRUE ORDER BY sort_order ASC, price_monthly ASC'
    );
  }

  async findByCode(code) {
    return this.queryOne(
      'SELECT * FROM subscription_plans WHERE code = ?',
      [code]
    );
  }

  async findByIdWithFeatures(id) {
    return this.queryOne(
      'SELECT * FROM subscription_plans WHERE id = ?',
      [id]
    );
  }

  async countActive() {
    const result = await this.queryOne(
      'SELECT COUNT(*) as total FROM subscription_plans WHERE is_active = TRUE'
    );
    return result?.total || 0;
  }

  async archive(id) {
    return this.update(id, { is_active: false });
  }

  async activate(id) {
    return this.update(id, { is_active: true });
  }
}

export default new SubscriptionPlanRepository();
