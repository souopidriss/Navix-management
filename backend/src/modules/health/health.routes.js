import { Router } from 'express';
import { HTTP_STATUS } from '../../constants/index.js';
import { testConnection } from '../../database/index.js';
import logger from '../../logs/logger.js';

const router = Router();
const startTime = Date.now();

router.get('/health', async (req, res) => {
  try {
    const dbHealth = await testConnection();
    const uptimeMs = Date.now() - startTime;
    const memoryUsage = process.memoryUsage();

    const response = {
      success: true,
      message: 'Navix Management API is running',
      api: 'up',
      database: dbHealth.status,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: `${Math.floor(uptimeMs / 1000)}s`,
      uptimeMs,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      },
      environment: process.env.NODE_ENV || 'development',
    };

    const statusCode = dbHealth.status === 'up'
      ? HTTP_STATUS.OK
      : HTTP_STATUS.SERVICE_UNAVAILABLE;

    res.status(statusCode).json(response);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      api: 'down',
      database: 'unknown',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

router.get('/ready', async (req, res) => {
  try {
    const dbHealth = await testConnection();
    const ready = dbHealth.status === 'up';

    res.status(ready ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE).json({
      success: ready,
      status: ready ? 'ready' : 'not ready',
      database: dbHealth.status,
      timestamp: new Date().toISOString(),
    });
  } catch (_error) {
    res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
      success: false,
      status: 'not ready',
      database: 'down',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
