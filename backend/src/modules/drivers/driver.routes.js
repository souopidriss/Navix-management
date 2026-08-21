import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import { subscriptionGuard } from '../../middlewares/subscriptionGuard.js';
import { validate, validateParams, validateQuery } from '../../middlewares/validate.js';
import {
  createDriverSchema,
  updateDriverSchema,
  driverQuerySchema,
  driverIdParamSchema,
} from './driver.schema.js';
import * as driverController from './driver.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/stats', driverController.stats);

router.get(
  '/',
  validateQuery(driverQuerySchema),
  driverController.list
);

router.get(
  '/:id',
  validateParams(driverIdParamSchema),
  driverController.getById
);

router.post(
  '/',
  subscriptionGuard,
  validate(createDriverSchema),
  driverController.create
);

router.put(
  '/:id',
  validateParams(driverIdParamSchema),
  validate(updateDriverSchema),
  driverController.update
);

router.delete(
  '/:id',
  validateParams(driverIdParamSchema),
  driverController.remove
);

router.patch(
  '/:id/status',
  validateParams(driverIdParamSchema),
  driverController.changeStatus
);

export default router;
