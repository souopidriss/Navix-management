import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import { requirePermission } from '../../middlewares/requirePermission.js';
import { subscriptionGuard } from '../../middlewares/subscriptionGuard.js';
import { validate, validateParams, validateQuery } from '../../middlewares/validate.js';
import { createUserSchema, updateUserSchema, userQuerySchema, userIdParamSchema } from './user.schema.js';
import * as userController from './user.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/statistics', userController.statistics);
router.get('/', validateQuery(userQuerySchema), userController.list);
router.get('/:id', validateParams(userIdParamSchema), userController.getById);
router.post('/', requirePermission('users.manage'), subscriptionGuard, validate(createUserSchema), userController.create);
router.put('/:id', requirePermission('users.manage'), validateParams(userIdParamSchema), validate(updateUserSchema), userController.update);
router.delete('/:id', requirePermission('users.manage'), validateParams(userIdParamSchema), userController.remove);
router.post('/:id/activate', requirePermission('users.manage'), validateParams(userIdParamSchema), userController.activate);
router.post('/:id/deactivate', requirePermission('users.manage'), validateParams(userIdParamSchema), userController.deactivate);
router.post('/:id/suspend', requirePermission('users.manage'), validateParams(userIdParamSchema), userController.suspend);
router.post('/:id/reactivate', requirePermission('users.manage'), validateParams(userIdParamSchema), userController.reactivate);
router.post('/:id/invite', requirePermission('users.manage'), validateParams(userIdParamSchema), userController.invite);
router.post('/:id/reset-password', requirePermission('users.manage'), validateParams(userIdParamSchema), userController.resetPassword);

export default router;
