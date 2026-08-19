export const NOTIFICATION_TYPES = [
  'system', 'maintenance', 'vehicle', 'driver', 'assignment',
  'trip', 'fuel', 'document', 'billing', 'subscription',
  'user', 'security', 'audit', 'report', 'incident', 'finance',
];

export const NOTIFICATION_CATEGORIES = ['info', 'success', 'warning', 'danger', 'reminder'];

export const NOTIFICATION_SEVERITIES = ['low', 'medium', 'high', 'critical'];

export const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

export const NOTIFICATION_STATUSES = ['unread', 'read', 'archived', 'dismissed'];

export const RESOURCE_TYPES = [
  'company', 'agency', 'vehicle', 'driver', 'assignment',
  'trip', 'fuel', 'maintenance', 'document', 'subscription',
  'invoice', 'payment', 'transaction',
];

export const ALERT_STATUSES = ['active', 'acknowledged', 'resolved', 'dismissed'];

export const ALERT_RULES = [
  { id: 'RULE_MAINTENANCE_DUE_SOON', code: 'maintenance_due_soon', type: 'maintenance', severity: 'medium', threshold: 15, unit: 'days' },
  { id: 'RULE_MAINTENANCE_OVERDUE', code: 'maintenance_overdue', type: 'maintenance', severity: 'high', threshold: 0, unit: 'days' },
  { id: 'RULE_VEHICLE_IMMOBILIZED', code: 'vehicle_immobilized', type: 'vehicle', severity: 'critical', threshold: null, unit: null },
  { id: 'RULE_DOCUMENT_EXPIRING', code: 'document_expiring', type: 'document', severity: 'medium', threshold: 30, unit: 'days' },
  { id: 'RULE_INSURANCE_EXPIRING', code: 'insurance_expiring', type: 'document', severity: 'medium', threshold: 30, unit: 'days' },
  { id: 'RULE_INSPECTION_EXPIRING', code: 'inspection_expiring', type: 'document', severity: 'medium', threshold: 30, unit: 'days' },
  { id: 'RULE_LICENSE_EXPIRING', code: 'license_expiring', type: 'driver', severity: 'medium', threshold: 30, unit: 'days' },
  { id: 'RULE_ABNORMAL_CONSUMPTION', code: 'abnormal_consumption', type: 'fuel', severity: 'high', threshold: 20, unit: 'percent' },
  { id: 'RULE_SUBSCRIPTION_EXPIRING', code: 'subscription_expiring', type: 'subscription', severity: 'high', threshold: 7, unit: 'days' },
  { id: 'RULE_PLAN_LIMIT_WARNING', code: 'plan_limit_warning', type: 'subscription', severity: 'high', threshold: 80, unit: 'percent' },
  { id: 'RULE_PLAN_LIMIT_REACHED', code: 'plan_limit_reached', type: 'subscription', severity: 'critical', threshold: 100, unit: 'percent' },
  { id: 'RULE_INVOICE_OVERDUE', code: 'invoice_overdue', type: 'billing', severity: 'critical', threshold: 0, unit: 'days' },
];
