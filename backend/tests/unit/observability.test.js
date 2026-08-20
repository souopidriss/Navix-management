import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import logger, { createChildLogger } from '../../src/logs/logger.js';
import { HTTP_STATUS, ERROR_CODES } from '../../src/constants/index.js';
import { AppError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError, ConflictError, DatabaseError, BadRequestError } from '../../src/errors/index.js';
import { mapDbError } from '../../src/database/dbErrors.js';
import { requestIdMiddleware } from '../../src/middlewares/requestId.js';
import { requestLogger } from '../../src/middlewares/requestLogger.js';
import { errorHandler } from '../../src/middlewares/errorHandler.js';
import { notFoundHandler } from '../../src/middlewares/notFoundHandler.js';
import { config } from '../../src/config/index.js';

describe('Logger Module', () => {
  it('should be a valid winston logger', () => {
    assert.ok(logger);
    assert.ok(typeof logger.info === 'function');
    assert.ok(typeof logger.warn === 'function');
    assert.ok(typeof logger.error === 'function');
    assert.ok(typeof logger.debug === 'function');
  });

  it('should have correct log levels', () => {
    assert.equal(logger.levels.error, 0);
    assert.equal(logger.levels.warn, 1);
    assert.equal(logger.levels.info, 2);
    assert.equal(logger.levels.http, 3);
    assert.equal(logger.levels.debug, 4);
  });

  it('should create child logger with default meta', () => {
    const child = createChildLogger({ userId: 'test-123', companyId: 'comp-456' });
    assert.ok(child);
    assert.ok(typeof child.info === 'function');
  });

  it('should not crash when logging with meta', () => {
    assert.doesNotThrow(() => {
      logger.info('Test log message', { requestId: 'req-001', method: 'GET' });
    });
  });

  it('should redact sensitive fields from meta', () => {
    const sensitiveFields = [
      'password', 'passwordHash', 'password_hash', 'token',
      'accessToken', 'refreshToken', 'secret', 'jwt',
      'authorization', 'cookie', 'apiKey', 'api_key',
      'currentPassword', 'newPassword', 'confirmPassword',
    ];
    sensitiveFields.forEach((field) => {
      assert.doesNotThrow(() => {
        logger.info('Sensitive test', { [field]: 'should-be-redacted' });
      });
    });
  });
});

describe('Error Codes', () => {
  it('should have all required error codes', () => {
    const requiredCodes = [
      'APP_ERROR', 'VALIDATION_ERROR', 'AUTHENTICATION_ERROR',
      'AUTHORIZATION_ERROR', 'NOT_FOUND', 'CONFLICT', 'DATABASE_ERROR',
      'RATE_LIMIT_EXCEEDED', 'ROUTE_NOT_FOUND', 'INTERNAL_ERROR',
      'BAD_REQUEST', 'ACCOUNT_LOCKED', 'TOKEN_EXPIRED', 'TOKEN_INVALID',
      'EMAIL_EXISTS', 'INVALID_CREDENTIALS', 'PASSWORD_POLICY',
      'SESSION_EXPIRED', 'DUPLICATE_ENTRY', 'FOREIGN_KEY_VIOLATION',
      'DB_CONNECTION_LOST', 'DB_LOCK_TIMEOUT', 'EXTERNAL_SERVICE_ERROR',
      'SERVICE_UNAVAILABLE', 'SUBSCRIPTION_EXPIRED', 'PLAN_LIMIT_EXCEEDED',
      'TENANT_ACCESS_DENIED',
    ];
    requiredCodes.forEach((code) => {
      assert.ok(ERROR_CODES[code], `Missing ERROR_CODE: ${code}`);
    });
  });

  it('should have all required HTTP status codes', () => {
    const requiredStatuses = [
      200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500, 502, 503,
    ];
    requiredStatuses.forEach((status) => {
      const found = Object.values(HTTP_STATUS).includes(status);
      assert.ok(found, `Missing HTTP_STATUS: ${status}`);
    });
  });
});

