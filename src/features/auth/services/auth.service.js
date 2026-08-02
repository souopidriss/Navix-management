/**
 * Navix Auth — AuthService (architecture prête à être branchée au backend).
 * --------------------------------------------------------------------------
 * Couche transport de l'authentification. Chaque méthode est simulée
 * (Promise + délai) et retourne une structure fidèle à la future API REST :
 *
 *   login()           → POST /auth/login          → { user, company, tenant, tokens }
 *   logout()          → POST /auth/logout
 *   forgotPassword()  → POST /auth/forgot-password
 *   resetPassword()   → POST /auth/reset-password
 *   refresh()         → POST /auth/refresh        → { tokens }
 *   me()              → GET  /auth/me             → { user }
 *
 * Le branchement backend consistera uniquement à remplacer le corps de ces
 * méthodes par des appels axios (src/lib/axios.js), sans toucher aux appelants.
 *
 * Simulation : la seule combinaison qui « réussit » la connexion est
 *   email : demo@navix.app
 *   mot de passe : Password123!
 */
import { delay } from '../utils/delay';

const MOCK_CREDENTIALS = { email: 'demo@navix.app', password: 'Password123!' };

const MOCK_USER = {
  id: 'usr_demo',
  name: 'Awa Kouamé',
  email: 'demo@navix.app',
  role: 'super_admin',
  avatar: null,
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
    await delay(900);

    if (email?.trim().toLowerCase() !== MOCK_CREDENTIALS.email || password !== MOCK_CREDENTIALS.password) {
      throw new Error('Identifiants invalides. Vérifiez votre adresse email et votre mot de passe.');
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
  },

  /**
   * Déconnexion — révoque la session simulée.
   * @returns {Promise<{ success: boolean }>}
   */
  async logout() {
    await delay(300);
    return { success: true };
  },

  /**
   * Mot de passe oublié — succès systématique pour éviter l'énumération de comptes.
   * @param {{ email: string }} payload
   * @returns {Promise<{ success: boolean, email: string }>}
   */
  async forgotPassword({ email }) {
    await delay(900);
    return { success: true, email };
  },

  /**
   * Réinitialisation du mot de passe.
   * @param {{ password: string, confirmPassword: string, token: string }} payload
   * @returns {Promise<{ success: boolean }>}
   */
  async resetPassword({ password, confirmPassword, token = 'mock-reset-token' }) {
    await delay(900);

    if (!token) throw new Error('Le lien de réinitialisation est invalide ou a expiré.');
    if (password !== confirmPassword) throw new Error('Les mots de passe ne correspondent pas.');

    return { success: true };
  },

  /**
   * Renouvellement des jetons (Refresh Token) — simulé.
   * @param {string|null} refreshToken
   * @returns {Promise<{ tokens: object }>}
   */
  async refresh(refreshToken) {
    await delay(500);

    if (!refreshToken) throw new Error('Session expirée. Veuillez vous reconnecter.');

    return {
      tokens: {
        accessToken: createMockToken('access'),
        refreshToken: createMockToken('refresh'),
        expiresIn: ACCESS_TOKEN_TTL,
        refreshExpiresIn: REFRESH_TOKEN_TTL,
      },
    };
  },

  /**
   * Profil courant (JWT) — simulé.
   * @param {string|null} accessToken
   * @returns {Promise<{ user: object }>}
   */
  async me(accessToken) {
    await delay(500);

    if (!accessToken) throw new Error('Session non authentifiée.');

    return { user: MOCK_USER };
  },
};
