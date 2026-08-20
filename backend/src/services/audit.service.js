import auditRepository from '../repositories/AuditRepository.js';
import { generateId } from '../utils/id.js';
import { SENSITIVE_KEYS } from '../modules/audit/index.js';

function sanitizeValues(values) {
  if (!values || typeof values !== 'object') return null;
  const clean = {};
  for (const [key, value] of Object.entries(values)) {
    if (SENSITIVE_KEYS.has(key)) {
      clean[key] = '***';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      clean[key] = sanitizeValues(value);
    } else {
      clean[key] = value;
    }
  }
  return Object.keys(clean).length > 0 ? clean : null;
}

function extractContext(req) {
  if (!req) return {};
  return {
    ipAddress: req.ip || req.connection?.remoteAddress || null,
    userAgent: req.headers?.['user-agent'] || null,
    userId: req.user?.id || null,
    companyId: req.user?.companyId || req.tenantId || null,
  };
}

export async function recordAudit({
  action,
  actionType = 'crud',
  entityType,
  entityId = null,
  description = null,
  oldValues = null,
  newValues = null,
  status = 'success',
  severity = 'low',
  metadata = null,
  req = null,
  userId = null,
  companyId = null,
  ipAddress = null,
  userAgent = null,
} = {}) {
  try {
    const ctx = extractContext(req);

    const finalUserId = userId || ctx.userId;
    const finalCompanyId = companyId || ctx.companyId;
    const finalIp = ipAddress || ctx.ipAddress;
    const finalUa = userAgent || ctx.userAgent;

    const id = generateId();
    const record = {
      id,
      company_id: finalCompanyId || null,
      user_id: finalUserId || null,
      action,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      description,
      old_values: sanitizeValues(oldValues),
      new_values: sanitizeValues(newValues),
      status,
      severity,
      ip_address: finalIp,
      user_agent: finalUa,
      metadata: metadata ? JSON.stringify(metadata) : null,
    };

    await auditRepository.create(record);
    return record;
  } catch {
    return null;
  }
}

export async function listAuditLogs(query, { companyId, isGlobalAccess }) {
  const page = parseInt(query.page, 10) || 1;
  const limit = Math.min(parseInt(query.limit, 10) || 20, 100);

  const filters = {};
  if (!isGlobalAccess && companyId) {
    filters.company_id = companyId;
  }
  if (query.userId) filters.user_id = query.userId;
  if (query.action) filters.action = query.action;
  if (query.actionType) filters.action_type = query.actionType;
  if (query.resourceType) filters.entity_type = query.resourceType;
  if (query.entityId) filters.entity_id = query.entityId;
  if (query.status) filters.status = query.status;
  if (query.severity) filters.severity = query.severity;
  if (query.dateFrom) filters.dateFrom = query.dateFrom;
  if (query.dateTo) filters.dateTo = `${query.dateTo}T23:59:59.999Z`;

  const sortMap = {
    createdAt: 'created_at',
    userName: 'created_at',
    action: 'action',
    resourceType: 'entity_type',
    companyName: 'created_at',
    severity: 'severity',
    status: 'status',
  };
  const sort = sortMap[query.sortBy] || sortMap[query.sort] || 'created_at';
  const order = query.sortDirection || query.order || 'DESC';

  const result = await auditRepository.findAllWithJoins({
    page,
    limit,
    filters,
    sort,
    order,
    search: query.search || '',
  });

  return {
    items: result.rows,
    total: result.total,
    page,
    pageSize: limit,
  };
}

export async function getAuditLogById(id, { companyId, isGlobalAccess } = {}) {
  const filters = { id };
  if (!isGlobalAccess && companyId) {
    filters.company_id = companyId;
  }
  const result = await auditRepository.findAllWithJoins({
    page: 1,
    limit: 1,
    filters,
    sort: 'created_at',
    order: 'DESC',
  });
  return result.rows[0] || null;
}

export async function getStatistics(companyId) {
  return auditRepository.getStatistics(companyId);
}

export async function getUserActivity(userId, { companyId, isGlobalAccess }) {
  const filters = { user_id: userId };
  if (!isGlobalAccess && companyId) {
    filters.company_id = companyId;
  }

  const result = await auditRepository.findAllWithJoins({
    page: 1,
    limit: 100,
    filters,
    sort: 'created_at',
    order: 'DESC',
  });

  return { items: result.rows };
}

export async function getResourceActivity(entityType, entityId, { companyId, isGlobalAccess }) {
  const filters = { entity_type: entityType, entity_id: entityId };
  if (!isGlobalAccess && companyId) {
    filters.company_id = companyId;
  }

  const result = await auditRepository.findAllWithJoins({
    page: 1,
    limit: 100,
    filters,
    sort: 'created_at',
    order: 'DESC',
  });

  return { items: result.rows };
}
