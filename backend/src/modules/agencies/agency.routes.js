import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import { validate, validateParams, validateQuery } from '../../middlewares/validate.js';
import { createAgencySchema, updateAgencySchema, agencyQuerySchema, agencyIdParamSchema } from './agency.schema.js';
import * as agencyController from './agency.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/stats', agencyController.stats);

router.get('/', validateQuery(agencyQuerySchema), agencyController.list);
router.get('/:id', validateParams(agencyIdParamSchema), agencyController.getById);
router.post('/', validate(createAgencySchema), agencyController.create);
router.put('/:id', validateParams(agencyIdParamSchema), validate(updateAgencySchema), agencyController.update);
router.delete('/:id', validateParams(agencyIdParamSchema), agencyController.remove);
router.post('/:id/activate', validateParams(agencyIdParamSchema), agencyController.activate);
router.post('/:id/deactivate', validateParams(agencyIdParamSchema), agencyController.deactivate);
router.get('/:id/vehicles', validateParams(agencyIdParamSchema), agencyController.getVehicles);
router.get('/:id/drivers', validateParams(agencyIdParamSchema), agencyController.getDrivers);
router.get('/:id/activity', validateParams(agencyIdParamSchema), agencyController.getActivity);

export default router;
