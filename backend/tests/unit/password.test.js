import { describe, it } from 'node:test';
import assert from 'node:assert';
import { hashPassword, comparePassword, validatePasswordPolicy } from '../../src/services/password.service.js';

describe('Password Service', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const hash = await hashPassword('Test1234');
      assert.ok(hash);
      assert.ok(hash !== 'Test1234');
      assert.ok(hash.startsWith('$2'));
    });

    it('should produce different hashes for same input', async () => {
      const hash1 = await hashPassword('Test1234');
      const hash2 = await hashPassword('Test1234');
      assert.notStrictEqual(hash1, hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const hash = await hashPassword('Test1234');
      const result = await comparePassword('Test1234', hash);
      assert.strictEqual(result, true);
    });

    it('should return false for wrong password', async () => {
      const hash = await hashPassword('Test1234');
      const result = await comparePassword('WrongPassword', hash);
      assert.strictEqual(result, false);
    });
  });

  describe('validatePasswordPolicy', () => {
    it('should accept valid password', () => {
      const result = validatePasswordPolicy('Test1234');
      assert.strictEqual(result.valid, true);
      assert.deepStrictEqual(result.errors, []);
    });

    it('should reject password shorter than 8 chars', () => {
      const result = validatePasswordPolicy('Test1');
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some((e) => e.includes('8 caractères')));
    });

    it('should reject password without uppercase', () => {
      const result = validatePasswordPolicy('test1234');
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some((e) => e.includes('majuscule')));
    });

    it('should reject password without lowercase', () => {
      const result = validatePasswordPolicy('TEST1234');
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some((e) => e.includes('minuscule')));
    });

    it('should reject password without number', () => {
      const result = validatePasswordPolicy('TestTest');
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some((e) => e.includes('chiffre')));
    });

    it('should reject empty password', () => {
      const result = validatePasswordPolicy('');
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.length > 0);
    });
  });
});
