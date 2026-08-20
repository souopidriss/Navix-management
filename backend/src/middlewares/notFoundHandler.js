import { HTTP_STATUS } from '../constants/index.js';

export function notFoundHandler(req, res, _next) {
  const safeUrl = req.originalUrl.split('?')[0];
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${safeUrl} not found`,
    },
  });
}
