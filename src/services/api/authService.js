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
 * Quatre comptes simulés :
 *   - `demo@navix.app` / `Password123!`          → super_admin (Dashboard Admin)
 *   - `chauffeur@navix.app` / `Chauffeur@2026!`   → chauffeur (Espace Chauffeur)
 *   - `client@navix.app` / `Client@2026!`         → client_enterprise (Espace Client)
 *   - `partenaire@navix.app` / `Partenaire@2026!` → partner (Espace Partenaire)
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

/** Rôles autorisés pour l'inscription publique — tout autre rôle est rejeté. */
const PUBLIC_REGISTRATION_ROLES = ['client_enterprise', 'driver', 'partner'];

/** Champs de profil non modifiables via updateProfile (mass assignment protection). */
const PROFILE_PROTECTED_FIELDS = ['role', 'permissions', 'companyId', 'tenantId', 'status'];

const MOCK_ACCOUNTS = [
  {
    email: 'demo@navix.app',
    password: 'Password123!',
    user: {
      id: 'usr_demo',
      firstName: 'Awa',
      lastName: 'Kouamé',
      name: 'Awa Kouamé',
      email: 'demo@navix.app',
      phone: '+237 07 07 07 07 07',
      jobTitle: 'Super Administratrice',
      role: 'super_admin',
      status: 'active',
      avatar: null,
      createdAt: '2024-01-15T09:00:00.000Z',
      updatedAt: '2024-01-15T09:00:00.000Z',
    },
    company: {
      id: 'cmp_demo',
      name: 'Navix Trans',
      slug: 'navix-trans',
    },
    tenant: {
      id: 'ten_demo',
      name: 'Navix',
      slug: 'navix',
    },
  },
  {
    email: 'chauffeur@navix.app',
    password: 'Chauffeur@2026!',
    user: {
      id: 'usr_driver',
      firstName: 'Jean',
      lastName: 'Dupont',
      name: 'Jean Dupont',
      displayName: 'Jean Dupont',
      email: 'chauffeur@navix.app',
      phone: '+237 06 12 34 56 78',
      jobTitle: 'Chauffeur poids lourd',
      role: 'driver',
      companyRole: 'driver',
      tenantRole: 'driver',
      status: 'active',
      avatar: null,
      createdAt: '2023-03-12T09:00:00.000Z',
      updatedAt: '2026-07-20T09:00:00.000Z',
    },
    company: {
      id: 'cmp_tec',
      name: 'Transports Express Cameroun',
      slug: 'transports-express-cameroun',
    },
    tenant: {
      id: 'ten_demo',
      name: 'Navix',
      slug: 'navix',
    },
  },
  {
    email: 'client@navix.app',
    password: 'Client@2026!',
    user: {
      id: 'usr_client',
      firstName: 'Jean-Pierre',
      lastName: 'Ndongo',
      name: 'Jean-Pierre Ndongo',
      displayName: 'Jean-Pierre Ndongo',
      email: 'client@navix.app',
      phone: '+237 06 99 88 77 66',
      jobTitle: 'Responsable de flotte',
      role: 'client_enterprise',
      companyRole: 'client_enterprise',
      tenantRole: 'client_enterprise',
      status: 'active',
      avatar: null,
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2026-08-01T08:00:00.000Z',
    },
    company: {
      id: 'cmp_tec',
      name: 'Transports Express Cameroun',
      slug: 'transports-express-cameroun',
    },
    tenant: {
      id: 'ten_demo',
      name: 'Navix',
      slug: 'navix',
    },
  },
  {
    email: 'partenaire@navix.app',
    password: 'Partenaire@2026!',
    user: {
      id: 'usr_partner_001',
      firstName: 'Aïcha',
      lastName: 'Mballa',
      name: 'Aïcha Mballa',
      displayName: 'Aïcha Mballa',
      email: 'partenaire@navix.app',
      phone: '+237 06 88 55 44 33',
      jobTitle: 'Directrice des opérations',
      role: 'partner',
      companyRole: 'partner',
      tenantRole: 'partner',
      status: 'active',
      avatar: null,
      createdAt: '2025-06-01T08:00:00.000Z',
      updatedAt: '2026-08-15T08:00:00.000Z',
    },
    company: {
      id: 'cmp_partner_navix',
      name: 'Cameroon Logistics Partners',
      slug: 'cameroon-logistics-partners',
    },
    tenant: {
      id: 'ten_demo',
      name: 'Navix',
      slug: 'navix',
    },
  },
];

