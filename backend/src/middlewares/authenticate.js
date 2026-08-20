import { verifyAccessToken } from '../services/token.service.js';
import userRepository from '../repositories/UserRepository.js';
import { AuthenticationError } from '../errors/index.js';

const GENERIC_AUTH_ERROR = 'Token invalide ou expiré.';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError(GENERIC_AUTH_ERROR);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AuthenticationError(GENERIC_AUTH_ERROR);
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      throw new AuthenticationError(GENERIC_AUTH_ERROR);
    }

    if (decoded.type && decoded.type !== 'access') {
      throw new AuthenticationError(GENERIC_AUTH_ERROR);
    }

    const user = await userRepository.findByIdWithCompany(decoded.sub);
    if (!user) {
      throw new AuthenticationError(GENERIC_AUTH_ERROR);
    }

    if (user.status === 'inactive' || user.status === 'suspended' || user.status === 'pending') {
      throw new AuthenticationError(GENERIC_AUTH_ERROR);
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      status: user.status,
      companyId: user.company_id,
      companyName: user.company_name,
      companySlug: user.company_slug,
    };

    next();
  } catch (error) {
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
    next(error);
  }
}
