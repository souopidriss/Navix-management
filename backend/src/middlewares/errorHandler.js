import logger from '../logs/logger.js';
import { HTTP_STATUS } from '../constants/index.js';

export function errorHandler(err, req, res, _next) {
  const requestId = req.id || null;

  if (err.isOperational) {
    const response = {
      success: false,
      error: {
        code: err.code || 'APP_ERROR',
        message: err.message,
      },
    };

    if (requestId) response.error.requestId = requestId;
    if (err.details) response.error.details = err.details;

    logger.warn(`Operational error: ${err.message}`, {
      statusCode: err.statusCode,
      errorCode: err.code,
      requestId,
      method: req.method,
      path: req.originalUrl ? req.originalUrl.split('?')[0] : 'unknown',
      userId: req.user?.id || undefined,
      companyId: req.user?.companyId || undefined,
    });

    return res.status(err.statusCode).json(response);
  }

  logger.error('Unexpected error', {
    message: err.message,
    stack: err.stack,
    requestId,
    method: req.method,
    path: req.originalUrl ? req.originalUrl.split('?')[0] : 'unknown',
    userId: req.user?.id || undefined,
    companyId: req.user?.companyId || undefined,
  });

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const response = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  };

  if (requestId) response.error.requestId = requestId;

  if (process.env.NODE_ENV === 'development') {
    response.error.internalMessage = err.message;
    if (err.stack) {
      response.error.stack = err.stack.split('\n').slice(0, 5);
    }
  }

  return res.status(statusCode).json(response);
}
