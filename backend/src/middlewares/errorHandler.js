import logger from '../logs/logger.js';
import { HTTP_STATUS } from '../constants/index.js';

export function errorHandler(err, req, res, _next) {
  if (err.isOperational) {
    const response = {
      success: false,
      error: {
        code: err.code || 'APP_ERROR',
        message: err.message,
      },
    };

    if (err.details) {
      response.error.details = err.details;
    }

    logger.warn(`Operational error: ${err.message}`, {
      statusCode: err.statusCode,
      requestId: req.id,
      url: req.originalUrl,
    });

    return res.status(err.statusCode).json(response);
  }

  logger.error('Unexpected error:', {
    message: err.message,
    stack: err.stack,
    requestId: req.id,
    url: req.originalUrl,
    method: req.method,
  });

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const response = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  };

  if (process.env.NODE_ENV === 'development') {
    response.error.internalMessage = err.message;
    if (err.stack) {
      response.error.stack = err.stack.split('\n').slice(0, 5);
    }
  }

  return res.status(statusCode).json(response);
}
