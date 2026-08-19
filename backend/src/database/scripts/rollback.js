import { getPool } from '../index.js';
import { getExecutedMigrations, unmarkMigration } from '../migrations/migrationTracker.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import logger from '../../logs/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function rollback(steps = 1) {
  const pool = getPool();
  const executed = await getExecutedMigrations();

  if (executed.length === 0) {
    logger.info('No migrations to rollback');
    return { rolledBack: 0, migrations: [] };
  }

  const toRollback = executed.slice(-steps).reverse();
  const rolledBack = [];

  for (const file of toRollback) {
    const downFile = file.replace('.sql', '.down.sql');
    const downPath = join(__dirname, '..', 'migrations', downFile);

    try {
      let sql;
      try {
        sql = readFileSync(downPath, 'utf-8');
      } catch {
        logger.warn(`No rollback file found: ${downFile}. Skipping.`);
        continue;
      }

      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await pool.execute(statement);
      }

      await unmarkMigration(file);
      rolledBack.push(file);
      logger.info(`Rollback executed: ${file}`);
    } catch (error) {
      logger.error(`Rollback failed: ${file}`, { error: error.message });
      throw error;
    }
  }

  return { rolledBack: rolledBack.length, migrations: rolledBack };
}
