import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import { requirePermission } from '../../middlewares/requirePermission.js';
import { validateBody, validateQuery, validateParams } from '../../middlewares/validate.js';
import { createCompanySchema, updateCompanySchema, companyQuerySchema, companyIdParamSchema } from './company.schema.js';
import {
  list, getById, create, createWithOwner, update, remove, activate, suspend,
} from './company.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/', validateQuery(companyQuerySchema), list);
router.get('/:id', validateParams(companyIdParamSchema), getById);
router.post('/', requirePermission('companies.manage'), validateBody(createCompanySchema), create);
router.post('/with-owner', requirePermission('companies.manage'), createWithOwner);
router.put('/:id', requirePermission('companies.manage'), validateParams(companyIdParamSchema), validateBody(updateCompanySchema), update);
router.delete('/:id', requirePermission('companies.manage'), validateParams(companyIdParamSchema), remove);
router.post('/:id/activate', requirePermission('companies.manage'), validateParams(companyIdParamSchema), activate);
router.post('/:id/suspend', requirePermission('companies.manage'), validateParams(companyIdParamSchema), suspend);

export default router;
