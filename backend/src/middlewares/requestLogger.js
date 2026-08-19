import logger from '../logs/logger.js';

export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const meta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.id,
      ip: req.ip,
    };

    if (res.statusCode >= 500) {
      logger.error('Request completed with error', meta);
    } else if (res.statusCode >= 400) {
      logger.warn('Request completed with client error', meta);
    } else {
      logger.http('Request completed', meta);
    }
  });

  next();
}
