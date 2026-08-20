import subscriptionRepository from '../repositories/SubscriptionRepository.js';
import subscriptionPlanRepository from '../repositories/SubscriptionPlanRepository.js';
import companyRepository from '../repositories/CompanyRepository.js';
import { NotFoundError, ConflictError, BadRequestError } from '../errors/index.js';
import { getPool } from '../database/index.js';
import { generateId } from '../utils/id.js';
import { recordAudit } from './audit.service.js';

function formatDate(date) {
  if (!date) return null;
  if (date instanceof Date) return date.toISOString().split('T')[0];
  return String(date).split('T')[0];
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function addYears(date, years) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function formatSubscriptionResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    companyId: row.company_id,
    companyName: row.company_name || null,
    planId: row.plan_id,
    planName: row.plan_name || null,
    planCode: row.plan_code || null,
    planDisplayName: row.plan_display_name || null,
    status: row.status,
    billingInterval: row.billing_interval,
    price: Number(row.price) || 0,
    currency: row.currency || 'XAF',
    trialStartDate: row.trial_start_date,
    trialEndDate: row.trial_end_date,
    startDate: row.start_date,
    endDate: row.end_date,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: !!row.cancel_at_period_end,
    cancelledAt: row.cancelled_at,
    cancellationReason: row.cancellation_reason || null,
    renewalDate: row.renewal_date,
    planChangedAt: row.plan_changed_at,
    usageData: row.usage_data ? (typeof row.usage_data === 'string' ? JSON.parse(row.usage_data) : row.usage_data) : {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCurrentSubscription(companyId) {
  const sub = await subscriptionRepository.findActiveByCompanyId(companyId);
  if (!sub) return null;
  return formatSubscriptionResponse(sub);
}

export async function getSubscriptionById(id, companyId) {
  const sub = await subscriptionRepository.findWithPlanById(id);
  if (!sub) throw new NotFoundError('Abonnement');
  if (companyId && sub.company_id !== companyId) throw new NotFoundError('Abonnement');
  return formatSubscriptionResponse(sub);
}

export async function listSubscriptions({ page, limit, sort, order, status, planId, billingInterval, search, companyId }) {
  const filters = {};
  if (status) filters.status = status;
  if (planId) filters.plan_id = planId;
  if (billingInterval) filters.billing_interval = billingInterval;
  if (companyId) filters.company_id = companyId;

  const result = await subscriptionRepository.findListWithPlans({
    page: page || 1,
    limit: limit || 20,
    filters,
    sort: sort || 'created_at',
    order: order || 'DESC',
  });

  let rows = result.rows;
  if (search) {
    const s = search.toLowerCase();
    rows = rows.filter(r =>
      (r.company_name || '').toLowerCase().includes(s) ||
      (r.plan_name || '').toLowerCase().includes(s) ||
      (r.plan_display_name || '').toLowerCase().includes(s)
    );
  }

  return {
    data: rows.map(formatSubscriptionResponse),
    pagination: {
      total: search ? rows.length : result.total,
      page: page || 1,
      limit: limit || 20,
      totalPages: Math.ceil((search ? rows.length : result.total) / (limit || 20)),
    },
  };
}

export async function createSubscription({ companyId, planId, billingInterval = 'monthly' }) {
  const company = await companyRepository.findById(companyId);
  if (!company) throw new NotFoundError('Entreprise');

  const plan = await subscriptionPlanRepository.findById(planId);
  if (!plan) throw new NotFoundError('Plan');
  if (!plan.is_active) throw new BadRequestError('Ce plan n\'est plus disponible.');

  const hasActive = await subscriptionRepository.hasActiveSubscription(companyId);
  if (hasActive) {
    throw new ConflictError('Cette entreprise possède déjà un abonnement actif.');
  }

  const today = new Date();
  const price = billingInterval === 'yearly' ? Number(plan.price_yearly) : Number(plan.price_monthly);
  const trialDays = plan.trial_days || 14;
  const trialStart = today;
  const trialEnd = new Date(today);
  trialEnd.setDate(trialEnd.getDate() + trialDays);
  const startDate = trialEnd;
  const endDate = billingInterval === 'yearly' ? addYears(startDate, 1) : addMonths(startDate, 1);

  const subId = generateId();

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO subscriptions (id, company_id, plan_id, status, billing_interval, price, currency,
        trial_start_date, trial_end_date, start_date, end_date,
        current_period_start, current_period_end, renewal_date, created_at, updated_at)
       VALUES (?, ?, ?, 'trialing', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [subId, companyId, planId, billingInterval, price, plan.currency || 'XAF',
       formatDate(trialStart), formatDate(trialEnd), formatDate(startDate), formatDate(endDate),
       formatDate(startDate), formatDate(endDate), formatDate(endDate)]
    );

    await conn.query(
      'UPDATE companies SET subscription_plan = ?, subscription_status = ?, updated_at = NOW() WHERE id = ?',
      [plan.code, 'trialing', companyId]
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  const sub = await subscriptionRepository.findWithPlanById(subId);
  recordAudit({ companyId, action: 'subscription.create', actionType: 'CREATE', entityType: 'subscription', entityId: subId, description: `Abonnement créé: ${plan.display_name} (${billingInterval})`, newValues: { planId, billingInterval, status: 'trialing' } }).catch(() => {});

  return formatSubscriptionResponse(sub);
}

export async function changePlan(id, { planId, companyId }) {
  const sub = await subscriptionRepository.findWithPlanById(id);
  if (!sub) throw new NotFoundError('Abonnement');
  if (companyId && sub.company_id !== companyId) throw new NotFoundError('Abonnement');

  if (sub.status === 'cancelled' || sub.status === 'expired') {
    throw new BadRequestError('Impossible de changer le plan d\'un abonnement annulé ou expiré.');
  }

  const newPlan = await subscriptionPlanRepository.findById(planId);
  if (!newPlan) throw new NotFoundError('Plan');
  if (!newPlan.is_active) throw new BadRequestError('Ce plan n\'est plus disponible.');

  const price = sub.billing_interval === 'yearly' ? Number(newPlan.price_yearly) : Number(newPlan.price_monthly);

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE subscriptions SET plan_id = ?, price = ?, plan_changed_at = NOW(), updated_at = NOW() WHERE id = ?`,
      [planId, price, id]
    );

    await conn.query(
      'UPDATE companies SET subscription_plan = ?, updated_at = NOW() WHERE id = ?',
      [newPlan.code, sub.company_id]
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  const updated = await subscriptionRepository.findWithPlanById(id);
  recordAudit({ companyId: sub.company_id, action: 'subscription.plan_change', actionType: 'UPDATE', entityType: 'subscription', entityId: id, description: `Plan changé: ${sub.plan_code} → ${newPlan.code}`, newValues: { planId, price } }).catch(() => {});

  return formatSubscriptionResponse(updated);
}

export async function cancelSubscription(id, { companyId, userId, reason } = {}) {
  const sub = await subscriptionRepository.findWithPlanById(id);
  if (!sub) throw new NotFoundError('Abonnement');
  if (companyId && sub.company_id !== companyId) throw new NotFoundError('Abonnement');

  if (sub.status === 'cancelled' || sub.status === 'expired') {
    throw new BadRequestError('Cet abonnement est déjà annulé ou expiré.');
  }

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE subscriptions SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = ?, updated_at = NOW() WHERE id = ?`,
      [reason || null, id]
    );

    await conn.query(
      "UPDATE companies SET subscription_status = 'cancelled', updated_at = NOW() WHERE id = ?",
      [sub.company_id]
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  const updated = await subscriptionRepository.findWithPlanById(id);
  recordAudit({ companyId: sub.company_id, userId, action: 'subscription.cancel', actionType: 'UPDATE', entityType: 'subscription', entityId: id, description: `Abonnement annulé`, oldValues: { status: sub.status }, newValues: { status: 'cancelled' } }).catch(() => {});

  return formatSubscriptionResponse(updated);
}

export async function resumeSubscription(id, { companyId, userId } = {}) {
  const sub = await subscriptionRepository.findWithPlanById(id);
  if (!sub) throw new NotFoundError('Abonnement');
  if (companyId && sub.company_id !== companyId) throw new NotFoundError('Abonnement');

  if (sub.status !== 'paused' && sub.status !== 'cancelled') {
    throw new BadRequestError('Seuls les abonnements suspendus ou annulés peuvent être réactivés.');
  }

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE subscriptions SET status = 'active', cancelled_at = NULL, cancellation_reason = NULL, updated_at = NOW() WHERE id = ?`,
      [id]
    );

    await conn.query(
      "UPDATE companies SET subscription_status = 'active', updated_at = NOW() WHERE id = ?",
      [sub.company_id]
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  const updated = await subscriptionRepository.findWithPlanById(id);
  recordAudit({ companyId: sub.company_id, userId, action: 'subscription.reactivate', actionType: 'UPDATE', entityType: 'subscription', entityId: id, description: `Abonnement réactivé`, oldValues: { status: sub.status }, newValues: { status: 'active' } }).catch(() => {});

  return formatSubscriptionResponse(updated);
}

export async function renewSubscription(id, { companyId, userId } = {}) {
  const sub = await subscriptionRepository.findWithPlanById(id);
  if (!sub) throw new NotFoundError('Abonnement');
  if (companyId && sub.company_id !== companyId) throw new NotFoundError('Abonnement');

  if (sub.status === 'cancelled' || sub.status === 'expired') {
    throw new BadRequestError('Impossible de renouveler un abonnement annulé ou expiré.');
  }

  const today = new Date();
  const newStart = today;
  const newEnd = sub.billing_interval === 'yearly' ? addYears(today, 1) : addMonths(today, 1);

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE subscriptions SET status = 'active', start_date = ?, end_date = ?,
        current_period_start = ?, current_period_end = ?, renewal_date = ?, updated_at = NOW()
       WHERE id = ?`,
      [formatDate(newStart), formatDate(newEnd), formatDate(newStart), formatDate(newEnd), formatDate(newEnd), id]
    );

    await conn.query(
      'UPDATE companies SET subscription_status = ?, updated_at = NOW() WHERE id = ?',
      ['active', sub.company_id]
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  const updated = await subscriptionRepository.findWithPlanById(id);
  recordAudit({ companyId: sub.company_id, userId, action: 'subscription.renew', actionType: 'UPDATE', entityType: 'subscription', entityId: id, description: `Abonnement renouvelé`, newValues: { startDate: formatDate(newStart), endDate: formatDate(newEnd) } }).catch(() => {});

  return formatSubscriptionResponse(updated);
}

export async function suspendSubscription(id, { companyId, userId, reason } = {}) {
  const sub = await subscriptionRepository.findWithPlanById(id);
  if (!sub) throw new NotFoundError('Abonnement');
  if (companyId && sub.company_id !== companyId) throw new NotFoundError('Abonnement');

  if (sub.status === 'cancelled' || sub.status === 'expired' || sub.status === 'paused') {
    throw new BadRequestError('Cet abonnement ne peut pas être suspendu.');
  }

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE subscriptions SET status = 'paused', cancellation_reason = ?, updated_at = NOW() WHERE id = ?`,
      [reason || 'Suspendu par l\'administrateur', id]
    );

    await conn.query(
      "UPDATE companies SET subscription_status = 'suspended', updated_at = NOW() WHERE id = ?",
      [sub.company_id]
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  const updated = await subscriptionRepository.findWithPlanById(id);
  recordAudit({ companyId: sub.company_id, userId, action: 'subscription.suspend', actionType: 'UPDATE', entityType: 'subscription', entityId: id, description: `Abonnement suspendu: ${reason || 'N/A'}`, oldValues: { status: sub.status }, newValues: { status: 'paused' } }).catch(() => {});

  return formatSubscriptionResponse(updated);
}

export async function deleteSubscription(id, { companyId, userId } = {}) {
  const sub = await subscriptionRepository.findById(id);
  if (!sub) throw new NotFoundError('Abonnement');
  if (companyId && sub.company_id !== companyId) throw new NotFoundError('Abonnement');

  await subscriptionRepository.softDelete(id);
  recordAudit({ companyId: sub.company_id, userId, action: 'subscription.delete', actionType: 'DELETE', entityType: 'subscription', entityId: id, description: `Abonnement supprimé` }).catch(() => {});

  return { message: 'Abonnement supprimé avec succès.' };
}
