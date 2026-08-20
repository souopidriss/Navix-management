import { Router } from 'express';
import { HTTP_STATUS } from '../../constants/index.js';
import { testConnection } from '../../database/index.js';
import logger from '../../logs/logger.js';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    const dbHealth = await testConnection();

    const response = {
      success: true,
      message: 'Navix Management API is running',
      api: 'up',
      database: dbHealth.status,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };

    const statusCode = dbHealth.status === 'up'
      ? HTTP_STATUS.OK
      : HTTP_STATUS.SERVICE_UNAVAILABLE;

    res.status(statusCode).json(response);
  } catch (error) {
    logger.error('Health check failed:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      api: 'down',
      database: 'unknown',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
