-- Migration 039: Add soft delete to notifications + dismissed_at to alerts
-- C5: notifications need deleted_at for soft delete (consistent with all other modules)
-- M2: alerts need dismissed_at/dismissed_by to distinguish from resolved

ALTER TABLE notifications ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER updated_at;
ALTER TABLE notifications ADD INDEX idx_notifications_deleted_at (deleted_at);

ALTER TABLE alerts ADD COLUMN dismissed_at TIMESTAMP NULL DEFAULT NULL AFTER resolved_at;
ALTER TABLE alerts ADD COLUMN dismissed_by CHAR(26) NULL DEFAULT NULL AFTER dismissed_at;
ALTER TABLE alerts ADD COLUMN resolved_by CHAR(26) NULL DEFAULT NULL AFTER resolved_at;
