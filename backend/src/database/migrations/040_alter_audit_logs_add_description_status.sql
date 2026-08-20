-- Migration 040: Add description, action_type, severity, status to audit_logs (idempotent)

SET @c1 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND COLUMN_NAME = 'description');
SET @s1 = IF(@c1 = 0, 'ALTER TABLE audit_logs ADD COLUMN description VARCHAR(500) NULL AFTER entity_id', 'SELECT 1');
PREPARE s1 FROM @s1; EXECUTE s1; DEALLOCATE PREPARE s1;

SET @c2 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND COLUMN_NAME = 'action_type');
SET @s2 = IF(@c2 = 0, 'ALTER TABLE audit_logs ADD COLUMN action_type VARCHAR(50) NULL AFTER action', 'SELECT 1');
PREPARE s2 FROM @s2; EXECUTE s2; DEALLOCATE PREPARE s2;

SET @c3 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND COLUMN_NAME = 'severity');
SET @s3 = IF(@c3 = 0, 'ALTER TABLE audit_logs ADD COLUMN severity VARCHAR(20) NULL DEFAULT \'low\' AFTER old_values', 'SELECT 1');
PREPARE s3 FROM @s3; EXECUTE s3; DEALLOCATE PREPARE s3;

SET @c4 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND COLUMN_NAME = 'status');
SET @s4 = IF(@c4 = 0, 'ALTER TABLE audit_logs ADD COLUMN status VARCHAR(20) NULL DEFAULT \'success\' AFTER severity', 'SELECT 1');
PREPARE s4 FROM @s4; EXECUTE s4; DEALLOCATE PREPARE s4;

SET @i1 = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND INDEX_NAME = 'idx_audit_logs_status');
SET @s5 = IF(@i1 = 0, 'CREATE INDEX idx_audit_logs_status ON audit_logs (status)', 'SELECT 1');
PREPARE s5 FROM @s5; EXECUTE s5; DEALLOCATE PREPARE s5;

SET @i2 = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND INDEX_NAME = 'idx_audit_logs_severity');
SET @s6 = IF(@i2 = 0, 'CREATE INDEX idx_audit_logs_severity ON audit_logs (severity)', 'SELECT 1');
PREPARE s6 FROM @s6; EXECUTE s6; DEALLOCATE PREPARE s6;

SET @i3 = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND INDEX_NAME = 'idx_audit_logs_action_type');
SET @s7 = IF(@i3 = 0, 'CREATE INDEX idx_audit_logs_action_type ON audit_logs (action_type)', 'SELECT 1');
PREPARE s7 FROM @s7; EXECUTE s7; DEALLOCATE PREPARE s7;

SET @i4 = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND INDEX_NAME = 'idx_audit_logs_company_created');
SET @s8 = IF(@i4 = 0, 'CREATE INDEX idx_audit_logs_company_created ON audit_logs (company_id, created_at DESC)', 'SELECT 1');
PREPARE s8 FROM @s8; EXECUTE s8; DEALLOCATE PREPARE s8;
