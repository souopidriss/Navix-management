CREATE TABLE IF NOT EXISTS financial_accounts (
  id CHAR(26) PRIMARY KEY,
  company_id CHAR(26) NOT NULL,
  name VARCHAR(255) NOT NULL,
  account_type ENUM('main','savings','operating','petty_cash','escrow') NOT NULL DEFAULT 'main',
  currency VARCHAR(3) NOT NULL DEFAULT 'XAF',
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  status ENUM('active','frozen','closed') NOT NULL DEFAULT 'active',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_fa_company_id (company_id),
  INDEX idx_fa_account_type (account_type),
  INDEX idx_fa_status (status),
  INDEX idx_fa_deleted_at (deleted_at),
  CONSTRAINT fk_fa_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
