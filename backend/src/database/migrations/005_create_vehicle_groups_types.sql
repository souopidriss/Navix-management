CREATE TABLE IF NOT EXISTS vehicle_groups (
  id CHAR(26) PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  icon VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vehicle_types (
  id CHAR(26) PRIMARY KEY,
  group_id CHAR(26) NOT NULL,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  icon VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vehicle_types_group_id (group_id),
  INDEX idx_vehicle_types_name (name),
  CONSTRAINT fk_vt_group FOREIGN KEY (group_id) REFERENCES vehicle_groups(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
