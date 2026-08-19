import notificationRepository from '../repositories/NotificationRepository.js';
import { generateId } from '../utils/id.js';
import { NotFoundError, ValidationError } from '../errors/index.js';
import { NOTIFICATION_TYPES, NOTIFICATION_STATUSES, ALERT_RULES } from '../modules/notifications/index.js';

const VALID_TRANSITIONS = {
  unread: ['read', 'archived', 'dismissed'],
  read: ['unread', 'archived', 'dismissed'],
  archived: ['unread'],
  dismissed: ['unread'],
};

export async function createNotification(data, { companyId, userId }) {
  if (!companyId || !userId) {
    throw new ValidationError('CompanyId et userId requis.');
  }
  if (!NOTIFICATION_TYPES.includes(data.type)) {
    throw new ValidationError(`Type de notification invalide: ${data.type}`);
  }

  if (data.kind && data.entityType && data.entityId) {
    const existing = await notificationRepository.findByKindAndEntity(data.kind, data.entityType, data.entityId, companyId);
    if (existing) return null;
  }

  const id = generateId();
  const record = await notificationRepository.create({
    id,
    company_id: companyId,
    user_id: userId,
    title: data.title,
    message: data.message || '',
    type: data.type || 'system',
    category: data.category || 'info',
    severity: data.severity || 'low',
    status: 'unread',
    is_read: 0,
    kind: data.kind || null,
    entity_type: data.entityType || null,
    entity_id: data.entityId || null,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    expires_at: data.expiresAt || null,
  });

  return notificationRepository.formatResponse(record);
}

export async function listNotifications(query, { userId, companyId, isGlobalAccess }) {
  const opts = {
    page: query.page || 1,
    limit: query.limit || 50,
    sort: query.sort || 'created_at',
    order: query.order || 'DESC',
    status: query.status,
    type: query.type,
    severity: query.severity,
    category: query.category,
  };

  let result;
  if (isGlobalAccess) {
    if (!companyId) {
      throw new ValidationError('CompanyId requis pour l\'accès global.');
    }
    result = await notificationRepository.findByCompanyAll(companyId, opts);
  } else {
    result = await notificationRepository.findByUserAll(userId, opts);
  }

  const items = [];
  for (const row of result.rows) {
    items.push(await notificationRepository.formatResponse(row));
  }

  return {
    notifications: items,
    total: result.total,
    page: opts.page,
    limit: opts.limit,
    totalPages: Math.ceil(result.total / opts.limit),
  };
}

export async function getNotificationById(id, { userId, companyId, isGlobalAccess }) {
  let row;
  if (isGlobalAccess) {
    row = await notificationRepository.findByCompanyIdAndId(companyId, id);
  } else {
    row = await notificationRepository.findByUserAndId(userId, id, companyId);
  }
  if (!row) throw new NotFoundError('Notification');
  return notificationRepository.formatResponse(row);
}

export async function markAsRead(id, { userId, companyId, isGlobalAccess }) {
  const existing = await notificationRepository.findByUserAndId(userId, id, companyId);
  if (!existing && !isGlobalAccess) throw new NotFoundError('Notification');
  if (isGlobalAccess) {
    const byCompany = await notificationRepository.findByCompanyIdAndId(companyId, id);
    if (!byCompany) throw new NotFoundError('Notification');
  }
  if (!VALID_TRANSITIONS[existing?.status]?.includes('read')) {
    return notificationRepository.formatResponse(existing || await notificationRepository.findByCompanyIdAndId(companyId, id));
  }
  const updated = await notificationRepository.markAsRead(id);
  return notificationRepository.formatResponse(updated);
}

export async function markAsUnread(id, { userId, companyId, isGlobalAccess }) {
  let existing;
  if (isGlobalAccess) {
    existing = await notificationRepository.findByCompanyIdAndId(companyId, id);
  } else {
    existing = await notificationRepository.findByUserAndId(userId, id, companyId);
  }
  if (!existing) throw new NotFoundError('Notification');
  if (!VALID_TRANSITIONS[existing.status]?.includes('unread')) {
    return notificationRepository.formatResponse(existing);
  }
  const updated = await notificationRepository.markAsUnread(id);
  return notificationRepository.formatResponse(updated);
}

export async function markAllAsRead({ userId, companyId, isGlobalAccess }) {
  if (isGlobalAccess) {
    throw new ValidationError('Marquer toutes les lues non supporté pour l\'accès global.');
  }
  const count = await notificationRepository.markAllAsRead(userId, companyId);
  return { count };
}

export async function archiveNotification(id, { userId, companyId, isGlobalAccess }) {
  let existing;
  if (isGlobalAccess) {
    existing = await notificationRepository.findByCompanyIdAndId(companyId, id);
  } else {
    existing = await notificationRepository.findByUserAndId(userId, id, companyId);
  }
  if (!existing) throw new NotFoundError('Notification');
  if (!VALID_TRANSITIONS[existing.status]?.includes('archived')) {
    return notificationRepository.formatResponse(existing);
  }
  const updated = await notificationRepository.archive(id);
  return notificationRepository.formatResponse(updated);
}

export async function dismissNotification(id, { userId, companyId, isGlobalAccess }) {
  let existing;
  if (isGlobalAccess) {
    existing = await notificationRepository.findByCompanyIdAndId(companyId, id);
  } else {
    existing = await notificationRepository.findByUserAndId(userId, id, companyId);
  }
  if (!existing) throw new NotFoundError('Notification');
  if (!VALID_TRANSITIONS[existing.status]?.includes('dismissed')) {
    return notificationRepository.formatResponse(existing);
  }
  const updated = await notificationRepository.dismiss(id);
  return notificationRepository.formatResponse(updated);
}

export async function deleteNotification(id, { userId, companyId, isGlobalAccess }) {
  let existing;
  if (isGlobalAccess) {
    existing = await notificationRepository.findByCompanyIdAndId(companyId, id);
  } else {
    existing = await notificationRepository.findByUserAndId(userId, id, companyId);
  }
  if (!existing) throw new NotFoundError('Notification');
  await notificationRepository.softDelete(id);
  return { id };
}

export async function getUnreadCount({ userId }) {
  const count = await notificationRepository.findUnreadCount(userId);
  return { count };
}

export async function getStatistics({ userId, companyId, isGlobalAccess }) {
  let stats;
  if (isGlobalAccess && companyId) {
    stats = await notificationRepository.getStatsByCompany(companyId);
  } else {
    stats = await notificationRepository.getStats(userId);
  }
  return {
    totalCount: Number(stats?.totalCount || 0),
    unreadCount: Number(stats?.unreadCount || 0),
    readCount: Number(stats?.readCount || 0),
    archivedCount: Number(stats?.archivedCount || 0),
    dismissedCount: Number(stats?.dismissedCount || 0),
    criticalUnread: Number(stats?.criticalUnread || 0),
    highUnread: Number(stats?.highUnread || 0),
  };
}

export function getAlertRules() {
  return ALERT_RULES;
}

export async function notifyUser({ companyId, userId, type, category, severity, title, message, kind, entityType, entityId, metadata, expiresAt }) {
  return createNotification({
    type, category, severity, title, message, kind, entityType, entityId, metadata, expiresAt,
  }, { companyId, userId });
}
