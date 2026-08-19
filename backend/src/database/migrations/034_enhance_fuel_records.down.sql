ALTER TABLE fuel_records
  DROP FOREIGN KEY fk_fuel_trip,
  DROP INDEX idx_fuel_trip_id,
  DROP INDEX idx_fuel_status,
  DROP COLUMN trip_id,
  DROP COLUMN station_name,
  DROP COLUMN station_city,
  DROP COLUMN payment_method,
  DROP COLUMN invoice_number,
  DROP COLUMN receipt_image,
  DROP COLUMN status,
  DROP COLUMN created_by;
