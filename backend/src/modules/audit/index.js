export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT',
  DOWNLOAD: 'DOWNLOAD',
  UPLOAD: 'UPLOAD',
  ASSIGN: 'ASSIGN',
  UNASSIGN: 'UNASSIGN',
  ACTIVATE: 'ACTIVATE',
  DEACTIVATE: 'DEACTIVATE',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  ARCHIVE: 'ARCHIVE',
  RESTORE: 'RESTORE',
  PAYMENT: 'PAYMENT',
  REFUND: 'REFUND',
  SUBSCRIBE: 'SUBSCRIBE',
  UNSUBSCRIBE: 'UNSUBSCRIBE',
  UPGRADE: 'UPGRADE',
  DOWNGRADE: 'DOWNGRADE',
  SUSPEND: 'SUSPEND',
  PASSWORD_RESET: 'PASSWORD_RESET',
  ROLE_CHANGED: 'ROLE_CHANGED',
  PERMISSION_CHANGED: 'PERMISSION_CHANGED',
  SETTINGS_CHANGED: 'SETTINGS_CHANGED',
};

export const AUDIT_ACTION_VALUES = Object.values(AUDIT_ACTIONS);

export const AUDIT_ACTION_TYPES = {
  authentication: 'authentication',
  authorization: 'authorization',
  crud: 'crud',
  assignment: 'assignment',
  maintenance: 'maintenance',
  fuel: 'fuel',
  trip: 'trip',
  document: 'document',
  billing: 'billing',
  subscription: 'subscription',
  system: 'system',
  security: 'security',
};

export const AUDIT_ACTION_TYPE_VALUES = Object.values(AUDIT_ACTION_TYPES);

export const AUDIT_RESOURCES = {
  company: 'company',
  agency: 'agency',
  vehicle: 'vehicle',
  driver: 'driver',
  assignment: 'assignment',
  trip: 'trip',
  fuel: 'fuel',
  maintenance: 'maintenance',
  document: 'document',
  subscription: 'subscription',
  invoice: 'invoice',
  payment: 'payment',
  user: 'user',
  role: 'role',
  permission: 'permission',
  notification: 'notification',
  report: 'report',
  settings: 'settings',
};

export const AUDIT_RESOURCE_VALUES = Object.values(AUDIT_RESOURCES);

export const AUDIT_STATUSES = {
  success: 'success',
  failed: 'failed',
  warning: 'warning',
  info: 'info',
};

export const AUDIT_STATUS_VALUES = Object.values(AUDIT_STATUSES);

export const AUDIT_SEVERITIES = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  critical: 'critical',
};

export const AUDIT_SEVERITY_VALUES = Object.values(AUDIT_SEVERITIES);

export const SENSITIVE_KEYS = new Set([
  'password', 'password_hash', 'currentPassword', 'newPassword', 'confirmPassword',
  'refresh_token', 'refreshToken', 'access_token', 'accessToken',
  'secret', 'api_key', 'apiKey', 'token', 'creditCard', 'credit_card',
]);