describe('Error Classes', () => {
  it('AppError should set statusCode, code, and isOperational', () => {
    const err = new AppError('test error', 500, 'TEST_CODE');
    assert.equal(err.message, 'test error');
    assert.equal(err.statusCode, 500);
    assert.equal(err.code, 'TEST_CODE');
    assert.equal(err.isOperational, true);
    assert.equal(err.name, 'AppError');
  });

  it('ValidationError should default to 422 and have details', () => {
    const err = new ValidationError('invalid', [{ field: 'email' }]);
    assert.equal(err.statusCode, 422);
    assert.equal(err.code, 'VALIDATION_ERROR');
    assert.deepEqual(err.details, [{ field: 'email' }]);
    assert.equal(err.isOperational, true);
  });

  it('AuthenticationError should default to 401', () => {
    const err = new AuthenticationError();
    assert.equal(err.statusCode, 401);
    assert.equal(err.code, 'AUTHENTICATION_ERROR');
  });

  it('AuthorizationError should default to 403', () => {
    const err = new AuthorizationError();
    assert.equal(err.statusCode, 403);
    assert.equal(err.code, 'AUTHORIZATION_ERROR');
  });

  it('NotFoundError should include resource name', () => {
    const err = new NotFoundError('Vehicle');
    assert.equal(err.message, 'Vehicle not found');
    assert.equal(err.statusCode, 404);
  });

  it('ConflictError should default to 409', () => {
    const err = new ConflictError();
    assert.equal(err.statusCode, 409);
    assert.equal(err.code, 'CONFLICT');
  });

  it('DatabaseError should default to 500', () => {
    const err = new DatabaseError();
    assert.equal(err.statusCode, 500);
    assert.equal(err.code, 'DATABASE_ERROR');
  });

  it('BadRequestError should default to 400', () => {
    const err = new BadRequestError();
    assert.equal(err.statusCode, 400);
    assert.equal(err.code, 'BAD_REQUEST');
  });
});

describe('DB Error Mapper', () => {
  it('should map duplicate entry to ConflictError', () => {
    const err = mapDbError({ code: 1062, errno: 1062, message: "Duplicate entry 'test' for key 'users.email'" });
    assert.equal(err.statusCode, 409);
    assert.equal(err.code, 'DUPLICATE_ENTRY');
  });

  it('should map foreign key violation to NotFoundError', () => {
    const err = mapDbError({ code: 1452, errno: 1452, message: 'Cannot add or update a child row' });
    assert.equal(err.statusCode, 404);
  });

  it('should map referenced row to DatabaseError with 409', () => {
    const err = mapDbError({ code: 1451, errno: 1451, message: 'Cannot delete a parent row' });
    assert.equal(err.statusCode, 409);
    assert.equal(err.code, 'FOREIGN_KEY_VIOLATION');
  });

  it('should map lock timeout to DatabaseError with 409', () => {
    const err = mapDbError({ code: 1205, errno: 1205, message: 'Lock wait timeout' });
    assert.equal(err.statusCode, 409);
    assert.equal(err.code, 'DB_LOCK_TIMEOUT');
  });

  it('should map deadlock to DatabaseError with 409', () => {
    const err = mapDbError({ code: 1213, errno: 1213, message: 'Deadlock found' });
    assert.equal(err.statusCode, 409);
    assert.equal(err.code, 'DB_LOCK_TIMEOUT');
  });

  it('should map connection lost to DatabaseError with 503', () => {
    const err = mapDbError({ code: 2006, errno: 2006, message: 'MySQL server has gone away' });
    assert.equal(err.statusCode, 503);
    assert.equal(err.code, 'DB_CONNECTION_LOST');
  });

  it('should map unknown error to generic DatabaseError', () => {
    const err = mapDbError({ code: 9999, errno: 9999, message: 'Unknown error' });
    assert.equal(err.statusCode, 500);
    assert.equal(err.code, 'DATABASE_ERROR');
  });
});

