CREATE TABLE IF NOT EXISTS saved_reports (
  id CHAR(26) NOT NULL,
  company_id CHAR(26) NOT NULL,
  user_id CHAR(26) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  report_type VARCHAR(50) NOT NULL,
  status ENUM('draft', 'active', 'archived') NOT NULL DEFAULT 'draft',
  configuration JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_saved_reports_company (company_id),
  INDEX idx_saved_reports_user (user_id),
  INDEX idx_saved_reports_type (report_type),
  INDEX idx_saved_reports_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