/* Durées de vie simulées (secondes) — prêtes pour l'expiration de session. */
const ACCESS_TOKEN_TTL = 15 * 60;
const REFRESH_TOKEN_TTL = 7 * 24 * 3600;

/* Profil mutable (mise à jour de profil simulée) — utilisateur courant. */
let currentMockUser = null;

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

      const account = MOCK_ACCOUNTS.find(
        (entry) => entry.email === email?.trim().toLowerCase() && entry.password === password,
      );

      if (!account) {
        throw new ApiError({
          status: 401,
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Identifiants invalides. Vérifiez votre adresse email et votre mot de passe.',
        });
      }

      currentMockUser = account.user;

      return {
        user: account.user,
        company: account.company,
        tenant: account.tenant,
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

      return { user: currentMockUser ?? MOCK_ACCOUNTS[0].user };
    }

    const { data } = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return data;
  },

  /**
   * Inscription — client.
   * @param {{ firstName, lastName, email, password, confirmPassword, companyName, sector, city, country }} payload
   * @returns {Promise<{ user, company, tenant, tokens }>}
   */
  async registerClient(payload) {
    if (apiConfig.mock) {
      await mockResponse(null, { latency: 1000 });

      if (payload.role && !PUBLIC_REGISTRATION_ROLES.includes(payload.role)) {
        throw new ApiError({
          status: 403,
          code: 'AUTH_ROLE_RESTRICTED',
          message: "Ce rôle ne peut pas être attribué via l'inscription publique.",
        });
      }

      const existing = MOCK_ACCOUNTS.find(
        (entry) => entry.email === payload.email?.trim().toLowerCase(),
      );
      if (existing) {
        throw new ApiError({
          status: 409,
          code: 'AUTH_EMAIL_EXISTS',
          message: 'Un compte existe déjà avec cette adresse email.',
        });
      }

      const name = `${payload.firstName.trim()} ${payload.lastName.trim()}`;

      return {
        user: {
          id: `usr_${Date.now()}`,
          firstName: payload.firstName.trim(),
          lastName: payload.lastName.trim(),
          name,
          email: payload.email.trim().toLowerCase(),
          phone: '',
          jobTitle: '',
          role: 'client_enterprise',
          companyRole: 'client_enterprise',
          tenantRole: 'client_enterprise',
          status: 'active',
          avatar: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        company: {
          id: `cmp_${Date.now()}`,
          name: payload.companyName.trim(),
          slug: payload.companyName.trim().toLowerCase().replace(/\s+/g, '-'),
        },
        tenant: { id: 'ten_demo', name: 'Navix', slug: 'navix' },
        tokens: {
          accessToken: createMockToken('access'),
          refreshToken: createMockToken('refresh'),
          expiresIn: ACCESS_TOKEN_TTL,
          refreshExpiresIn: REFRESH_TOKEN_TTL,
        },
      };
    }

    const sanitized = { ...payload };
    for (const field of PROFILE_PROTECTED_FIELDS) {
      delete sanitized[field];
    }
    const { data } = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
      ...sanitized,
      role: 'client_enterprise',
    });
    return data;
  },

  /**
   * Inscription — chauffeur.
   * @param {{ firstName, lastName, email, password, confirmPassword, city, country }} payload
   * @returns {Promise<{ user, company, tenant, tokens }>}
   */
  async registerDriver(payload) {
    if (apiConfig.mock) {
      await mockResponse(null, { latency: 1000 });

      if (payload.role && !PUBLIC_REGISTRATION_ROLES.includes(payload.role)) {
        throw new ApiError({
          status: 403,
          code: 'AUTH_ROLE_RESTRICTED',
          message: "Ce rôle ne peut pas être attribué via l'inscription publique.",
        });
      }

      const existing = MOCK_ACCOUNTS.find(
        (entry) => entry.email === payload.email?.trim().toLowerCase(),
      );
      if (existing) {
        throw new ApiError({
          status: 409,
          code: 'AUTH_EMAIL_EXISTS',
          message: 'Un compte existe déjà avec cette adresse email.',
        });
      }

      const name = `${payload.firstName.trim()} ${payload.lastName.trim()}`;

      return {
        user: {
          id: `usr_${Date.now()}`,
          firstName: payload.firstName.trim(),
          lastName: payload.lastName.trim(),
          name,
          displayName: name,
          email: payload.email.trim().toLowerCase(),
          phone: '',
          jobTitle: 'Chauffeur',
          role: 'driver',
          companyRole: 'driver',
          tenantRole: 'driver',
          status: 'active',
          avatar: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        company: { id: `cmp_${Date.now()}`, name: 'Nouvelle entreprise', slug: 'nouvelle-entreprise' },
        tenant: { id: 'ten_demo', name: 'Navix', slug: 'navix' },
        tokens: {
          accessToken: createMockToken('access'),
          refreshToken: createMockToken('refresh'),
          expiresIn: ACCESS_TOKEN_TTL,
          refreshExpiresIn: REFRESH_TOKEN_TTL,
        },
      };
    }

    const sanitized = { ...payload };
    for (const field of PROFILE_PROTECTED_FIELDS) {
      delete sanitized[field];
    }
    const { data } = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
      ...sanitized,
      role: 'driver',
    });
    return data;
  },

  /**
   * Inscription — partenaire (station).
   * @param {{ firstName, lastName, email, password, confirmPassword, companyName, partnerType, city, country }} payload
   * @returns {Promise<{ user, company, tenant, tokens }>}
   */
  async registerPartner(payload) {
    if (apiConfig.mock) {
      await mockResponse(null, { latency: 1000 });

      if (payload.role && !PUBLIC_REGISTRATION_ROLES.includes(payload.role)) {
        throw new ApiError({
          status: 403,
          code: 'AUTH_ROLE_RESTRICTED',
          message: "Ce rôle ne peut pas être attribué via l'inscription publique.",
        });
      }

      const existing = MOCK_ACCOUNTS.find(
        (entry) => entry.email === payload.email?.trim().toLowerCase(),
      );
      if (existing) {
        throw new ApiError({
          status: 409,
          code: 'AUTH_EMAIL_EXISTS',
          message: 'Un compte existe déjà avec cette adresse email.',
        });
      }

      const name = `${payload.firstName.trim()} ${payload.lastName.trim()}`;

      return {
        user: {
          id: `usr_${Date.now()}`,
          firstName: payload.firstName.trim(),
          lastName: payload.lastName.trim(),
          name,
          displayName: name,
          email: payload.email.trim().toLowerCase(),
          phone: '',
          jobTitle: 'Partenaire',
          role: 'partner',
          companyRole: 'partner',
          tenantRole: 'partner',
          status: 'active',
          avatar: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        company: {
          id: `cmp_${Date.now()}`,
          name: payload.companyName.trim(),
          slug: payload.companyName.trim().toLowerCase().replace(/\s+/g, '-'),
        },
        tenant: { id: 'ten_demo', name: 'Navix', slug: 'navix' },
        tokens: {
          accessToken: createMockToken('access'),
          refreshToken: createMockToken('refresh'),
          expiresIn: ACCESS_TOKEN_TTL,
          refreshExpiresIn: REFRESH_TOKEN_TTL,
        },
      };
    }

    const sanitized = { ...payload };
    for (const field of PROFILE_PROTECTED_FIELDS) {
      delete sanitized[field];
    }
    const { data } = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
      ...sanitized,
      role: 'partner',
    });
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

      const sanitized = { ...payload };
      for (const field of PROFILE_PROTECTED_FIELDS) {
        delete sanitized[field];
      }

      const firstName = sanitized.firstName.trim();
      const lastName = sanitized.lastName.trim();

      const baseUser = currentMockUser ?? MOCK_ACCOUNTS[0].user;
      currentMockUser = {
        ...baseUser,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        phone: sanitized.phone?.trim() || '',
        jobTitle: sanitized.jobTitle?.trim() || '',
        avatar: sanitized.avatar ?? baseUser.avatar,
        updatedAt: new Date().toISOString(),
      };

      return { user: currentMockUser };
    }

    const { data } = await apiClient.patch(API_ENDPOINTS.AUTH.ME, payload);
    return data;
  },
};
