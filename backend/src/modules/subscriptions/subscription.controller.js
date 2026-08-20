import * as subscriptionService from '../../services/subscription.service.js';
import * as subscriptionPlanService from '../../services/subscriptionPlan.service.js';
import * as subscriptionUsageService from '../../services/subscriptionUsage.service.js';
import { FEATURES, PLAN_FEATURES } from './index.js';
function getCompanyId(req) {
  if (req.isGlobalAccess) return req.query.companyScopeId || req.tenantId;
  return req.tenantId;
}

export async function listPlans(req, res, next) {
  try {
    const plans = await subscriptionPlanService.listPlans();
    res.json({ success: true, data: plans });
  } catch (error) { next(error); }
}

export async function getPlanById(req, res, next) {
  try {
    const plan = await subscriptionPlanService.getPlanById(req.params.id);
    res.json({ success: true, data: plan });
  } catch (error) { next(error); }
}

export async function createPlan(req, res, next) {
  try {
    const plan = await subscriptionPlanService.createPlan(req.body, { userId: req.user.id });
    res.status(201).json({ success: true, data: plan });
  } catch (error) { next(error); }
}

export async function updatePlan(req, res, next) {
  try {
    const plan = await subscriptionPlanService.updatePlan(req.params.id, req.body, { userId: req.user.id });
    res.json({ success: true, data: plan });
  } catch (error) { next(error); }
}

export async function archivePlan(req, res, next) {
  try {
    const plan = await subscriptionPlanService.archivePlan(req.params.id, { userId: req.user.id });
    res.json({ success: true, data: plan });
  } catch (error) { next(error); }
}

export async function listHandler(req, res, next) {
  try {
    if (req.query.companyScopeId !== undefined || req.query.status || req.query.planId || req.query.billingInterval || req.query.search) {
      const companyId = getCompanyId(req);
      const result = await subscriptionService.listSubscriptions({
        page: req.query.page,
        limit: req.query.limit,
        sort: req.query.sort,
        order: req.query.order,
        status: req.query.status,
        planId: req.query.planId,
        billingInterval: req.query.billingInterval,
        search: req.query.search,
        companyId,
      });
      return res.json({ success: true, data: result.data, pagination: result.pagination });
    }

    const plans = await subscriptionPlanService.listPlans();
    return res.json({ success: true, data: plans });
  } catch (error) { next(error); }
}

export async function getCurrentSubscriptionHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID requis.' });
    }
    const sub = await subscriptionService.getCurrentSubscription(companyId);
    res.json({ success: true, data: sub });
  } catch (error) { next(error); }
}

export async function getSubscriptionByIdHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const sub = await subscriptionService.getSubscriptionById(req.params.id, companyId);
    res.json({ success: true, data: sub });
  } catch (error) { next(error); }
}

export async function createSubscriptionHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const sub = await subscriptionService.createSubscription({ ...req.body, companyId });
    res.status(201).json({ success: true, data: sub });
  } catch (error) { next(error); }
}

export async function changePlanHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const sub = await subscriptionService.changePlan(req.params.id, {
      planId: req.body.planId,
      companyId,
    });
    res.json({ success: true, data: sub });
  } catch (error) { next(error); }
}

export async function cancelSubscriptionHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const sub = await subscriptionService.cancelSubscription(req.params.id, {
      companyId,
      userId: req.user.id,
      reason: req.body.reason,
    });
    res.json({ success: true, data: sub });
  } catch (error) { next(error); }
}

export async function resumeSubscriptionHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const sub = await subscriptionService.resumeSubscription(req.params.id, {
      companyId,
      userId: req.user.id,
    });
    res.json({ success: true, data: sub });
  } catch (error) { next(error); }
}

export async function renewSubscriptionHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const sub = await subscriptionService.renewSubscription(req.params.id, {
      companyId,
      userId: req.user.id,
    });
    res.json({ success: true, data: sub });
  } catch (error) { next(error); }
}

export async function deleteSubscriptionHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    await subscriptionService.deleteSubscription(req.params.id, {
      companyId,
      userId: req.user.id,
    });
    res.json({ success: true, message: 'Abonnement supprimé avec succès.' });
  } catch (error) { next(error); }
}

export async function listFeatures(req, res, next) {
  try {
    res.json({ success: true, data: FEATURES });
  } catch (error) { next(error); }
}

export async function getPlanFeatures(req, res, next) {
  try {
    const plan = await subscriptionPlanService.getPlanById(req.params.planId);
    const codes = PLAN_FEATURES[plan.code] || [];
    const features = FEATURES.filter((f) => codes.includes(f.code));
    res.json({ success: true, data: features });
  } catch (error) { next(error); }
}

export async function getPlanLimits(req, res, next) {
  try {
    const plan = await subscriptionPlanService.getPlanById(req.params.planId);
    const limits = {
      maxVehicles: plan.maxVehicles,
      maxDrivers: plan.maxDrivers,
      maxUsers: plan.maxUsers,
      maxAgencies: plan.maxAgencies,
      maxDocuments: plan.maxDocuments,
      maxStorage: plan.maxStorageGb,
      maxTripsPerMonth: plan.maxTripsPerMonth,
      maxFuelRecordsPerMonth: plan.maxFuelRecordsPerMonth,
      maxMaintenanceRecordsPerMonth: plan.maxMaintenanceRecordsPerMonth,
    };
    res.json({ success: true, data: limits });
  } catch (error) { next(error); }
}

export async function getUsage(req, res, next) {
  try {
    const usage = await subscriptionUsageService.getUsage(req.params.companyId);
    res.json({ success: true, data: usage });
  } catch (error) { next(error); }
}

export async function getUsageWithLimits(req, res, next) {
  try {
    const companyId = req.params.companyId || getCompanyId(req);
    const result = await subscriptionUsageService.getUsageWithLimits(companyId);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
}
