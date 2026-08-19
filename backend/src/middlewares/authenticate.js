import { verifyAccessToken } from '../services/token.service.js';
import userRepository from '../repositories/UserRepository.js';
import { AuthenticationError } from '../errors/index.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Token d\'authentification requis.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AuthenticationError('Token d\'authentification requis.');
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Token expiré. Veuillez vous reconnecter.');
      }
      throw new AuthenticationError('Token invalide.');
    }

    if (decoded.type && decoded.type !== 'access') {
      throw new AuthenticationError('Type de token invalide.');
    }

    const user = await userRepository.findByIdWithCompany(decoded.sub);
    if (!user) {
      throw new AuthenticationError('Utilisateur non trouvé.');
    }

    if (user.status === 'inactive' || user.status === 'suspended') {
      throw new AuthenticationError('Votre compte est désactivé.');
    }

    if (user.status === 'pending') {
      throw new AuthenticationError('Votre compte est en attente de validation.');
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
