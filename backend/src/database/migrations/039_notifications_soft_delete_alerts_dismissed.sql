-- Migration 039: Add soft delete to notifications + dismissed_at to alerts (idempotent)

SET @col1 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notifications' AND COLUMN_NAME = 'deleted_at');
SET @sql1 = IF(@col1 = 0,
  'ALTER TABLE notifications ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER updated_at',
  'SELECT 1'
);
PREPARE s1 FROM @sql1; EXECUTE s1; DEALLOCATE PREPARE s1;

SET @idx1 = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notifications' AND INDEX_NAME = 'idx_notifications_deleted_at');
SET @sql2 = IF(@idx1 = 0,
  'ALTER TABLE notifications ADD INDEX idx_notifications_deleted_at (deleted_at)',
  'SELECT 1'
);
PREPARE s2 FROM @sql2; EXECUTE s2; DEALLOCATE PREPARE s2;

SET @col2 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'alerts' AND COLUMN_NAME = 'dismissed_at');
SET @sql3 = IF(@col2 = 0,
  'ALTER TABLE alerts ADD COLUMN dismissed_at TIMESTAMP NULL DEFAULT NULL AFTER resolved_at',
  'SELECT 1'
);
PREPARE s3 FROM @sql3; EXECUTE s3; DEALLOCATE PREPARE s3;

SET @col3 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'alerts' AND COLUMN_NAME = 'dismissed_by');
SET @sql4 = IF(@col3 = 0,
  'ALTER TABLE alerts ADD COLUMN dismissed_by CHAR(26) NULL DEFAULT NULL AFTER dismissed_at',
  'SELECT 1'
);
PREPARE s4 FROM @sql4; EXECUTE s4; DEALLOCATE PREPARE s4;

SET @col4 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'alerts' AND COLUMN_NAME = 'resolved_by');
SET @sql5 = IF(@col4 = 0,
  'ALTER TABLE alerts ADD COLUMN resolved_by CHAR(26) NULL DEFAULT NULL AFTER resolved_at',
  'SELECT 1'
);
PREPARE s5 FROM @sql5; EXECUTE s5; DEALLOCATE PREPARE s5;
