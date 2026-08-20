ALTER TABLE audit_logs
  ADD COLUMN description VARCHAR(500) NULL AFTER entity_id;

ALTER TABLE audit_logs
  ADD COLUMN action_type VARCHAR(50) NULL AFTER action;

ALTER TABLE audit_logs
  ADD COLUMN severity VARCHAR(20) NULL DEFAULT 'low' AFTER old_values;

ALTER TABLE audit_logs
  ADD COLUMN status VARCHAR(20) NULL DEFAULT 'success' AFTER severity;

CREATE INDEX idx_audit_logs_status ON audit_logs (status);
CREATE INDEX idx_audit_logs_severity ON audit_logs (severity);
CREATE INDEX idx_audit_logs_action_type ON audit_logs (action_type);
CREATE INDEX idx_audit_logs_company_created ON audit_logs (company_id, created_at DESC);
