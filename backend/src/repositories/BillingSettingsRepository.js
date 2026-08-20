import { BaseRepository } from './BaseRepository.js';
import { generateId } from '../utils/id.js';

class BillingSettingsRepository extends BaseRepository {
  constructor() {
    super('billing_settings');
  }

  async findByCompanyId(companyId) {
    return this.queryOne(
      'SELECT * FROM billing_settings WHERE company_id = ?',
      [companyId]
    );
  }

  async findOrCreate(companyId) {
    let settings = await this.findByCompanyId(companyId);
    if (!settings) {
      settings = await this.create({
        id: generateId(),
        company_id: companyId,
        default_currency: 'XAF',
        payment_terms_days: 30,
        default_tax_rate: 0.18,
        allow_partial_payments: true,
        invoice_prefix: 'NAVIX',
        next_invoice_number: 1,
        next_payment_number: 1,
        auto_reminders: true,
      });
    }
    return settings;
  }
}

export default new BillingSettingsRepository();
