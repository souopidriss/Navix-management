import mysql from 'mysql2/promise';
import config from '../config/index.js';
import logger from '../logs/logger.js';

const SLOW_QUERY_THRESHOLD_MS = parseInt(process.env.SLOW_QUERY_THRESHOLD_MS || '500', 10);

let pool = null;

function createPool() {
  if (pool) return pool;

  pool = mysql.createPool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    connectionLimit: config.database.connectionLimit,
    connectTimeout: config.database.acquireTimeout,
    waitForConnections: config.database.waitForConnections,
    queueLimit: config.database.queueLimit,
    timezone: '+00:00',
    dateStrings: true,
  });

  logger.info('MySQL connection pool created', {
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    connectionLimit: config.database.connectionLimit,
  });
  return pool;
}

function getPool() {
  if (!pool) {
    createPool();
  }
  return pool;
}

async function testConnection() {
  try {
    const connection = await getPool().getConnection();
    await connection.ping();
    connection.release();
    return { status: 'up', message: 'Database connection successful' };
  } catch (error) {
    logger.error('Database connection failed', { error: error.message });
    return { status: 'down', message: error.message };
  }
}

async function query(sql, params = []) {
  const start = Date.now();
  try {
    const [rows] = await getPool().query(sql, params);
    const duration = Date.now() - start;
    if (duration > SLOW_QUERY_THRESHOLD_MS) {
      logger.warn('Slow query detected', {
        duration: `${duration}ms`,
        durationMs: duration,
        sql: sql.substring(0, 300),
        threshold: `${SLOW_QUERY_THRESHOLD_MS}ms`,
      });
    }
    return rows;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error('Query execution failed', {
      sql: sql.substring(0, 300),
      error: error.message,
      errno: error.errno,
      code: error.code,
      duration: `${duration}ms`,
    });
    throw error;
  }
}

async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

async function transaction(callback) {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    logger.error('Transaction rolled back', { error: error.message });
    throw error;
  } finally {
    connection.release();
  }
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('MySQL connection pool closed');
  }
}

export { createPool, getPool, testConnection, query, queryOne, transaction, closePool };
