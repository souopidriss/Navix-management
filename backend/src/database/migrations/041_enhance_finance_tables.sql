-- ──────────────────────────────────────────────────────────────────
-- Migration 041: Enhance finance tables for frontend contract
-- ──────────────────────────────────────────────────────────────────

-- 1. Expand financial_transactions.transaction_type to include all frontend types
ALTER TABLE financial_transactions
  MODIFY COLUMN transaction_type ENUM(
    'income','expense','transfer','refund','adjustment',
    'deposit','withdrawal','payment','commission','fee'
  ) NOT NULL;

-- 2. Add direction, source/destination, method, balance_before, label, metadata
ALTER TABLE financial_transactions
  ADD COLUMN direction ENUM('in','out') NOT NULL DEFAULT 'in' AFTER status,
  ADD COLUMN source VARCHAR(255) AFTER direction,
  ADD COLUMN destination VARCHAR(255) AFTER source,
  ADD COLUMN counterparty VARCHAR(255) AFTER destination,
  ADD COLUMN method VARCHAR(50) AFTER counterparty,
  ADD COLUMN balance_before DECIMAL(15,2) AFTER balance_after,
  ADD COLUMN label VARCHAR(255) AFTER description,
  ADD COLUMN metadata_json JSON AFTER label;

-- 3. Add total_in, total_out to financial_accounts
ALTER TABLE financial_accounts
  ADD COLUMN total_in DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER balance,
  ADD COLUMN total_out DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER total_in;

-- 4. Indexes for new columns
CREATE INDEX idx_ft_direction ON financial_transactions(direction);
CREATE INDEX idx_ft_method ON financial_transactions(method);
CREATE INDEX idx_ft_source ON financial_transactions(source);

-- 5. Create payments table for invoice payment tracking
CREATE TABLE IF NOT EXISTS payments (
  id CHAR(26) PRIMARY KEY,
  company_id CHAR(26) NOT NULL,
  invoice_id CHAR(26) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'XAF',
  method ENUM('cash','bank_transfer','card','mobile_money','cheque','other') NOT NULL DEFAULT 'cash',
  status ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  reference VARCHAR(100),
  transaction_reference VARCHAR(100),
  notes TEXT,
  paid_at TIMESTAMP NULL DEFAULT NULL,
  created_by CHAR(26),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_payments_company_id (company_id),
  INDEX idx_payments_invoice_id (invoice_id),
  INDEX idx_payments_status (status),
  INDEX idx_payments_method (method),
  INDEX idx_payments_created_at (created_at),
  CONSTRAINT fk_payments_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Add payment_method to invoice statuses (add 'sent')
ALTER TABLE invoices
  MODIFY COLUMN status ENUM('draft','issued','sent','paid','partially_paid','overdue','cancelled','refunded') NOT NULL DEFAULT 'draft';
