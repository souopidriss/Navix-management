import { config as loadEnv } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

loadEnv({ path: join(__dirname, '../../.env') });

function optionalEnv(name, fallback) {
  return process.env[name] || fallback;
}

const env = optionalEnv('NODE_ENV', 'development');
const isProduction = env === 'production';
const isDevelopment = env === 'development';
const isTest = env === 'test';

const config = {
  env,
  isProduction,
  isDevelopment,
  isTest,

  server: {
    port: parseInt(optionalEnv('PORT', '8000'), 10),
  },

  api: {
    prefix: optionalEnv('API_PREFIX', '/api/v1'),
    version: 'v1',
  },

  database: {
    host: optionalEnv('DB_HOST', 'localhost'),
    port: parseInt(optionalEnv('DB_PORT', '3306'), 10),
    name: optionalEnv('DB_NAME', 'navix_management'),
    user: optionalEnv('DB_USER', 'root'),
    password: optionalEnv('DB_PASSWORD', ''),
    connectionLimit: parseInt(optionalEnv('DB_CONNECTION_LIMIT', '10'), 10),
    acquireTimeout: parseInt(optionalEnv('DB_ACQUIRE_TIMEOUT', '10000'), 10),
    waitForConnections: true,
    queueLimit: 0,
  },

  jwt: {
    accessSecret: optionalEnv('JWT_ACCESS_SECRET', isTest ? 'test-access-secret' : optionalEnv('JWT_SECRET', '')),
    accessExpiresIn: optionalEnv('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshSecret: optionalEnv('JWT_REFRESH_SECRET', isTest ? 'test-refresh-secret' : optionalEnv('REFRESH_TOKEN_SECRET', '')),
    refreshExpiresIn: optionalEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  email: {
    host: optionalEnv('SMTP_HOST', 'smtp.gmail.com'),
    port: parseInt(optionalEnv('SMTP_PORT', '587'), 10),
    secure: optionalEnv('SMTP_SECURE', 'false') === 'true',
    user: optionalEnv('SMTP_USER', ''),
    pass: optionalEnv('SMTP_PASS', ''),
    from: optionalEnv('SMTP_FROM', 'Navix Management <noreply@navix.app>'),
  },

  auth: {
    bcryptRounds: parseInt(optionalEnv('BCRYPT_ROUNDS', '10'), 10),
    maxLoginAttempts: parseInt(optionalEnv('MAX_LOGIN_ATTEMPTS', '5'), 10),
    lockoutDurationMinutes: parseInt(optionalEnv('LOCKOUT_DURATION_MINUTES', '15'), 10),
    passwordResetTokenExpiresMinutes: parseInt(optionalEnv('PASSWORD_RESET_TOKEN_EXPIRES_MINUTES', '15'), 10),
  },

  cors: {
    origin: optionalEnv('CORS_ORIGIN', 'http://localhost:5173'),
    credentials: true,
  },

  uploads: {
    dir: optionalEnv('UPLOADS_DIR', './uploads'),
    maxFileSize: parseInt(optionalEnv('MAX_FILE_SIZE', '10485760'), 10),
  },

  logging: {
    level: optionalEnv('LOG_LEVEL', isProduction ? 'info' : 'debug'),
  },

  security: {
    rateLimitWindowMs: parseInt(optionalEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    rateLimitMax: parseInt(optionalEnv('RATE_LIMIT_MAX', '100'), 10),
    bodyLimit: '10mb',
  },
};

function validateConfig() {
  const missingDb = [];
  for (const key of ['DB_HOST', 'DB_NAME', 'DB_USER']) {
    if (!process.env[key]) {
      missingDb.push(key);
    }
  }
  if (missingDb.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingDb.join(', ')}`
    );
  }

  if (isProduction) {
    const insecureJwt = [];
    if (!process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET.length < 32) {
      insecureJwt.push('JWT_ACCESS_SECRET (must be at least 32 characters)');
    }
    if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
      insecureJwt.push('JWT_REFRESH_SECRET (must be at least 32 characters)');
    }
    if (insecureJwt.length > 0) {
      throw new Error(
        `Missing or insecure required environment variables: ${insecureJwt.join(', ')}`
      );
    }
  }
}

export { config, validateConfig };
export default config;
