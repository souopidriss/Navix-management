ALTER TABLE maintenance_records
  DROP INDEX IF EXISTS idx_maintenance_completed_at,
  DROP INDEX IF EXISTS idx_maintenance_next_date,
  DROP COLUMN IF EXISTS workshop,
  DROP COLUMN IF EXISTS mechanic,
  DROP COLUMN IF EXISTS supplier,
  DROP COLUMN IF EXISTS diagnostic,
  DROP COLUMN IF EXISTS performed_work,
  DROP COLUMN IF EXISTS replaced_parts,
  DROP COLUMN IF EXISTS attachments,
  DROP COLUMN IF EXISTS currency,
  DROP COLUMN IF EXISTS created_by;
