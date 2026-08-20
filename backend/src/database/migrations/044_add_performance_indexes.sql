SET @dbname = DATABASE();
SET @tablename = '';
SET @indexname = '';
SET @sql = '';

-- vehicles: company_id + status + deleted_at (most-queried pattern)
SELECT COUNT(*) INTO @exists_flag FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'vehicles' AND index_name = 'idx_vehicles_company_status';
SET @sql = IF(@exists_flag = 0, 'CREATE INDEX idx_vehicles_company_status ON vehicles (company_id, status, deleted_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- drivers: company_id + status + deleted_at
SELECT COUNT(*) INTO @exists_flag FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'drivers' AND index_name = 'idx_drivers_company_status';
SET @sql = IF(@exists_flag = 0, 'CREATE INDEX idx_drivers_company_status ON drivers (company_id, status, deleted_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- trips: company_id + status + deleted_at
SELECT COUNT(*) INTO @exists_flag FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'trips' AND index_name = 'idx_trips_company_status';
SET @sql = IF(@exists_flag = 0, 'CREATE INDEX idx_trips_company_status ON trips (company_id, status, deleted_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- assignments: company_id + status + deleted_at
SELECT COUNT(*) INTO @exists_flag FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'assignments' AND index_name = 'idx_assignments_company_status';
SET @sql = IF(@exists_flag = 0, 'CREATE INDEX idx_assignments_company_status ON assignments (company_id, status, deleted_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- fuel_records: company_id + status + deleted_at
SELECT COUNT(*) INTO @exists_flag FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'fuel_records' AND index_name = 'idx_fuel_company_status';
SET @sql = IF(@exists_flag = 0, 'CREATE INDEX idx_fuel_company_status ON fuel_records (company_id, status, deleted_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- maintenance_records: company_id + status + deleted_at
SELECT COUNT(*) INTO @exists_flag FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'maintenance_records' AND index_name = 'idx_maintenance_company_status';
SET @sql = IF(@exists_flag = 0, 'CREATE INDEX idx_maintenance_company_status ON maintenance_records (company_id, status, deleted_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- maintenance_records: company_id + vehicle_id + deleted_at
SELECT COUNT(*) INTO @exists_flag FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'maintenance_records' AND index_name = 'idx_maintenance_company_vehicle';
SET @sql = IF(@exists_flag = 0, 'CREATE INDEX idx_maintenance_company_vehicle ON maintenance_records (company_id, vehicle_id, deleted_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- fuel_records: company_id + vehicle_id + deleted_at
SELECT COUNT(*) INTO @exists_flag FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'fuel_records' AND index_name = 'idx_fuel_company_vehicle';
SET @sql = IF(@exists_flag = 0, 'CREATE INDEX idx_fuel_company_vehicle ON fuel_records (company_id, vehicle_id, deleted_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- fuel_records: vehicle_id + mileage (for last-fill lookups)
SELECT COUNT(*) INTO @exists_flag FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'fuel_records' AND index_name = 'idx_fuel_vehicle_mileage';
SET @sql = IF(@exists_flag = 0, 'CREATE INDEX idx_fuel_vehicle_mileage ON fuel_records (vehicle_id, mileage)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- notifications: company_id + user_id + status
SELECT COUNT(*) INTO @exists_flag FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'notifications' AND index_name = 'idx_notifications_user_status';
SET @sql = IF(@exists_flag = 0, 'CREATE INDEX idx_notifications_user_status ON notifications (company_id, user_id, status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- audit_logs: company_id + created_at
SELECT COUNT(*) INTO @exists_flag FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'audit_logs' AND index_name = 'idx_audit_company_created';
SET @sql = IF(@exists_flag = 0, 'CREATE INDEX idx_audit_company_created ON audit_logs (company_id, created_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- audit_logs: company_id + entity_type + entity_id
SELECT COUNT(*) INTO @exists_flag FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'audit_logs' AND index_name = 'idx_audit_company_entity';
SET @sql = IF(@exists_flag = 0, 'CREATE INDEX idx_audit_company_entity ON audit_logs (company_id, entity_type, entity_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- financial_transactions: company_id + status + direction
SELECT COUNT(*) INTO @exists_flag FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'financial_transactions' AND index_name = 'idx_ft_company_status_direction';
SET @sql = IF(@exists_flag = 0, 'CREATE INDEX idx_ft_company_status_direction ON financial_transactions (company_id, status, direction)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- financial_transactions: company_id + transaction_date
SELECT COUNT(*) INTO @exists_flag FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'financial_transactions' AND index_name = 'idx_ft_company_date';
SET @sql = IF(@exists_flag = 0, 'CREATE INDEX idx_ft_company_date ON financial_transactions (company_id, transaction_date)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- financial_transactions: company_id + category + transaction_type
SELECT COUNT(*) INTO @exists_flag FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'financial_transactions' AND index_name = 'idx_ft_company_category';
SET @sql = IF(@exists_flag = 0, 'CREATE INDEX idx_ft_company_category ON financial_transactions (company_id, category, transaction_type, direction)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- files: company_id + deleted_at + created_at
SELECT COUNT(*) INTO @exists_flag FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'files' AND index_name = 'idx_files_company_created';
SET @sql = IF(@exists_flag = 0, 'CREATE INDEX idx_files_company_created ON files (company_id, deleted_at, created_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- trips: driver_id + company_id + deleted_at
SELECT COUNT(*) INTO @exists_flag FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'trips' AND index_name = 'idx_trips_driver_company';
SET @sql = IF(@exists_flag = 0, 'CREATE INDEX idx_trips_driver_company ON trips (driver_id, company_id, deleted_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- assignments: vehicle_id + status + deleted_at
SELECT COUNT(*) INTO @exists_flag FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'assignments' AND index_name = 'idx_assignments_vehicle_status';
SET @sql = IF(@exists_flag = 0, 'CREATE INDEX idx_assignments_vehicle_status ON assignments (vehicle_id, status, deleted_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- assignments: driver_id + status + deleted_at
SELECT COUNT(*) INTO @exists_flag FROM information_schema.statistics
  WHERE table_schema = @dbname AND table_name = 'assignments' AND index_name = 'idx_assignments_driver_status';
SET @sql = IF(@exists_flag = 0, 'CREATE INDEX idx_assignments_driver_status ON assignments (driver_id, status, deleted_at)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
