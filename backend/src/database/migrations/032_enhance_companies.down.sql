ALTER TABLE companies DROP INDEX IF EXISTS idx_companies_code;
ALTER TABLE companies DROP INDEX IF EXISTS idx_companies_status;
ALTER TABLE companies DROP COLUMN IF EXISTS code;
ALTER TABLE companies DROP COLUMN IF EXISTS website;
ALTER TABLE companies DROP COLUMN IF EXISTS description;
ALTER TABLE companies MODIFY COLUMN status ENUM('active','inactive','suspended') DEFAULT 'active';
