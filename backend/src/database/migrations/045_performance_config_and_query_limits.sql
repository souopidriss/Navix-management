SET @max_limit = 100;

SET @exists_flag = 0;
SELECT COUNT(*) INTO @exists_flag FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'performance_config';
SET @sql = IF(@exists_flag = 0,
  'CREATE TABLE IF NOT EXISTS performance_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(50) NOT NULL UNIQUE,
    config_value INT NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

INSERT IGNORE INTO performance_config (config_key, config_value, description) VALUES
  ('max_pagination_limit', 100, 'Maximum allowed page size for paginated endpoints'),
  ('default_pagination_limit', 20, 'Default page size'),
  ('dashboard_query_timeout_ms', 30000, 'Timeout for dashboard aggregate queries');
