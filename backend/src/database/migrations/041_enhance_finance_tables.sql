-- ──────────────────────────────────────────────────────────────────
-- Migration 041: Enhance finance tables for frontend contract (idempotent)
-- ──────────────────────────────────────────────────────────────────

-- 1. Expand financial_transactions.transaction_type to include all frontend types
ALTER TABLE financial_transactions
  MODIFY COLUMN transaction_type ENUM(
    'income','expense','transfer','refund','adjustment',
    'deposit','withdrawal','payment','commission','fee'
  ) NOT NULL;

-- 2. Add direction, source/destination, method, balance_before, label, metadata (idempotent)
SET @c1 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'financial_transactions' AND COLUMN_NAME = 'direction');
SET @s1 = IF(@c1 = 0,
  "ALTER TABLE financial_transactions ADD COLUMN direction ENUM('in','out') NOT NULL DEFAULT 'in' AFTER status, ADD COLUMN source VARCHAR(255) AFTER direction, ADD COLUMN destination VARCHAR(255) AFTER source, ADD COLUMN counterparty VARCHAR(255) AFTER destination, ADD COLUMN method VARCHAR(50) AFTER counterparty, ADD COLUMN balance_before DECIMAL(15,2) AFTER balance_after, ADD COLUMN label VARCHAR(255) AFTER description, ADD COLUMN metadata_json JSON AFTER label",
  'SELECT 1');
PREPARE s1 FROM @s1; EXECUTE s1; DEALLOCATE PREPARE s1;

-- 3. Add total_in, total_out to financial_accounts (idempotent)
SET @c2 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'financial_accounts' AND COLUMN_NAME = 'total_in');
SET @s2 = IF(@c2 = 0,
  "ALTER TABLE financial_accounts ADD COLUMN total_in DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER balance, ADD COLUMN total_out DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER total_in",
  'SELECT 1');
PREPARE s2 FROM @s2; EXECUTE s2; DEALLOCATE PREPARE s2;

-- 4. Indexes for new columns (idempotent)
SET @i1 = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'financial_transactions' AND INDEX_NAME = 'idx_ft_direction');
SET @s3 = IF(@i1 = 0, 'CREATE INDEX idx_ft_direction ON financial_transactions(direction)', 'SELECT 1');
PREPARE s3 FROM @s3; EXECUTE s3; DEALLOCATE PREPARE s3;

SET @i2 = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'financial_transactions' AND INDEX_NAME = 'idx_ft_method');
SET @s4 = IF(@i2 = 0, 'CREATE INDEX idx_ft_method ON financial_transactions(method)', 'SELECT 1');
PREPARE s4 FROM @s4; EXECUTE s4; DEALLOCATE PREPARE s4;

SET @i3 = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'financial_transactions' AND INDEX_NAME = 'idx_ft_source');
SET @s5 = IF(@i3 = 0, 'CREATE INDEX idx_ft_source ON financial_transactions(source)', 'SELECT 1');
PREPARE s5 FROM @s5; EXECUTE s5; DEALLOCATE PREPARE s5;

-- 5. Create payments table for invoice payment tracking (IF NOT EXISTS)
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
  CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Add 'sent' to invoice statuses
ALTER TABLE invoices
  MODIFY COLUMN status ENUM('draft','issued','sent','paid','partially_paid','overdue','cancelled','refunded') NOT NULL DEFAULT 'draft';
