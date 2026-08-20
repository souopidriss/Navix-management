import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import { validate, validateParams, validateQuery } from '../../middlewares/validate.js';
import { createRoleSchema, updateRoleSchema, roleQuerySchema, roleIdParamSchema, assignPermissionsSchema } from './role.schema.js';
import * as roleController from './role.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/', validateQuery(roleQuerySchema), roleController.list);
router.get('/:id', validateParams(roleIdParamSchema), roleController.getById);
router.post('/', validate(createRoleSchema), roleController.create);
router.put('/:id', validateParams(roleIdParamSchema), validate(updateRoleSchema), roleController.update);
router.delete('/:id', validateParams(roleIdParamSchema), roleController.remove);
router.post('/:id/activate', validateParams(roleIdParamSchema), roleController.activate);
router.post('/:id/deactivate', validateParams(roleIdParamSchema), roleController.deactivate);
router.put('/:id/permissions', validateParams(roleIdParamSchema), validate(assignPermissionsSchema), roleController.assignPermissions);

export default router;
