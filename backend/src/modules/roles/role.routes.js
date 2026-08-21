import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import { requirePermission } from '../../middlewares/requirePermission.js';
import { validate, validateParams, validateQuery } from '../../middlewares/validate.js';
import { createRoleSchema, updateRoleSchema, roleQuerySchema, roleIdParamSchema, assignPermissionsSchema } from './role.schema.js';
import * as roleController from './role.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/', validateQuery(roleQuerySchema), roleController.list);
router.get('/:id', validateParams(roleIdParamSchema), roleController.getById);
router.post('/', requirePermission('roles.manage'), validate(createRoleSchema), roleController.create);
router.put('/:id', requirePermission('roles.manage'), validateParams(roleIdParamSchema), validate(updateRoleSchema), roleController.update);
router.delete('/:id', requirePermission('roles.manage'), validateParams(roleIdParamSchema), roleController.remove);
router.post('/:id/activate', requirePermission('roles.manage'), validateParams(roleIdParamSchema), roleController.activate);
router.post('/:id/deactivate', requirePermission('roles.manage'), validateParams(roleIdParamSchema), roleController.deactivate);
router.put('/:id/permissions', requirePermission('roles.manage'), validateParams(roleIdParamSchema), validate(assignPermissionsSchema), roleController.assignPermissions);

export default router;
