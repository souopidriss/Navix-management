/**
 * Navix Documents — Barrel des schémas de validation.
 */
export {
  createDocumentSchema,
  documentSchema,
  documentEditSchema,
  documentDefaultValues,
  toDocumentFormValues,
  toDocumentPayload,
  getFileExtension,
} from './document.schema';
export {
  fileTypeSchema,
  fileTypeDefaultValues,
  toFileTypeFormValues,
  toFileTypePayload,
} from './fileType.schema';
