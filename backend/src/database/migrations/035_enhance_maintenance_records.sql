ALTER TABLE maintenance_records
  ADD COLUMN workshop VARCHAR(255) NULL AFTER description,
  ADD COLUMN mechanic VARCHAR(255) NULL AFTER workshop,
  ADD COLUMN supplier VARCHAR(255) NULL AFTER mechanic,
  ADD COLUMN diagnostic TEXT NULL AFTER supplier,
  ADD COLUMN performed_work TEXT NULL AFTER diagnostic,
  ADD COLUMN replaced_parts TEXT NULL AFTER performed_work,
  ADD COLUMN attachments TEXT NULL AFTER replaced_parts,
  ADD COLUMN currency VARCHAR(10) DEFAULT 'XAF' AFTER actual_cost,
  ADD COLUMN created_by VARCHAR(255) NULL AFTER notes,
  ADD INDEX idx_maintenance_completed_at (completed_at),
  ADD INDEX idx_maintenance_next_date (next_maintenance_date);
