import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import { validateQuery } from '../../middlewares/validate.js';
import { dashboardQuerySchema } from './dashboard.schema.js';
import * as dashboardController from './dashboard.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/overview', validateQuery(dashboardQuerySchema), dashboardController.overview);
router.get('/fleet', validateQuery(dashboardQuerySchema), dashboardController.fleet);
router.get('/fuel', validateQuery(dashboardQuerySchema), dashboardController.fuelStats);
router.get('/maintenance', validateQuery(dashboardQuerySchema), dashboardController.maintenanceStats);
router.get('/financial', validateQuery(dashboardQuerySchema), dashboardController.financial);
router.get('/alerts', validateQuery(dashboardQuerySchema), dashboardController.alerts);
router.get('/activities', validateQuery(dashboardQuerySchema), dashboardController.activities);
router.get('/top-vehicles', validateQuery(dashboardQuerySchema), dashboardController.topVehicles);
router.get('/top-drivers', validateQuery(dashboardQuerySchema), dashboardController.topDrivers);

export default router;
