import mysql from 'mysql2/promise';
import config from '../config/index.js';
import logger from '../logs/logger.js';

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

  logger.info('MySQL connection pool created');
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
    logger.error('Database connection failed:', error.message);
    return { status: 'down', message: error.message };
  }
}

async function query(sql, params = []) {
  try {
    const [rows] = await getPool().execute(sql, params);
    return rows;
  } catch (error) {
    logger.error('Query execution failed:', { sql: sql.substring(0, 200), error: error.message });
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
    logger.error('Transaction rolled back:', error.message);
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
