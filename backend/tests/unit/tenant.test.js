import { describe, it } from 'node:test';
import assert from 'node:assert';
import { assertCompanyAccess, assertSuperAdmin, isSuperAdmin, getTenantId } from '../../src/utils/tenant.js';
import { AuthorizationError, NotFoundError } from '../../src/errors/index.js';

describe('Tenant Utilities', () => {
  describe('assertCompanyAccess', () => {
    it('should allow global access (super_admin)', () => {
      assert.doesNotThrow(() => assertCompanyAccess('company1', 'company2', true));
    });

    it('should allow access when tenant matches', () => {
      assert.doesNotThrow(() => assertCompanyAccess('company1', 'company1', false));
    });

    it('should throw AuthorizationError when tenant mismatch', () => {
      assert.throws(() => assertCompanyAccess('company1', 'company2', false), AuthorizationError);
    });

    it('should throw NotFoundError when resource has no company', () => {
      assert.throws(() => assertCompanyAccess(null, 'company1', false), NotFoundError);
    });
  });

  describe('assertSuperAdmin', () => {
    it('should allow super_admin', () => {
      assert.doesNotThrow(() => assertSuperAdmin({ role: 'super_admin' }));
    });

    it('should throw for non-super_admin', () => {
      assert.throws(() => assertSuperAdmin({ role: 'company_owner' }), AuthorizationError);
    });

    it('should throw for null user', () => {
      assert.throws(() => assertSuperAdmin(null), AuthorizationError);
    });
  });

  describe('isSuperAdmin', () => {
    it('should return true for super_admin', () => {
      assert.strictEqual(isSuperAdmin({ role: 'super_admin' }), true);
    });

    it('should return false for other roles', () => {
      assert.strictEqual(isSuperAdmin({ role: 'company_owner' }), false);
    });

    it('should return false for null', () => {
      assert.strictEqual(isSuperAdmin(null), false);
    });
  });

  describe('getTenantId', () => {
    it('should return null for global access', () => {
      assert.strictEqual(getTenantId({ companyId: 'c1' }, true), null);
    });

    it('should return companyId for scoped access', () => {
      assert.strictEqual(getTenantId({ companyId: 'c1' }, false), 'c1');
    });

    it('should return null when no companyId', () => {
      assert.strictEqual(getTenantId({ role: 'super_admin' }, false), null);
    });
  });
});
