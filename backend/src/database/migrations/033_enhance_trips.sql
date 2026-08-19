ALTER TABLE trips
  ADD COLUMN assignment_id CHAR(26) NULL AFTER driver_id,
  ADD COLUMN purpose VARCHAR(255) NULL AFTER trip_type,
  ADD COLUMN actual_distance DECIMAL(10,2) DEFAULT 0 AFTER distance,
  ADD COLUMN actual_duration INT DEFAULT 0 AFTER duration_minutes,
  ADD COLUMN average_speed DECIMAL(8,2) DEFAULT 0 AFTER actual_duration,
  ADD COLUMN passenger_count INT DEFAULT 0 AFTER end_mileage,
  ADD COLUMN cargo_weight DECIMAL(10,2) DEFAULT 0 AFTER passenger_count,
  ADD COLUMN started_at TIMESTAMP NULL AFTER notes,
  ADD COLUMN completed_at TIMESTAMP NULL AFTER started_at,
  ADD COLUMN paused_at TIMESTAMP NULL AFTER completed_at,
  ADD COLUMN resumed_at TIMESTAMP NULL AFTER paused_at,
  ADD COLUMN paused_by_driver TINYINT(1) DEFAULT 0 AFTER resumed_at,
  ADD COLUMN created_by VARCHAR(255) NULL AFTER paused_by_driver;

ALTER TABLE trips
  ADD CONSTRAINT fk_trips_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL;

ALTER TABLE trips
  ADD INDEX idx_trips_assignment_id (assignment_id),
  ADD INDEX idx_trips_company_status (company_id, status),
  ADD INDEX idx_trips_driver_status (driver_id, status);
