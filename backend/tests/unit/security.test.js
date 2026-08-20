import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { validate } from '../../src/middlewares/validate.js';
import { notFoundHandler } from '../../src/middlewares/notFoundHandler.js';
import { errorHandler } from '../../src/middlewares/errorHandler.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
} from '../../src/services/token.service.js';
import config from '../../src/config/index.js';

function mockReq(overrides = {}) {
  return { headers: {}, ip: '127.0.0.1', ...overrides };
}

function mockRes() {
  const res = {
    _status: null,
    _body: null,
    status(code) { res._status = code; return res; },
    json(body) { res._body = body; return res; },
  };
  return res;
}

describe('SECURITY — validate() strips unknown fields', () => {
  it('should strip unknown fields from request body (Zod default)', (_, done) => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    const req = { body: { email: 'a@b.com', password: '123456', role: 'super_admin', isAdmin: true } };
    const res = mockRes();

    validate(schema)(req, res, (err) => {
      assert.strictEqual(err, undefined);
      assert.strictEqual(req.body.email, 'a@b.com');
      assert.strictEqual(req.body.password, '123456');
      assert.strictEqual('role' in req.body, false);
      assert.strictEqual('isAdmin' in req.body, false);
      done();
    });
  });

  it('should strip unknown nested fields', (_, done) => {
    const schema = z.object({ name: z.string() });
    const req = { body: { name: 'test', nested: { evil: true } } };
    const res = mockRes();

    validate(schema)(req, res, (err) => {
      assert.strictEqual(err, undefined);
      assert.strictEqual(req.body.name, 'test');
      assert.strictEqual('nested' in req.body, false);
      done();
    });
  });

  it('passthrough() mode preserves unknown fields when explicitly enabled', (_, done) => {
    const schema = z.object({ email: z.string() }).passthrough();
    const req = { body: { email: 'a@b.com', extra: true } };
    const res = mockRes();

    validate(schema)(req, res, (err) => {
      assert.strictEqual(err, undefined);
      assert.strictEqual(req.body.email, 'a@b.com');
      assert.strictEqual(req.body.extra, true);
      done();
    });
  });
});

describe('SECURITY — notFoundHandler does not leak full URL', () => {
  it('should strip query parameters from URL in error message', () => {
    const req = { method: 'GET', originalUrl: '/api/v1/users?token=SECRET_123&password=abc' };
    const res = mockRes();
    notFoundHandler(req, res, () => {});

    assert.strictEqual(res._status, 404);
    assert.strictEqual(res._body.error.message, 'Route GET /api/v1/users not found');
    assert.ok(!res._body.error.message.includes('SECRET_123'));
    assert.ok(!res._body.error.message.includes('password=abc'));
  });

  it('should not include sensitive query params in error', () => {
    const req = { method: 'POST', originalUrl: '/api/v1/login?access_token=eyJhbGciOiJIUzI1NiJ9' };
    const res = mockRes();
    notFoundHandler(req, res, () => {});

    assert.ok(!res._body.error.message.includes('eyJhbGciOiJIUzI1NiJ9'));
  });
});

describe('SECURITY — errorHandler does not leak stack traces', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should not include internalMessage when NODE_ENV is production', () => {
    process.env.NODE_ENV = 'production';
    const err = new Error('Database connection failed');
    err.statusCode = 500;
    err.isOperational = true;
    err.stack = 'Error: Database connection failed\n    at /app/src/db.js:42';

    const res = mockRes();
    errorHandler(err, mockReq(), res, () => {});

    assert.strictEqual(res._body.error.internalMessage, undefined);
    assert.strictEqual(res._body.error.stack, undefined);
  });

  it('should not leak stack traces when NODE_ENV is undefined', () => {
    delete process.env.NODE_ENV;
    const err = new Error('Secret error');
    err.stack = 'Error: Secret error\n    at secret-function';

    const res = mockRes();
    errorHandler(err, mockReq(), res, () => {});

    assert.strictEqual(res._body.error.internalMessage, undefined);
    assert.strictEqual(res._body.error.stack, undefined);
  });

  it('should include stack traces only in development', () => {
    process.env.NODE_ENV = 'development';
    const err = new Error('Dev error');
    err.stack = 'Error: Dev error\n    at dev-file.js:10';

    const res = mockRes();
    errorHandler(err, mockReq(), res, () => {});

    assert.strictEqual(res._body.error.internalMessage, 'Dev error');
    assert.ok(Array.isArray(res._body.error.stack));
  });
});

describe('SECURITY — JWT tokens use HS256 algorithm only', () => {
  it('should generate and verify access token with HS256', () => {
    const payload = { sub: 'user123', role: 'company_admin', type: 'access' };
    const token = generateAccessToken(payload);
    const decoded = verifyAccessToken(token);
    assert.strictEqual(decoded.sub, 'user123');
    assert.strictEqual(decoded.role, 'company_admin');
    const header = decodeToken(token);
    assert.strictEqual(header.header.alg, 'HS256');
  });

  it('should generate and verify refresh token with HS256', () => {
    const payload = { sub: 'user123', type: 'refresh' };
    const token = generateRefreshToken(payload);
    const decoded = verifyRefreshToken(token);
    assert.strictEqual(decoded.sub, 'user123');
    const header = decodeToken(token);
    assert.strictEqual(header.header.alg, 'HS256');
  });

  it('should reject token with none algorithm', () => {
    const maliciousToken = jwt.sign(
      { sub: 'user123', role: 'super_admin' },
      config.jwt.accessSecret,
      { algorithm: 'none' }
    );
    assert.throws(() => verifyAccessToken(maliciousToken));
  });

  it('should reject token signed with wrong secret', () => {
    const token = jwt.sign(
      { sub: 'user123', role: 'super_admin' },
      'wrong-secret-key',
      { algorithm: 'HS256' }
    );
    assert.throws(() => verifyAccessToken(token));
  });
});

describe('SECURITY — forgotPassword does not return email', () => {
  it('forgotPassword response should not contain email field', async () => {
    const { forgotPassword } = await import('../../src/services/auth.service.js');
    const result = await forgotPassword('nonexistent_user_xyz@nowhere.test');
    assert.strictEqual(result.email, undefined);
    assert.strictEqual(result.success, true);
  });
});

describe('SECURITY — config JWT secret validation', () => {
  it('should have non-empty access secret in test env', () => {
    assert.ok(config.jwt.accessSecret);
    assert.ok(config.jwt.accessSecret.length > 0);
  });

  it('should have non-empty refresh secret in test env', () => {
    assert.ok(config.jwt.refreshSecret);
    assert.ok(config.jwt.refreshSecret.length > 0);
  });
});
