import * as authService from '../../services/auth.service.js';

export async function login(req, res, next) {
  try {
    const { email, password, rememberMe } = req.body;
    const result = await authService.login(
      { email, password, rememberMe },
      { ipAddress: req.ip, userAgent: req.headers['user-agent'] }
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function register(req, res, next) {
  try {
    const { role } = req.body;
    let result;

    const context = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };

    switch (role) {
      case 'client_enterprise':
        result = await authService.registerClient(req.body, context);
        break;
      case 'driver':
        result = await authService.registerDriver(req.body, context);
        break;
      case 'partner':
        result = await authService.registerPartner(req.body, context);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Rôle invalide.' },
        });
    }

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.logout(req.user.id, refreshToken);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function logoutAll(req, res, next) {
  try {
    const result = await authService.logoutAll(req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const result = await authService.getMe(req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, { currentPassword, newPassword });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password, confirmPassword } = req.body;
    const result = await authService.resetPassword({ token, password, confirmPassword });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
