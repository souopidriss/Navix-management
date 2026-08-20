import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/authenticate.js';
import {
  loginSchema,
  registerClientSchema,
  registerDriverSchema,
  registerPartnerSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  logoutSchema,
} from './auth.schema.js';
import {
  login,
  register,
  logout,
  logoutAll,
  refresh,
  me,
  changePassword,
  forgotPassword,
  resetPassword,
} from './auth.controller.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Trop de tentatives. Réessayez dans 15 minutes.',
    },
  },
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Trop de requêtes. Réessayez plus tard.',
    },
  },
});

router.post('/login', authLimiter, validate(loginSchema), login);

router.post('/register', authLimiter, (req, res, next) => {
  const { role } = req.body;
  switch (role) {
    case 'client_enterprise':
      return validate(registerClientSchema)(req, res, next);
    case 'driver':
      return validate(registerDriverSchema)(req, res, next);
    case 'partner':
      return validate(registerPartnerSchema)(req, res, next);
    default:
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Rôle invalide.' },
      });
  }
}, register);

router.post('/logout', authenticate, validate(logoutSchema), logout);
router.post('/logout-all', authenticate, logoutAll);
router.post('/refresh', refreshLimiter, validate(refreshTokenSchema), refresh);
router.get('/me', authenticate, me);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);

export default router;
