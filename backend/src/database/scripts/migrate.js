import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getPool } from '../index.js';
import { getExecutedMigrations, markMigration, getNextBatch } from '../migrations/migrationTracker.js';
import logger from '../../logs/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const migrationsDir = join(__dirname, '..', 'migrations');

function getMigrationFiles() {
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql') && !f.endsWith('.down.sql') && /^\d{3}_/.test(f))
    .sort();
  return files;
}

export async function migrate() {
  const pool = getPool();
  const executed = await getExecutedMigrations();
  const allMigrations = getMigrationFiles();
  const pending = allMigrations.filter((f) => !executed.includes(f));

  if (pending.length === 0) {
    logger.info('All migrations already executed');
    return { executed: 0, migrations: [] };
  }

  const batch = await getNextBatch();
  const executedList = [];

  for (const file of pending) {
    try {
      const filePath = join(migrationsDir, file);
      const sql = readFileSync(filePath, 'utf-8');

      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await pool.query(statement);
      }

      await markMigration(file, batch);
      executedList.push(file);
      logger.info(`Migration executed: ${file} (batch ${batch})`);
    } catch (error) {
      logger.error(`Migration failed: ${file}`, { error: error.message });
      throw error;
    }
  }

  return { executed: executedList.length, migrations: executedList, batch };
}

export async function migrateStatus() {
  const executed = await getExecutedMigrations();
  const allMigrations = getMigrationFiles();
  const pending = allMigrations.filter((f) => !executed.includes(f));

  return {
    executed,
    pending,
    total: allMigrations.length,
    executedCount: executed.length,
    pendingCount: pending.length,
  };
}
