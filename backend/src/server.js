import app from './app.js';
import config from './config/index.js';
import { createPool, closePool } from './database/index.js';
import logger from './logs/logger.js';

async function startServer() {
  try {
    createPool();
    logger.info('Database pool created');

    const server = app.listen(config.server.port, () => {
      logger.info(`Navix Management API running on port ${config.server.port}`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`API prefix: ${config.api.prefix}`);
    });

    async function gracefulShutdown(signal) {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');
        await closePool();
        logger.info('Database pool closed');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', { reason: String(reason) });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', { message: error.message, stack: error.stack });
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

const server = await startServer();
export default server;
