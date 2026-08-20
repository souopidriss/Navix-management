import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import { validateParams, validateQuery } from '../../middlewares/validate.js';
import { permissionQuerySchema } from './permission.schema.js';
import { z } from 'zod';
import * as permissionController from './permission.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

const idParamSchema = z.object({
  id: z.string().min(26).max(26),
});

router.get('/modules', permissionController.modules);
router.get('/statistics', permissionController.statistics);
router.get('/', validateQuery(permissionQuerySchema), permissionController.list);
router.get('/:id', validateParams(idParamSchema), permissionController.getById);

export default router;
