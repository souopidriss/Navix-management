import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createDocumentSchema,
  updateDocumentSchema,
  documentIdParamSchema,
  documentQuerySchema,
  createFileTypeSchema,
  updateFileTypeSchema,
  fileTypeIdParamSchema,
} from '../../src/modules/documents/document.schema.js';

describe('Document Schemas', () => {
  describe('createDocumentSchema', () => {
    const validMinimal = {
      companyId: '01ABCDEF123456789012345678',
      fileTypeId: '01FILETYPE00000000000001',
    };

    it('should accept valid minimal payload', () => {
      const result = createDocumentSchema.safeParse(validMinimal);
      assert.strictEqual(result.success, true);
    });

    it('should accept valid full payload', () => {
      const result = createDocumentSchema.safeParse({
        ...validMinimal,
        name: 'Facture.pdf',
        description: 'Facture du mois',
        visibility: 'public',
        associationType: 'vehicle',
        associationId: '01VEHICLE00000000000001',
        category: 'facture',
      });
      assert.strictEqual(result.success, true);
    });

    it('should reject missing companyId', () => {
      const result = createDocumentSchema.safeParse({ fileTypeId: '01FILETYPE00000000000001' });
      assert.strictEqual(result.success, false);
    });

    it('should reject missing fileTypeId', () => {
      const result = createDocumentSchema.safeParse({ companyId: '01ABCDEF123456789012345678' });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid visibility', () => {
      const result = createDocumentSchema.safeParse({ ...validMinimal, visibility: 'invisible' });
      assert.strictEqual(result.success, false);
    });

    it('should default visibility to private', () => {
      const result = createDocumentSchema.safeParse(validMinimal);
      assert.strictEqual(result.data.visibility, 'private');
    });

    it('should accept all valid visibilities', () => {
      for (const v of ['public', 'private', 'restricted']) {
        const result = createDocumentSchema.safeParse({ ...validMinimal, visibility: v });
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.visibility, v);
      }
    });

    it('should accept all valid associationTypes', () => {
      for (const at of ['company', 'vehicle', 'driver', 'maintenance', 'trip', 'fuel', 'user']) {
        const result = createDocumentSchema.safeParse({ ...validMinimal, associationType: at });
        assert.strictEqual(result.success, true);
      }
    });

    it('should reject invalid associationType', () => {
      const result = createDocumentSchema.safeParse({ ...validMinimal, associationType: 'invalid' });
      assert.strictEqual(result.success, false);
    });

    it('should accept empty associationType', () => {
      const result = createDocumentSchema.safeParse({ ...validMinimal, associationType: '' });
      assert.strictEqual(result.success, true);
    });

    it('should trim whitespace', () => {
      const result = createDocumentSchema.safeParse({
        companyId: '  01ABCDEF123456789012345678  ',
        fileTypeId: '  01FILETYPE00000000000001  ',
      });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.companyId, '01ABCDEF123456789012345678');
    });
  });

  describe('updateDocumentSchema', () => {
    it('should accept empty payload', () => {
      const result = updateDocumentSchema.safeParse({});
      assert.strictEqual(result.success, true);
    });

    it('should accept partial fields', () => {
      const result = updateDocumentSchema.safeParse({ name: 'Nouveau nom' });
      assert.strictEqual(result.success, true);
    });

    it('should accept all fields', () => {
      const result = updateDocumentSchema.safeParse({
        fileTypeId: '01FILETYPE00000000000002',
        name: 'Updated',
        description: 'Updated desc',
        visibility: 'restricted',
        associationType: 'driver',
        associationId: '01ABCDEF123456789012345678',
        category: 'photo',
      });
      assert.strictEqual(result.success, true);
    });

    it('should reject invalid visibility', () => {
      const result = updateDocumentSchema.safeParse({ visibility: 'hidden' });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid associationType', () => {
      const result = updateDocumentSchema.safeParse({ associationType: 'boat' });
      assert.strictEqual(result.success, false);
    });
  });

  describe('documentIdParamSchema', () => {
    it('should accept valid id', () => {
      const result = documentIdParamSchema.safeParse({ id: '01ABCDEF123456789012345678' });
      assert.strictEqual(result.success, true);
    });

    it('should reject empty id', () => {
      const result = documentIdParamSchema.safeParse({ id: '' });
      assert.strictEqual(result.success, false);
    });

    it('should reject missing id', () => {
      const result = documentIdParamSchema.safeParse({});
      assert.strictEqual(result.success, false);
    });
  });

  describe('documentQuerySchema', () => {
    it('should accept empty query', () => {
      const result = documentQuerySchema.safeParse({});
      assert.strictEqual(result.success, true);
    });

    it('should default sort to created_at and order to DESC', () => {
      const result = documentQuerySchema.safeParse({});
      assert.strictEqual(result.data.sort, 'created_at');
      assert.strictEqual(result.data.order, 'DESC');
    });

    it('should accept valid sort fields', () => {
      for (const s of ['created_at', 'name', 'size', 'extension', 'updated_at']) {
        const result = documentQuerySchema.safeParse({ sort: s });
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.sort, s);
      }
    });

    it('should reject invalid sort field', () => {
      const result = documentQuerySchema.safeParse({ sort: 'invalid' });
      assert.strictEqual(result.success, false);
    });

    it('should accept valid visibility filter', () => {
      const result = documentQuerySchema.safeParse({ visibility: 'public' });
      assert.strictEqual(result.success, true);
    });
  });

  describe('createFileTypeSchema', () => {
    const validMinimal = {
      title: 'PDF Document',
      extensions: ['.pdf'],
      maxSize: 20971520,
    };

    it('should accept valid minimal payload', () => {
      const result = createFileTypeSchema.safeParse(validMinimal);
      assert.strictEqual(result.success, true);
    });

    it('should accept valid full payload', () => {
      const result = createFileTypeSchema.safeParse({
        ...validMinimal,
        description: 'Fichiers PDF',
        mimeTypes: ['application/pdf'],
        isActive: false,
      });
      assert.strictEqual(result.success, true);
    });

    it('should reject missing title', () => {
      const result = createFileTypeSchema.safeParse({ extensions: ['.pdf'], maxSize: 1000 });
      assert.strictEqual(result.success, false);
    });

    it('should reject empty extensions', () => {
      const result = createFileTypeSchema.safeParse({ title: 'Test', extensions: [], maxSize: 1000 });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid extension format', () => {
      const result = createFileTypeSchema.safeParse({ title: 'Test', extensions: ['pdf'], maxSize: 1000 });
      assert.strictEqual(result.success, false);
    });

    it('should accept valid extensions', () => {
      const result = createFileTypeSchema.safeParse({ title: 'Test', extensions: ['.pdf', '.doc'], maxSize: 1000 });
      assert.strictEqual(result.success, true);
    });

    it('should reject maxSize exceeding 1GB', () => {
      const result = createFileTypeSchema.safeParse({ title: 'Test', extensions: ['.pdf'], maxSize: 2000000000 });
      assert.strictEqual(result.success, false);
    });

    it('should reject negative maxSize', () => {
      const result = createFileTypeSchema.safeParse({ title: 'Test', extensions: ['.pdf'], maxSize: -1 });
      assert.strictEqual(result.success, false);
    });

    it('should reject zero maxSize', () => {
      const result = createFileTypeSchema.safeParse({ title: 'Test', extensions: ['.pdf'], maxSize: 0 });
      assert.strictEqual(result.success, false);
    });

    it('should default isActive to true', () => {
      const result = createFileTypeSchema.safeParse(validMinimal);
      assert.strictEqual(result.data.isActive, true);
    });
  });

  describe('updateFileTypeSchema', () => {
    it('should accept empty payload', () => {
      const result = updateFileTypeSchema.safeParse({});
      assert.strictEqual(result.success, true);
    });

    it('should accept partial fields', () => {
      const result = updateFileTypeSchema.safeParse({ title: 'Updated' });
      assert.strictEqual(result.success, true);
    });

    it('should reject invalid extension format', () => {
      const result = updateFileTypeSchema.safeParse({ extensions: ['pdf'] });
      assert.strictEqual(result.success, false);
    });

    it('should reject maxSize exceeding 1GB', () => {
      const result = updateFileTypeSchema.safeParse({ maxSize: 2000000000 });
      assert.strictEqual(result.success, false);
    });
  });

  describe('fileTypeIdParamSchema', () => {
    it('should accept valid id', () => {
      const result = fileTypeIdParamSchema.safeParse({ id: '01ABCDEF123456789012345678' });
      assert.strictEqual(result.success, true);
    });

    it('should reject empty id', () => {
      const result = fileTypeIdParamSchema.safeParse({ id: '' });
      assert.strictEqual(result.success, false);
    });
  });
});
