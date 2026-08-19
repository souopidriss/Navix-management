import { Router } from 'express';
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

router.post('/login', validate(loginSchema), login);

router.post('/register', (req, res, next) => {
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
router.post('/refresh', validate(refreshTokenSchema), refresh);
router.get('/me', authenticate, me);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

export default router;
