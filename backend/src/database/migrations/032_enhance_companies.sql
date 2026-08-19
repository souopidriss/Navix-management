ALTER TABLE companies
  ADD COLUMN code VARCHAR(12) NULL AFTER name,
  ADD COLUMN trading_name VARCHAR(200) NULL AFTER legal_name,
  ADD COLUMN website VARCHAR(500) NULL AFTER phone,
  ADD COLUMN description TEXT NULL AFTER country;

ALTER TABLE companies
  MODIFY COLUMN logo_url VARCHAR(500) NULL COMMENT 'Renamed to logo in application layer';

ALTER TABLE companies
  MODIFY COLUMN status ENUM('active','inactive','suspended','pending') DEFAULT 'active';

ALTER TABLE companies
  ADD UNIQUE INDEX idx_companies_code (code);

ALTER TABLE companies
  ADD INDEX idx_companies_status (status);
