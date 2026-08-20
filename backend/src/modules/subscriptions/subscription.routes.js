import { Router } from 'express';
import { validate, validateParams, validateQuery } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { requirePermission } from '../../middlewares/requirePermission.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import {
  createSubscriptionSchema, subscriptionIdParamSchema, subscriptionQuerySchema,
  changePlanSchema, cancelSubscriptionSchema, planIdParamSchema,
  companyIdParamSchema, createPlanSchema, updatePlanSchema,
} from './subscription.schema.js';
import {
  createPlan, updatePlan, archivePlan,
  listHandler, getCurrentSubscriptionHandler,
  getSubscriptionByIdHandler, createSubscriptionHandler,
  changePlanHandler, cancelSubscriptionHandler,
  resumeSubscriptionHandler, renewSubscriptionHandler,
  deleteSubscriptionHandler,
  listFeatures, getPlanFeatures, getPlanLimits,
  getUsage, getUsageWithLimits,
} from './subscription.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/features', listFeatures);

router.get('/plans/:planId/features', validateParams(planIdParamSchema), getPlanFeatures);
router.get('/plans/:planId/limits', validateParams(planIdParamSchema), getPlanLimits);

router.get('/usage/:companyId', validateParams(companyIdParamSchema), (req, res, next) => {
  if (!req.isGlobalAccess && req.params.companyId !== req.tenantId) {
    return res.status(403).json({ success: false, error: { code: 'AUTHORIZATION_ERROR', message: 'Accès refusé.' } });
  }
  next();
}, getUsage);
router.get('/usage', getUsageWithLimits);

router.post('/', validate(createSubscriptionSchema), createSubscriptionHandler);

router.get('/', validateQuery(subscriptionQuerySchema), listHandler);

router.get('/current', getCurrentSubscriptionHandler);

router.get('/:id', validateParams(subscriptionIdParamSchema), getSubscriptionByIdHandler);

router.patch('/:id', validateParams(subscriptionIdParamSchema), validate(changePlanSchema), changePlanHandler);

router.post('/:id/cancel', validateParams(subscriptionIdParamSchema), validate(cancelSubscriptionSchema), cancelSubscriptionHandler);
router.post('/:id/resume', validateParams(subscriptionIdParamSchema), resumeSubscriptionHandler);
router.post('/:id/renew', validateParams(subscriptionIdParamSchema), renewSubscriptionHandler);
router.delete('/:id', validateParams(subscriptionIdParamSchema), deleteSubscriptionHandler);

router.post('/plans', requirePermission('subscriptions.manage'), validate(createPlanSchema), createPlan);
router.put('/plans/:id', requirePermission('subscriptions.manage'), validate(updatePlanSchema), updatePlan);
router.delete('/plans/:id', requirePermission('subscriptions.manage'), archivePlan);

export default router;
