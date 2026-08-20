import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config/index.js';
import { validateConfig } from './config/index.js';
import { requestIdMiddleware } from './middlewares/requestId.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import apiRoutes from './routes/index.js';
import logger from './logs/logger.js';

validateConfig();

const app = express();

if (config.isProduction) {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(cors(config.cors));
app.use(requestIdMiddleware);
app.use(express.json({ limit: config.security.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: config.security.bodyLimit }));

app.use((err, _req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Le corps de la requête contient un JSON invalide.',
      },
    });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Le corps de la requête est trop volumineux.',
      },
    });
  }
  next(err);
});

const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
});
app.use(limiter);

app.use(requestLogger);

app.use(config.api.prefix, apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

logger.info('Express application initialized');

export default app;
