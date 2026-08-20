ALTER TABLE subscription_plans
  ADD COLUMN IF NOT EXISTS trial_days INT DEFAULT 14 AFTER sort_order,
  ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE AFTER is_active;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE AFTER cancelled_at,
  ADD COLUMN IF NOT EXISTS plan_changed_at TIMESTAMP NULL AFTER renewal_date,
  ADD COLUMN IF NOT EXISTS metadata_json JSON AFTER usage_data;

CREATE UNIQUE INDEX IF NOT EXISTS idx_sub_active_unique
  ON subscriptions (company_id, status)
  WHERE status IN ('trialing', 'active', 'past_due');

CREATE TABLE IF NOT EXISTS billing_invoices (
  id CHAR(26) PRIMARY KEY,
  company_id CHAR(26) NOT NULL,
  subscription_id CHAR(26),
  number VARCHAR(50) NOT NULL UNIQUE,
  status ENUM('draft','issued','paid','partially_paid','overdue','cancelled','refunded') DEFAULT 'draft',
  currency VARCHAR(3) NOT NULL DEFAULT 'XAF',
  issued_date DATE,
  due_date DATE,
  paid_date DATE,
  period_start DATE,
  period_end DATE,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  tax_rate DECIMAL(5,4) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  credit_applied DECIMAL(15,2) DEFAULT 0,
  amount_paid DECIMAL(15,2) DEFAULT 0,
  amount_due DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_bi_company (company_id),
  INDEX idx_bi_subscription (subscription_id),
  INDEX idx_bi_status (status),
  INDEX idx_bi_number (number),
  CONSTRAINT fk_bi_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_bi_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS billing_invoice_items (
  id CHAR(26) PRIMARY KEY,
  invoice_id CHAR(26) NOT NULL,
  kind ENUM('subscription_renewal','setup','usage','addon','credit_note') DEFAULT 'subscription_renewal',
  label VARCHAR(255) NOT NULL,
  description TEXT,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,4) DEFAULT 0,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bii_invoice (invoice_id),
  CONSTRAINT fk_bii_invoice FOREIGN KEY (invoice_id) REFERENCES billing_invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS billing_payments (
  id CHAR(26) PRIMARY KEY,
  company_id CHAR(26) NOT NULL,
  invoice_id CHAR(26),
  number VARCHAR(50) NOT NULL UNIQUE,
  status ENUM('pending','processing','successful','failed','cancelled','refunded') DEFAULT 'pending',
  method ENUM('bank_transfer','mobile_money','card','cash','other') DEFAULT 'bank_transfer',
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'XAF',
  transaction_reference VARCHAR(100),
  payment_date DATE,
  received_date DATE,
  failure_reason TEXT,
  refund_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_bp_company (company_id),
  INDEX idx_bp_invoice (invoice_id),
  INDEX idx_bp_status (status),
  INDEX idx_bp_number (number),
  CONSTRAINT fk_bp_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_bp_invoice FOREIGN KEY (invoice_id) REFERENCES billing_invoices(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS billing_history (
  id CHAR(26) PRIMARY KEY,
  company_id CHAR(26) NOT NULL,
  invoice_id CHAR(26),
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  amount DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'XAF',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bh_company (company_id),
  CONSTRAINT fk_bh_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS billing_settings (
  id CHAR(26) PRIMARY KEY,
  company_id CHAR(26) NOT NULL UNIQUE,
  default_currency VARCHAR(3) DEFAULT 'XAF',
  payment_terms_days INT DEFAULT 30,
  default_tax_rate DECIMAL(5,4) DEFAULT 0.18,
  allow_partial_payments BOOLEAN DEFAULT TRUE,
  invoice_prefix VARCHAR(20) DEFAULT 'NAVIX',
  next_invoice_number INT DEFAULT 1,
  next_payment_number INT DEFAULT 1,
  auto_reminders BOOLEAN DEFAULT TRUE,
  default_payment_methods JSON,
  company_info JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bs_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
