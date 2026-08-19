import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import { validate, validateParams, validateQuery } from '../../middlewares/validate.js';
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  maintenanceQuerySchema,
  maintenanceIdParamSchema,
  calendarQuerySchema,
  historyQuerySchema,
} from './maintenance.schema.js';
import * as maintenanceController from './maintenance.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/stats', maintenanceController.stats);

router.get(
  '/calendar',
  validateQuery(calendarQuerySchema),
  maintenanceController.calendar
);

router.get(
  '/history',
  validateQuery(historyQuerySchema),
  maintenanceController.history
);

router.get(
  '/',
  validateQuery(maintenanceQuerySchema),
  maintenanceController.list
);

router.get(
  '/:id',
  validateParams(maintenanceIdParamSchema),
  maintenanceController.getById
);

router.post(
  '/',
  validate(createMaintenanceSchema),
  maintenanceController.create
);

router.put(
  '/:id',
  validateParams(maintenanceIdParamSchema),
  validate(updateMaintenanceSchema),
  maintenanceController.update
);

router.delete(
  '/:id',
  validateParams(maintenanceIdParamSchema),
  maintenanceController.remove
);

router.patch(
  '/:id/start',
  validateParams(maintenanceIdParamSchema),
  maintenanceController.start
);

router.patch(
  '/:id/complete',
  validateParams(maintenanceIdParamSchema),
  maintenanceController.complete
);

router.patch(
  '/:id/cancel',
  validateParams(maintenanceIdParamSchema),
  maintenanceController.cancel
);

export default router;
