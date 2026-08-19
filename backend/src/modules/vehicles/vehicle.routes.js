import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import { validate, validateParams, validateQuery } from '../../middlewares/validate.js';
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleQuerySchema,
  vehicleIdParamSchema,
} from './vehicle.schema.js';
import * as vehicleController from './vehicle.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/stats', vehicleController.stats);

router.get(
  '/',
  validateQuery(vehicleQuerySchema),
  vehicleController.list
);

router.get(
  '/:id',
  validateParams(vehicleIdParamSchema),
  vehicleController.getById
);

router.post(
  '/',
  validate(createVehicleSchema),
  vehicleController.create
);

router.put(
  '/:id',
  validateParams(vehicleIdParamSchema),
  validate(updateVehicleSchema),
  vehicleController.update
);

router.delete(
  '/:id',
  validateParams(vehicleIdParamSchema),
  vehicleController.remove
);

router.patch(
  '/:id/status',
  validateParams(vehicleIdParamSchema),
  vehicleController.changeStatus
);

export default router;
