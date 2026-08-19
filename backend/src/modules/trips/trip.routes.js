import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import { validate, validateParams, validateQuery } from '../../middlewares/validate.js';
import {
  createTripSchema,
  updateTripSchema,
  finishTripSchema,
  tripQuerySchema,
  tripIdParamSchema,
} from './trip.schema.js';
import * as tripController from './trip.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/stats', tripController.stats);

router.get(
  '/history',
  validateQuery(tripQuerySchema),
  tripController.history
);

router.get('/by-assignment/:assignmentId', tripController.byAssignment);
router.get('/by-driver/:driverId', tripController.byDriver);

router.get(
  '/',
  validateQuery(tripQuerySchema),
  tripController.list
);

router.get(
  '/:id',
  validateParams(tripIdParamSchema),
  tripController.getById
);

router.post(
  '/',
  validate(createTripSchema),
  tripController.create
);

router.put(
  '/:id',
  validateParams(tripIdParamSchema),
  validate(updateTripSchema),
  tripController.update
);

router.patch(
  '/:id/start',
  validateParams(tripIdParamSchema),
  tripController.start
);

router.patch(
  '/:id/pause',
  validateParams(tripIdParamSchema),
  tripController.pause
);

router.patch(
  '/:id/resume',
  validateParams(tripIdParamSchema),
  tripController.resume
);

router.patch(
  '/:id/complete',
  validateParams(tripIdParamSchema),
  validate(finishTripSchema),
  tripController.finish
);

router.patch(
  '/:id/cancel',
  validateParams(tripIdParamSchema),
  tripController.cancel
);

router.post(
  '/:id/finish',
  validateParams(tripIdParamSchema),
  validate(finishTripSchema),
  tripController.finish
);

router.delete(
  '/:id',
  validateParams(tripIdParamSchema),
  tripController.remove
);

export default router;
