import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createCompanySchema, updateCompanySchema, companyQuerySchema, companyIdParamSchema } from '../../src/modules/companies/company.schema.js';

describe('Company Schemas', () => {
  describe('createCompanySchema', () => {
    it('should accept valid create payload', () => {
      const result = createCompanySchema.safeParse({
        name: 'Mon Entreprise',
        code: 'ME-01',
        email: 'contact@example.com',
        website: 'https://example.com',
      });
      assert.strictEqual(result.success, true);
    });

    it('should require name', () => {
      const result = createCompanySchema.safeParse({ code: 'TEST' });
      assert.strictEqual(result.success, false);
    });

    it('should reject code > 12 chars', () => {
      const result = createCompanySchema.safeParse({
        name: 'Test',
        code: 'A'.repeat(13),
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid code chars', () => {
      const result = createCompanySchema.safeParse({
        name: 'Test',
        code: 'test code!',
      });
      assert.strictEqual(result.success, false);
    });

    it('should accept valid code with hyphens', () => {
      const result = createCompanySchema.safeParse({
        name: 'Test',
        code: 'ABC-123',
      });
      assert.strictEqual(result.success, true);
    });

    it('should accept optional fields as undefined', () => {
      const result = createCompanySchema.safeParse({ name: 'Test Co' });
      assert.strictEqual(result.success, true);
    });
  });

  describe('updateCompanySchema', () => {
    it('should accept partial update', () => {
      const result = updateCompanySchema.safeParse({ description: 'Updated' });
      assert.strictEqual(result.success, true);
    });

    it('should accept status update', () => {
      const result = updateCompanySchema.safeParse({ status: 'active' });
      assert.strictEqual(result.success, true);
    });

    it('should reject invalid status', () => {
      const result = updateCompanySchema.safeParse({ status: 'banned' });
      assert.strictEqual(result.success, false);
    });

    it('should accept null for nullable fields', () => {
      const result = updateCompanySchema.safeParse({ website: null, description: null });
      assert.strictEqual(result.success, true);
    });
  });

  describe('companyQuerySchema', () => {
    it('should apply defaults', () => {
      const result = companyQuerySchema.safeParse({});
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.page, 1);
      assert.strictEqual(result.data.limit, 20);
      assert.strictEqual(result.data.sort, 'created_at');
      assert.strictEqual(result.data.order, 'DESC');
    });

    it('should coerce page and limit', () => {
      const result = companyQuerySchema.safeParse({ page: '3', limit: '50' });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.page, 3);
      assert.strictEqual(result.data.limit, 50);
    });

    it('should reject limit > 100', () => {
      const result = companyQuerySchema.safeParse({ limit: '200' });
      assert.strictEqual(result.success, false);
    });
  });

  describe('companyIdParamSchema', () => {
    it('should accept valid ULID', () => {
      const result = companyIdParamSchema.safeParse({ id: '01ARZ3NDEKTSV4RRFFQ69G5FAV' });
      assert.strictEqual(result.success, true);
    });

    it('should reject short id', () => {
      const result = companyIdParamSchema.safeParse({ id: 'short' });
      assert.strictEqual(result.success, false);
    });
  });
});
