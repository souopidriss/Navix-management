import { migrate } from './migrate.js';
import { seed } from './seed.js';
import { createPool, closePool } from '../index.js';
import logger from '../../logs/logger.js';

async function run() {
  if (process.env.NODE_ENV === 'production') {
    logger.error('REFUSAL: db:reset is NOT allowed in production.');
    logger.error('Use db:migrate and db:rollback individually on production.');
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'test') {
    logger.info('Running db:reset in test mode');
  }

  try {
    createPool();

    logger.info('Step 1/3: Rolling back all migrations...');
    const { rollback } = await import('./rollback.js');
    const rollbackResult = await rollback(999);
    logger.info(`Rolled back ${rollbackResult.rolledBack} migrations`);

    logger.info('Step 2/3: Running all migrations...');
    const migrateResult = await migrate();
    logger.info(`Executed ${migrateResult.executed} migrations`);

    logger.info('Step 3/3: Running seeds...');
    const seedResult = await seed();
    logger.info(`Executed ${seedResult.seeded} seeds`);

    logger.info('Database reset complete');
  } catch (error) {
    logger.error('Database reset failed:', error.message);
    process.exit(1);
  } finally {
    await closePool();
  }
}

run();
