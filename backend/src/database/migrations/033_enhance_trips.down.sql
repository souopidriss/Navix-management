ALTER TABLE trips DROP FOREIGN KEY fk_trips_assignment;

ALTER TABLE trips
  DROP COLUMN assignment_id,
  DROP COLUMN purpose,
  DROP COLUMN actual_distance,
  DROP COLUMN actual_duration,
  DROP COLUMN average_speed,
  DROP COLUMN passenger_count,
  DROP COLUMN cargo_weight,
  DROP COLUMN started_at,
  DROP COLUMN completed_at,
  DROP COLUMN paused_at,
  DROP COLUMN resumed_at,
  DROP COLUMN paused_by_driver,
  DROP COLUMN created_by;

ALTER TABLE trips
  DROP INDEX idx_trips_assignment_id,
  DROP INDEX idx_trips_company_status,
  DROP INDEX idx_trips_driver_status;