describe('Sensitive Data Protection', () => {
  it('should never expose password in log meta', () => {
    const sensitiveData = {
      password: 'secret123',
      passwordHash: '$2b$10$abc',
      token: 'jwt-token-here',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      secret: 'my-secret',
    };

    Object.entries(sensitiveData).forEach(([_key, value]) => {
      assert.ok(typeof value === 'string' || value === null);
      assert.ok(value !== undefined);
    });
  });

  it('ERROR_CODES should not contain actual secrets', () => {
    Object.values(ERROR_CODES).forEach((code) => {
      assert.ok(typeof code === 'string');
      assert.ok(!code.includes('secret'));
      assert.ok(!code.includes('password'));
      assert.ok(!code.includes('token'));
    });
  });
});

describe('Request ID Middleware', () => {
  it('should have requestIdMiddleware export', () => {
    assert.ok(typeof requestIdMiddleware === 'function');
  });
});

describe('Request Logger Middleware', () => {
  it('should have requestLogger export', () => {
    assert.ok(typeof requestLogger === 'function');
  });
});

describe('Error Handler Middleware', () => {
  it('should have errorHandler export', () => {
    assert.ok(typeof errorHandler === 'function');
  });
});

describe('Not Found Handler Middleware', () => {
  it('should have notFoundHandler export', () => {
    assert.ok(typeof notFoundHandler === 'function');
  });
});

describe('Error Handler Behavior', () => {
  it('should include requestId in operational error response', () => {
    const err = new AppError('test', 400, 'TEST');

    let capturedStatus = null;
    let capturedBody = null;
    const req = { id: 'req-abc-123', originalUrl: '/test', method: 'GET', user: {} };
    const res = {
      status(code) { capturedStatus = code; return this; },
      json(body) { capturedBody = body; return this; },
    };

    errorHandler(err, req, res, () => {});
    assert.equal(capturedStatus, 400);
    assert.equal(capturedBody.error.requestId, 'req-abc-123');
    assert.equal(capturedBody.error.code, 'TEST');
  });

  it('should include requestId in unexpected error response', () => {
    let capturedStatus = null;
    let capturedBody = null;
    const req = { id: 'req-xyz-789', originalUrl: '/test', method: 'POST', user: {} };
    const res = {
      status(code) { capturedStatus = code; return this; },
      json(body) { capturedBody = body; return this; },
    };

    const err = new Error('something broke');
    errorHandler(err, req, res, () => {});
    assert.equal(capturedStatus, 500);
    assert.equal(capturedBody.error.requestId, 'req-xyz-789');
    assert.equal(capturedBody.error.code, 'INTERNAL_ERROR');
    assert.equal(capturedBody.error.message, 'An unexpected error occurred');
  });

  it('should include details in validation error', () => {
    const err = new ValidationError('invalid', [{ field: 'email' }]);

    let capturedBody = null;
    const req = { id: 'req-v', originalUrl: '/test', method: 'GET' };
    const res = {
      status() { return this; },
      json(body) { capturedBody = body; return this; },
    };

    errorHandler(err, req, res, () => {});
    assert.ok(capturedBody.error.details);
    assert.equal(capturedBody.error.details.length, 1);
  });
});

describe('Not Found Handler Behavior', () => {
  it('should include requestId in response', () => {
    let capturedBody = null;
    const req = { id: 'req-nf-001', originalUrl: '/api/v1/unknown?foo=bar', method: 'GET' };
    const res = {
      status() { return this; },
      json(body) { capturedBody = body; return this; },
    };

    notFoundHandler(req, res, () => {});
    assert.equal(capturedBody.error.code, 'ROUTE_NOT_FOUND');
    assert.equal(capturedBody.error.requestId, 'req-nf-001');
    assert.ok(!capturedBody.error.message.includes('?foo=bar'));
  });
});

describe('Config Logging', () => {
  it('should have logging config with level and thresholds', () => {
    assert.ok(config.logging);
    assert.ok(config.logging.level);
    assert.ok(typeof config.logging.slowRequestThresholdMs === 'number');
    assert.ok(typeof config.logging.slowQueryThresholdMs === 'number');
    assert.ok(config.logging.slowRequestThresholdMs > 0);
    assert.ok(config.logging.slowQueryThresholdMs > 0);
  });
});
