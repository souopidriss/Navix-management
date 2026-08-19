ALTER TABLE fuel_records
  ADD COLUMN trip_id CHAR(26) NULL AFTER driver_id,
  ADD COLUMN station_name VARCHAR(255) NULL AFTER station,
  ADD COLUMN station_city VARCHAR(100) NULL AFTER station_name,
  ADD COLUMN payment_method ENUM('cash','card','fuel_card','bank_transfer','company_account') NULL AFTER notes,
  ADD COLUMN invoice_number VARCHAR(50) NULL AFTER payment_method,
  ADD COLUMN receipt_image VARCHAR(500) NULL AFTER invoice_number,
  ADD COLUMN status ENUM('pending','validated','cancelled') NOT NULL DEFAULT 'pending' AFTER receipt_image,
  ADD COLUMN created_by VARCHAR(255) NULL AFTER status,
  ADD CONSTRAINT fk_fuel_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
  ADD INDEX idx_fuel_trip_id (trip_id),
  ADD INDEX idx_fuel_status (status);
