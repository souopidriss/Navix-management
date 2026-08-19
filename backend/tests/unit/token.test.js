import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiration,
} from '../../src/services/token.service.js';

describe('Token Service', () => {
  const testPayload = { sub: 'user123', role: 'super_admin' };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(testPayload);
      assert.ok(token);
      assert.ok(typeof token === 'string');
      assert.ok(token.split('.').length === 3);
    });

    it('should include correct payload', () => {
      const token = generateAccessToken(testPayload);
      const decoded = decodeToken(token);
      assert.strictEqual(decoded.payload.sub, 'user123');
      assert.strictEqual(decoded.payload.role, 'super_admin');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(testPayload);
      assert.ok(token);
      assert.ok(token.split('.').length === 3);
    });

    it('should include payload type when set', () => {
      const token = generateRefreshToken({ ...testPayload, type: 'refresh' });
      const decoded = decodeToken(token);
      assert.strictEqual(decoded.payload.type, 'refresh');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyAccessToken(token);
      assert.strictEqual(decoded.sub, 'user123');
    });

    it('should reject an invalid token', () => {
      assert.throws(() => {
        verifyAccessToken('invalid.token.here');
      });
    });

    it('should reject a refresh token used as access token', () => {
      const token = generateRefreshToken(testPayload);
      assert.throws(() => {
        verifyAccessToken(token);
      });
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken({ ...testPayload, type: 'refresh' });
      const decoded = verifyRefreshToken(token);
      assert.strictEqual(decoded.sub, 'user123');
      assert.strictEqual(decoded.type, 'refresh');
    });

    it('should reject an access token used as refresh token', () => {
      const token = generateAccessToken(testPayload);
      assert.throws(() => {
        verifyRefreshToken(token);
      });
    });

    it('should reject garbage token', () => {
      assert.throws(() => {
        verifyRefreshToken('not-a-jwt');
      });
    });
  });

  describe('decodeToken', () => {
    it('should decode token with header and payload', () => {
      const token = generateAccessToken(testPayload);
      const decoded = decodeToken(token);
      assert.ok(decoded.header);
      assert.ok(decoded.payload);
      assert.strictEqual(decoded.header.alg, 'HS256');
    });
  });

  describe('getTokenExpiration', () => {
    it('should return expiration date', () => {
      const token = generateAccessToken(testPayload);
      const exp = getTokenExpiration(token);
      assert.ok(exp !== null);
      assert.ok(exp > new Date());
    });

    it('should return null for garbage token', () => {
      const exp = getTokenExpiration('bad-token');
      assert.strictEqual(exp, null);
    });
  });
});
