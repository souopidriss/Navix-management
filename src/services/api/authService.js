/**
 * Navix AuthService
 * --------------------------------------------------------------------------
 * Description : gestion de la session (connexion, déconnexion, mots de passe,
 *               profil courant, renouvellement des jetons).
 * Responsabilité : orchestrer les appels d'authentification pour le store
 *                  auth. Aucune logique métier ; interface fidèle à la future
 *                  API REST (POST /auth/login, GET /auth/me, etc.).
 *
 * Mode mock (actif par défaut) : chaque méthode retourne une Promise simulée.
 * Seule la combinaison `demo@navix.app` / `Password123!` réussit la connexion.
 *
 * Exemple d'utilisation :
 *   import { authService } from '@/services/api';
 *   const { user, tokens } = await authService.login({ email, password });
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '../client';
import { apiConfig } from '../config';
import { ApiError } from '../errors';
import { mockResponse } from '../utils';

const MOCK_CREDENTIALS = { email: 'demo@navix.app', password: 'Password123!' };

let MOCK_USER = {
  id: 'usr_demo',
  firstName: 'Awa',
  lastName: 'Kouamé',
  name: 'Awa Kouamé',
  email: 'demo@navix.app',
  phone: '+225 07 07 07 07 07',
  jobTitle: 'Super Administratrice',
  role: 'super_admin',
  status: 'active',
  avatar: null,
  createdAt: '2024-01-15T09:00:00.000Z',
  updatedAt: '2024-01-15T09:00:00.000Z',
};

const MOCK_COMPANY = {
  id: 'cmp_demo',
  name: 'Navix Trans',
  slug: 'navix-trans',
};

const MOCK_TENANT = {
  id: 'ten_demo',
  name: 'Navix',
  slug: 'navix',
};

/* Durées de vie simulées (secondes) — prêtes pour l'expiration de session. */
const ACCESS_TOKEN_TTL = 15 * 60;
const REFRESH_TOKEN_TTL = 7 * 24 * 3600;

const createMockToken = (kind) =>
  `${kind}_${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`;

export const authService = {
  /**
   * Connexion — vérifie les identifiants simulés puis retourne la session.
   * @param {{ email: string, password: string, rememberMe?: boolean }} credentials
   * @returns {Promise<{ user, company, tenant, tokens }>}
   */
  async login({ email, password, rememberMe = false }) {
    if (apiConfig.mock) {
      await mockResponse(null, { latency: 900 });

      if (email?.trim().toLowerCase() !== MOCK_CREDENTIALS.email || password !== MOCK_CREDENTIALS.password) {
        throw new ApiError({
          status: 401,
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Identifiants invalides. Vérifiez votre adresse email et votre mot de passe.',
        });
      }

      return {
        user: MOCK_USER,
        company: MOCK_COMPANY,
        tenant: MOCK_TENANT,
        tokens: {
          accessToken: createMockToken('access'),
          refreshToken: createMockToken('refresh'),
          expiresIn: ACCESS_TOKEN_TTL,
          refreshExpiresIn: REFRESH_TOKEN_TTL,
          rememberMe,
        },
      };
    }

    const { data } = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password, rememberMe });
    return data;
  },

  /**
   * Déconnexion — révoque la session simulée.
   * @returns {Promise<{ success: boolean }>}
   */
  async logout() {
    if (apiConfig.mock) {
      await mockResponse(null, { latency: 300 });
      return { success: true };
    }

    const { data } = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    return data;
  },

  /**
   * Mot de passe oublié — succès systématique pour éviter l'énumération de comptes.
   * @param {{ email: string }} payload
   * @returns {Promise<{ success: boolean, email: string }>}
   */
  async forgotPassword({ email }) {
    if (apiConfig.mock) {
      await mockResponse(null, { latency: 900 });
      return { success: true, email };
    }

    const { data } = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return data;
  },

  /**
   * Réinitialisation du mot de passe.
   * @param {{ password: string, confirmPassword: string, token: string }} payload
   * @returns {Promise<{ success: boolean }>}
   */
  async resetPassword({ password, confirmPassword, token = 'mock-reset-token' }) {
    if (apiConfig.mock) {
      await mockResponse(null, { latency: 900 });

      if (!token) {
        throw new ApiError({ status: 400, code: 'AUTH_INVALID_TOKEN', message: 'Le lien de réinitialisation est invalide ou a expiré.' });
      }
      if (password !== confirmPassword) {
        throw new ApiError({ status: 400, code: 'AUTH_PASSWORD_MISMATCH', message: 'Les mots de passe ne correspondent pas.' });
      }

      return { success: true };
    }

    const { data } = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { password, confirmPassword, token });
    return data;
  },

  /**
   * Renouvellement des jetons (Refresh Token) — simulé.
   * @param {string|null} refreshToken
   * @returns {Promise<{ tokens: object }>}
   */
  async refresh(refreshToken) {
    if (apiConfig.mock) {
      await mockResponse(null, { latency: 500 });

      if (!refreshToken) {
        throw new ApiError({ status: 401, code: 'AUTH_SESSION_EXPIRED', message: 'Session expirée. Veuillez vous reconnecter.' });
      }

      return {
        tokens: {
          accessToken: createMockToken('access'),
          refreshToken: createMockToken('refresh'),
          expiresIn: ACCESS_TOKEN_TTL,
          refreshExpiresIn: REFRESH_TOKEN_TTL,
        },
      };
    }

    const { data } = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
    return data;
  },

  /**
   * Profil courant (JWT) — simulé.
   * @param {string|null} accessToken
   * @returns {Promise<{ user: object }>}
   */
  async me(accessToken) {
    if (apiConfig.mock) {
      await mockResponse(null, { latency: 500 });

      if (!accessToken) {
        throw new ApiError({ status: 401, code: 'AUTH_NOT_AUTHENTICATED', message: 'Session non authentifiée.' });
      }

      return { user: MOCK_USER };
    }

    const { data } = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return data;
  },

  /**
   * Mise à jour du profil courant — simulée.
   * Recalcule le nom complet depuis les champs prénom / nom.
   * @param {{ firstName: string, lastName: string, phone?: string, jobTitle?: string, avatar?: string|null }} payload
   * @returns {Promise<{ user: object }>}
   */
  async updateProfile(payload) {
    if (apiConfig.mock) {
      await mockResponse(null, { latency: 600 });

      if (!payload || !payload.firstName || !payload.lastName) {
        throw new ApiError({
          status: 400,
          code: 'AUTH_INVALID_PROFILE',
          message: 'Le prénom et le nom sont requis.',
        });
      }

      const firstName = payload.firstName.trim();
      const lastName = payload.lastName.trim();

      MOCK_USER = {
        ...MOCK_USER,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        phone: payload.phone?.trim() || '',
        jobTitle: payload.jobTitle?.trim() || '',
        avatar: payload.avatar ?? MOCK_USER.avatar,
        updatedAt: new Date().toISOString(),
      };

      return { user: MOCK_USER };
    }

    const { data } = await apiClient.patch(API_ENDPOINTS.AUTH.ME, payload);
    return data;
  },
};
