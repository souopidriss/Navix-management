import { getPool } from '../index.js';

const MIGRATION_TABLE = 'schema_migrations';

async function ensureMigrationTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      batch INT NOT NULL DEFAULT 1,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function getExecutedMigrations() {
  await ensureMigrationTable();
  const pool = getPool();
  const [rows] = await pool.execute(`SELECT name FROM ${MIGRATION_TABLE} ORDER BY id ASC`);
  return rows.map((r) => r.name);
}

async function markMigration(name, batch) {
  const pool = getPool();
  await pool.execute(
    `INSERT INTO ${MIGRATION_TABLE} (name, batch) VALUES (?, ?)`,
    [name, batch]
  );
}

async function unmarkMigration(name) {
  const pool = getPool();
  await pool.execute(`DELETE FROM ${MIGRATION_TABLE} WHERE name = ?`, [name]);
}

async function getNextBatch() {
  const pool = getPool();
  const [rows] = await pool.execute(`SELECT COALESCE(MAX(batch), 0) + 1 as next_batch FROM ${MIGRATION_TABLE}`);
  return rows[0].next_batch;
}

export { ensureMigrationTable, getExecutedMigrations, markMigration, unmarkMigration, getNextBatch };
