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

    let isShuttingDown = false;

    async function gracefulShutdown(signal) {
      if (isShuttingDown) return;
      isShuttingDown = true;

      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed — no longer accepting new connections');

        try {
          await closePool();
          logger.info('Database pool closed');
        } catch (err) {
          logger.error('Error closing database pool', { error: err.message });
        }

        logger.info('Graceful shutdown complete');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forced shutdown after 10s timeout — active connections terminated');
        process.exit(1);
      }, 10000);
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Promise Rejection', {
        reason: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
      });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception — shutting down', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server', { message: error.message, stack: error.stack });
    process.exit(1);
  }
}

const server = await startServer();
export default server;
