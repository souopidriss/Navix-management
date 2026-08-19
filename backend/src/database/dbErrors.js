import { DatabaseError, ConflictError } from '../errors/index.js';
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
    logger.warn(`Duplicate entry: ${value} on key ${key}`);
    return new ConflictError(`A record with this value already exists (${key})`);
  }

  if (code === MYSQL_ERROR_CODES.ER_NO_REFERENCED_ROW_2) {
    return new DatabaseError('Referenced record does not exist');
  }

  if (code === MYSQL_ERROR_CODES.ER_ROW_IS_REFERENCED_2) {
    return new DatabaseError('Cannot delete: record is referenced by other data');
  }

  if (code === MYSQL_ERROR_CODES.ER_LOCK_WAIT_TIMEOUT || code === MYSQL_ERROR_CODES.ER_LOCK_DEADLOCK) {
    return new DatabaseError('Database lock timeout. Please retry.');
  }

  if (
    code === MYSQL_ERROR_CODES.CR_CONNECTION_ERROR ||
    code === MYSQL_ERROR_CODES.CR_CONN_HOST_ERROR ||
    code === MYSQL_ERROR_CODES.CR_SERVER_GONE_ERROR ||
    code === MYSQL_ERROR_CODES.CR_SERVER_LOST
  ) {
    return new DatabaseError('Database connection lost');
  }

  return new DatabaseError('Database operation failed');
}
