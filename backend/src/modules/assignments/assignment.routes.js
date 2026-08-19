import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import { validate, validateParams, validateQuery } from '../../middlewares/validate.js';
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  endAssignmentSchema,
  assignmentQuerySchema,
  assignmentIdParamSchema,
} from './assignment.schema.js';
import * as assignmentController from './assignment.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/stats', assignmentController.stats);

router.get(
  '/history',
  validateQuery(assignmentQuerySchema),
  assignmentController.history
);

router.get('/vehicle/:vehicleId', assignmentController.currentByVehicle);
router.get('/driver/:driverId', assignmentController.currentByDriver);

router.get('/by-vehicle/:vehicleId', assignmentController.byVehicle);
router.get('/by-driver/:driverId', assignmentController.byDriver);

router.get(
  '/',
  validateQuery(assignmentQuerySchema),
  assignmentController.list
);

router.get(
  '/:id',
  validateParams(assignmentIdParamSchema),
  assignmentController.getById
);

router.post(
  '/',
  validate(createAssignmentSchema),
  assignmentController.create
);

router.put(
  '/:id',
  validateParams(assignmentIdParamSchema),
  validate(updateAssignmentSchema),
  assignmentController.update
);

router.patch(
  '/:id/start',
  validateParams(assignmentIdParamSchema),
  assignmentController.start
);

router.patch(
  '/:id/end',
  validateParams(assignmentIdParamSchema),
  validate(endAssignmentSchema),
  assignmentController.end
);

router.patch(
  '/:id/cancel',
  validateParams(assignmentIdParamSchema),
  assignmentController.cancel
);

router.delete(
  '/:id',
  validateParams(assignmentIdParamSchema),
  assignmentController.remove
);

export default router;
