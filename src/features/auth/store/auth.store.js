/**
 * Navix Auth — Store de session (Zustand + persistance).
 * --------------------------------------------------------------------------
 * État : user, company, tenant, accessToken, refreshToken, isAuthenticated,
 *        status, currentRole, loginAt, isLoading, error.
 *
 * Actions : login, logout, forgotPassword, resetPassword, refresh, me,
 *           restoreSession, clearError.
 * Toutes les actions orchestrent authService et retournent { success, error? }.
 *
 * Source unique de vérité de la session : `currentRole` est dérivé de
 * `user.role` et la synchro vers le store RBAC (currentRole, companyRole,
 * tenantRole, permissions) est assurée ici — aucun autre code ne doit
 * modifier le rôle de session. `loginAt` horodate l'ouverture de session.
 *
 * Persistance : seuls les champs de session (user, company, tenant, tokens,
 * loginAt) sont stockés dans STORAGE_KEYS.AUTH. `isAuthenticated` et
 * `status` sont dérivés du token à la réhydratation (merge) — jamais
 * persistés. `currentRole` est re-dérivé de `user.role` au merge.
 * `isLoading` et `error` sont des états transitoires, jamais persistés.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/config';
import { useRbacStore } from '@/features/rbac';
import { authService } from '@/services/api';

const initialSession = {
  user: null,
  company: null,
  tenant: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  status: 'unauthenticated',
  currentRole: null,
  loginAt: null,
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

          useRbacStore.getState().setCurrentRole(user.role);
          useRbacStore.getState().setCompanyRole(user.companyRole ?? user.role);
          useRbacStore.getState().setTenantRole(user.tenantRole ?? user.role);

          set({
            user,
            company,
            tenant,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            currentRole: user.role,
            loginAt: new Date().toISOString(),
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
          useRbacStore.getState().reset();
          set({ ...initialSession });
        }

        return { success: true };
      },

      /**
       * Restauration de session — synchronise la session réhydratée avec le
       * store RBAC au démarrage de l'application. Aucun appel backend : les
       * données proviennent de la persistance locale (merge).
       * @returns {{ authenticated: boolean }}
       */
      restoreSession: () => {
        const { user, accessToken } = get();

        if (!user || !accessToken) {
          return { authenticated: false };
        }

        const role = user.role;
        useRbacStore.getState().setCurrentRole(role);
        useRbacStore.getState().setCompanyRole(user.companyRole ?? role);
        useRbacStore.getState().setTenantRole(user.tenantRole ?? role);

        set({
          currentRole: role,
          isAuthenticated: true,
          status: 'authenticated',
          isLoading: false,
          error: null,
        });

        return { authenticated: true };
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

          if (user?.role && user.role !== get().currentRole) {
            useRbacStore.getState().setCurrentRole(user.role);
            useRbacStore.getState().setCompanyRole(user.companyRole ?? user.role);
            useRbacStore.getState().setTenantRole(user.tenantRole ?? user.role);
            set({ currentRole: user.role });
          }

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
        loginAt: state.loginAt,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        currentRole: persisted?.user?.role ?? null,
        isAuthenticated: Boolean(persisted?.accessToken && persisted?.user),
        status: persisted?.accessToken && persisted?.user ? 'authenticated' : 'unauthenticated',
        isLoading: false,
        error: null,
      }),
    },
  ),
);

export default useAuthStore;
