import { createPool, closePool } from '../index.js';
import { migrate, migrateStatus } from './migrate.js';
import { rollback } from './rollback.js';
import { seed } from './seed.js';
import logger from '../../logs/logger.js';

const command = process.argv[2];
const steps = parseInt(process.argv[3], 10) || 1;

async function run() {
  try {
    createPool();

    switch (command) {
      case 'migrate': {
        const result = await migrate();
        logger.info(`Migration complete: ${result.executed} migration(s) executed`);
        break;
      }

      case 'status': {
        const result = await migrateStatus();
        logger.info('Migration Status:');
        logger.info(`  Executed: ${result.executedCount}`);
        logger.info(`  Pending:  ${result.pendingCount}`);
        logger.info(`  Total:    ${result.total}`);
        if (result.executed.length > 0) {
          logger.info('  Executed migrations:');
          for (const m of result.executed) {
            logger.info(`    - ${m}`);
          }
        }
        if (result.pending.length > 0) {
          logger.info('  Pending migrations:');
          for (const m of result.pending) {
            logger.info(`    - ${m}`);
          }
        }
        break;
      }

      case 'rollback': {
        const result = await rollback(steps);
        logger.info(`Rollback complete: ${result.rolledBack} migration(s) rolled back`);
        break;
      }

      case 'seed': {
        const result = await seed();
        logger.info(`Seed complete: ${result.seeded} seed(s) executed`);
        break;
      }

      default:
        logger.error(`Unknown command: ${command}`);
        logger.info('Available commands: migrate, status, rollback, seed');
        process.exit(1);
    }
  } catch (error) {
    logger.error('Database command failed:', error.message);
    process.exit(1);
  } finally {
    await closePool();
  }
}

run();
