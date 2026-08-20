import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import { validate, validateParams, validateQuery } from '../../middlewares/validate.js';
import { createUserSchema, updateUserSchema, userQuerySchema, userIdParamSchema } from './user.schema.js';
import * as userController from './user.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/statistics', userController.statistics);
router.get('/', validateQuery(userQuerySchema), userController.list);
router.get('/:id', validateParams(userIdParamSchema), userController.getById);
router.post('/', validate(createUserSchema), userController.create);
router.put('/:id', validateParams(userIdParamSchema), validate(updateUserSchema), userController.update);
router.delete('/:id', validateParams(userIdParamSchema), userController.remove);
router.post('/:id/activate', validateParams(userIdParamSchema), userController.activate);
router.post('/:id/deactivate', validateParams(userIdParamSchema), userController.deactivate);
router.post('/:id/suspend', validateParams(userIdParamSchema), userController.suspend);
router.post('/:id/reactivate', validateParams(userIdParamSchema), userController.reactivate);
router.post('/:id/invite', validateParams(userIdParamSchema), userController.invite);
router.post('/:id/reset-password', validateParams(userIdParamSchema), userController.resetPassword);

export default router;
