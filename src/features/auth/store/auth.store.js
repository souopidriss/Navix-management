/**
 * Navix Auth — Store de session (Zustand + persistance).
 * --------------------------------------------------------------------------
 * État : user, company, tenant, accessToken, refreshToken, isAuthenticated,
 *        status, isLoading, error.
 *
 * Actions : login, logout, forgotPassword, resetPassword, refresh, me, clearError.
 * Toutes les actions orchestrent authService et retournent { success, error? }.
 *
 * Persistance : seuls les champs de session (user, company, tenant, tokens)
 * sont stockés dans STORAGE_KEYS.AUTH. `isAuthenticated` et `status` sont
 * dérivés du token à la réhydratation (merge) — jamais persistés.
 * `isLoading` et `error` sont des états transitoires, jamais persistés.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/config';
import { authService } from '@/services/api';

const initialSession = {
  user: null,
  company: null,
  tenant: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  status: 'unauthenticated',
  isLoading: false,
  error: null,
};

const toErrorMessage = (error, fallback) => error?.message || fallback;

const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialSession,

      /**
       * Connexion — appelle authService.login puis enregistre la session.
       * @returns {Promise<{ success: boolean, error?: string }>}
       */
      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const { user, company, tenant, tokens } = await authService.login(credentials);
          set({
            user,
            company,
            tenant,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            status: 'authenticated',
            isLoading: false,
            error: null,
          });
          return { success: true };
        } catch (error) {
          const message = toErrorMessage(error, 'Une erreur est survenue. Veuillez réessayer.');
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      /**
       * Déconnexion — révoque la session simulée puis nettoie l'état local.
       * @returns {Promise<{ success: boolean }>}
       */
      logout: async () => {
        set({ isLoading: true, error: null });

        try {
          await authService.logout();
        } catch {
          /* La déconnexion locale doit toujours aboutir. */
        } finally {
          set({ ...initialSession });
        }

        return { success: true };
      },

      /**
       * Mot de passe oublié — aucune modification de session.
       * @returns {Promise<{ success: boolean, error?: string }>}
       */
      forgotPassword: async ({ email }) => {
        set({ isLoading: true, error: null });

        try {
          await authService.forgotPassword({ email });
          set({ isLoading: false, error: null });
          return { success: true };
        } catch (error) {
          const message = toErrorMessage(error, 'Une erreur est survenue. Veuillez réessayer.');
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      /**
       * Réinitialisation du mot de passe — aucune modification de session.
       * @returns {Promise<{ success: boolean, error?: string }>}
       */
      resetPassword: async (payload) => {
        set({ isLoading: true, error: null });

        try {
          await authService.resetPassword(payload);
          set({ isLoading: false, error: null });
          return { success: true };
        } catch (error) {
          const message = toErrorMessage(error, 'Une erreur est survenue. Veuillez réessayer.');
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      /**
       * Refresh Token — renouvelle accessToken / refreshToken (simulé).
       * @returns {Promise<{ success: boolean, error?: string }>}
       */
      refresh: async () => {
        const { refreshToken } = get();
        set({ isLoading: true, error: null });

        try {
          const { tokens } = await authService.refresh(refreshToken);
          set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, isLoading: false, error: null });
          return { success: true };
        } catch (error) {
          const message = toErrorMessage(error, 'Session expirée. Veuillez vous reconnecter.');
          set({ isLoading: false, error: message, isAuthenticated: false, status: 'unauthenticated' });
          return { success: false, error: message };
        }
      },

      /**
       * Profil courant — met à jour user (simulé).
       * @returns {Promise<{ success: boolean, error?: string }>}
       */
      me: async () => {
        const { accessToken } = get();
        set({ isLoading: true, error: null });

        try {
          const { user } = await authService.me(accessToken);
          set({ user, isLoading: false, error: null });
          return { success: true };
        } catch (error) {
          const message = toErrorMessage(error, 'Impossible de récupérer votre profil.');
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      /** Efface l'erreur courante (ex. fermeture d'une alerte). */
      clearError: () => set({ error: null }),
    }),
    {
      name: STORAGE_KEYS.AUTH,
      partialize: (state) => ({
        user: state.user,
        company: state.company,
        tenant: state.tenant,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        isAuthenticated: Boolean(persisted?.accessToken),
        status: persisted?.accessToken ? 'authenticated' : 'unauthenticated',
        isLoading: false,
        error: null,
      }),
    },
  ),
);

export default useAuthStore;
