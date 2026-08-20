import { DatabaseError, ConflictError, NotFoundError } from '../errors/index.js';
import { ERROR_CODES } from '../constants/index.js';
import logger from '../logs/logger.js';

const MYSQL_ERROR_CODES = {
  ER_DUP_ENTRY: 1062,
  ER_NO_REFERENCED_ROW_2: 1452,
  ER_ROW_IS_REFERENCED_2: 1451,
  ER_LOCK_WAIT_TIMEOUT: 1205,
  ER_LOCK_DEADLOCK: 1213,
  CR_CONNECTION_ERROR: 2002,
  CR_CONN_HOST_ERROR: 2003,
  CR_SERVER_GONE_ERROR: 2006,
  CR_SERVER_LOST: 2013,
};

export function mapDbError(error) {
  const code = error.code || error.errno;

  if (code === MYSQL_ERROR_CODES.ER_DUP_ENTRY) {
    const match = error.message.match(/Duplicate entry '(.+?)' for key '(.+?)'/);
    const value = match ? match[1] : 'unknown';
    const key = match ? match[2] : 'unknown';
    logger.warn('Duplicate entry constraint violation', { value: value.substring(0, 100), key });
    const err = new ConflictError(`A record with this value already exists (${key})`);
    err.code = ERROR_CODES.DUPLICATE_ENTRY;
    return err;
  }

  if (code === MYSQL_ERROR_CODES.ER_NO_REFERENCED_ROW_2) {
    const match = error.message.match(/Cannot add or update a child row: a foreign key constraint fails/);
    const err = new NotFoundError('Referenced record');
    if (!match) {
      err.code = ERROR_CODES.FOREIGN_KEY_VIOLATION;
    }
    logger.warn('Foreign key violation', { errno: code });
    return err;
  }

  if (code === MYSQL_ERROR_CODES.ER_ROW_IS_REFERENCED_2) {
    logger.warn('Foreign key constraint — cannot delete referenced row', { errno: code });
    const err = new DatabaseError('Cannot delete: record is referenced by other data');
    err.code = ERROR_CODES.FOREIGN_KEY_VIOLATION;
    err.statusCode = 409;
    return err;
  }

  if (code === MYSQL_ERROR_CODES.ER_LOCK_WAIT_TIMEOUT || code === MYSQL_ERROR_CODES.ER_LOCK_DEADLOCK) {
    logger.warn('Database lock contention', { errno: code, type: code === 1213 ? 'deadlock' : 'timeout' });
    const err = new DatabaseError('Database lock timeout. Please retry.');
    err.code = ERROR_CODES.DB_LOCK_TIMEOUT;
    err.statusCode = 409;
    return err;
  }

  if (
    code === MYSQL_ERROR_CODES.CR_CONNECTION_ERROR ||
    code === MYSQL_ERROR_CODES.CR_CONN_HOST_ERROR ||
    code === MYSQL_ERROR_CODES.CR_SERVER_GONE_ERROR ||
    code === MYSQL_ERROR_CODES.CR_SERVER_LOST
  ) {
    logger.error('Database connection lost', { errno: code });
    const err = new DatabaseError('Database connection lost');
    err.code = ERROR_CODES.DB_CONNECTION_LOST;
    err.statusCode = 503;
    return err;
  }

  logger.error('Unhandled database error', { errno: code, message: error.message });
  const err = new DatabaseError('Database operation failed');
  err.code = ERROR_CODES.DATABASE_ERROR;
  return err;
}
