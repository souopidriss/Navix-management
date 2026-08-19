import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { getPool } from '../index.js';
import logger from '../../logs/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function seed() {
  const pool = getPool();
  const seedsDir = join(__dirname, '..', 'seeds');
  const files = readdirSync(seedsDir)
    .filter((f) => f.endsWith('.seed.js'))
    .sort();

  if (files.length === 0) {
    logger.info('No seed files found');
    return { seeded: 0, seeds: [] };
  }

  const seeded = [];

  for (const file of files) {
    try {
      const module = await import(pathToFileURL(join(seedsDir, file)).href);
      if (typeof module.default === 'function') {
        await module.default(pool);
        seeded.push(file);
        logger.info(`Seed executed: ${file}`);
      }
    } catch (error) {
      logger.error(`Seed failed: ${file}`, { error: error.message });
      throw error;
    }
  }

  return { seeded: seeded.length, seeds: seeded };
}
