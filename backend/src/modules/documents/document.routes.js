import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import { validate, validateParams, validateQuery } from '../../middlewares/validate.js';
import { parseDocumentUpload } from '../../middlewares/upload.js';
import {
  createDocumentSchema,
  updateDocumentSchema,
  documentIdParamSchema,
  documentQuerySchema,
  createFileTypeSchema,
  updateFileTypeSchema,
  fileTypeIdParamSchema,
} from './document.schema.js';
import * as documentController from './document.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/stats', documentController.stats);

router.get(
  '/file-types',
  documentController.listFileTypes
);

router.get(
  '/file-types/:id',
  validateParams(fileTypeIdParamSchema),
  documentController.getFileTypeById
);

router.post(
  '/file-types',
  validate(createFileTypeSchema),
  documentController.createFileType
);

router.put(
  '/file-types/:id',
  validateParams(fileTypeIdParamSchema),
  validate(updateFileTypeSchema),
  documentController.updateFileType
);

router.delete(
  '/file-types/:id',
  validateParams(fileTypeIdParamSchema),
  documentController.deleteFileType
);

router.post(
  '/upload',
  parseDocumentUpload,
  documentController.upload
);

router.get(
  '/:id/download',
  validateParams(documentIdParamSchema),
  documentController.download
);

router.get(
  '/:id/preview',
  validateParams(documentIdParamSchema),
  documentController.preview
);

router.get(
  '/',
  validateQuery(documentQuerySchema),
  documentController.list
);

router.get(
  '/:id',
  validateParams(documentIdParamSchema),
  documentController.getById
);

router.post(
  '/',
  validate(createDocumentSchema),
  documentController.create
);

router.put(
  '/:id',
  validateParams(documentIdParamSchema),
  validate(updateDocumentSchema),
  documentController.update
);

router.delete(
  '/:id',
  validateParams(documentIdParamSchema),
  documentController.remove
);

export default router;
