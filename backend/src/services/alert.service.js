import alertRepository from '../repositories/AlertRepository.js';
import { generateId } from '../utils/id.js';
import { NotFoundError } from '../errors/index.js';

export async function createAlert(data, { companyId }) {
  if (data.ruleCode && data.entityType && data.entityId) {
    const existing = await alertRepository.findByRuleCodeAndEntity(data.ruleCode, companyId, data.entityType, data.entityId);
    if (existing) return null;
  }

  const id = generateId();
  const record = await alertRepository.create({
    id,
    company_id: companyId,
    type: data.type,
    severity: data.severity || 'medium',
    title: data.title,
    message: data.message || '',
    status: 'active',
    entity_type: data.entityType || null,
    entity_id: data.entityId || null,
    rule_code: data.ruleCode || null,
  });

  return alertRepository.formatResponse(record);
}

export async function listAlerts(query, { companyId }) {
  const { rows, total } = await alertRepository.findByCompanyAll(companyId, {
    page: query.page || 1,
    limit: query.limit || 50,
    sort: query.sort || 'created_at',
    order: query.order || 'DESC',
    status: query.status,
    type: query.type,
    severity: query.severity,
  });

  const items = [];
  for (const row of rows) {
    items.push(await alertRepository.formatResponse(row));
  }

  return { alerts: items, total, page: query.page || 1, limit: query.limit || 50 };
}

export async function getAlertById(id, { companyId }) {
  const row = await alertRepository.findByCompanyIdAndId(companyId, id);
  if (!row) throw new NotFoundError('Alerte');
  return alertRepository.formatResponse(row);
}

export async function acknowledgeAlert(id, { companyId, userId }) {
  const existing = await alertRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) throw new NotFoundError('Alerte');
  const updated = await alertRepository.acknowledge(id, userId);
  return alertRepository.formatResponse(updated);
}

export async function resolveAlert(id, { companyId, userId }) {
  const existing = await alertRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) throw new NotFoundError('Alerte');
  const updated = await alertRepository.resolve(id, userId);
  return alertRepository.formatResponse(updated);
}

export async function dismissAlert(id, { companyId, userId }) {
  const existing = await alertRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) throw new NotFoundError('Alerte');
  const updated = await alertRepository.dismissAlert(id, userId);
  return alertRepository.formatResponse(updated);
}

export async function getAlertStats({ companyId }) {
  const stats = await alertRepository.getStats(companyId);
  return {
    total: Number(stats?.total || 0),
    activeCount: Number(stats?.activeCount || 0),
    acknowledgedCount: Number(stats?.acknowledgedCount || 0),
    resolvedCount: Number(stats?.resolvedCount || 0),
    dismissedCount: Number(stats?.dismissedCount || 0),
    criticalActive: Number(stats?.criticalActive || 0),
    highActive: Number(stats?.highActive || 0),
  };
}
