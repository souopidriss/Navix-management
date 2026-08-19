import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import { validate, validateParams, validateQuery } from '../../middlewares/validate.js';
import {
  createFuelSchema,
  updateFuelSchema,
  fuelQuerySchema,
  fuelIdParamSchema,
} from './fuel.schema.js';
import * as fuelController from './fuel.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/stats', fuelController.stats);

router.get(
  '/',
  validateQuery(fuelQuerySchema),
  fuelController.list
);

router.get(
  '/:id',
  validateParams(fuelIdParamSchema),
  fuelController.getById
);

router.post(
  '/',
  validate(createFuelSchema),
  fuelController.create
);

router.put(
  '/:id',
  validateParams(fuelIdParamSchema),
  validate(updateFuelSchema),
  fuelController.update
);

router.delete(
  '/:id',
  validateParams(fuelIdParamSchema),
  fuelController.remove
);

export default router;
