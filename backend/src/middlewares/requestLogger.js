import logger from '../logs/logger.js';

const SLOW_REQUEST_THRESHOLD_MS = parseInt(process.env.SLOW_REQUEST_THRESHOLD_MS || '1000', 10);

export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const meta = {
      method: req.method,
      path: req.originalUrl ? req.originalUrl.split('?')[0] : 'unknown',
      status: res.statusCode,
      duration: `${duration}ms`,
      durationMs: duration,
      requestId: req.id,
      ip: req.ip,
    };

    if (req.user?.id) meta.userId = req.user.id;
    if (req.user?.companyId) meta.companyId = req.user.companyId;

    if (res.statusCode >= 500) {
      logger.error('Request completed with server error', meta);
    } else if (res.statusCode >= 400) {
      logger.warn('Request completed with client error', meta);
    } else if (duration > SLOW_REQUEST_THRESHOLD_MS) {
      logger.warn('Slow request detected', {
        ...meta,
        threshold: `${SLOW_REQUEST_THRESHOLD_MS}ms`,
      });
    } else {
      logger.http('Request completed', meta);
    }
  });

  next();
}
