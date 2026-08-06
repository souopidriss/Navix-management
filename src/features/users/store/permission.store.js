/**
 * Navix Users — Store du module Permissions (Zustand)
 * --------------------------------------------------------------------------
 * État : permissions (catalogue complet), groups (par module), modules,
 * sensitive, stats, isLoading, error.
 *
 * Actions : fetchAll, fetchGroups, fetchModules, fetchSensitive,
 * fetchStatistics, refresh, clearError, reset.
 *
 * Lecture seule : le catalogue est défini par l'application — aucune action de
 * création, modification ou suppression n'existe.
 *
 * Non persisté : les données proviennent du service mocké (mémoire de session).
 */
import { create } from 'zustand';
import { permissionService } from '../services';

const toErrorMessage = (error, fallback) => error?.message || fallback;

const initialState = {
  permissions: [],
  groups: {},
  modules: [],
  sensitive: [],
  stats: null,
  isLoading: false,
  error: null,
};

const usePermissionStore = create((set) => ({
  ...initialState,

  /**
   * Charge le catalogue complet des permissions.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchAll: async () => {
    set({ isLoading: true, error: null });

    try {
      const [permissions, groups, modules, sensitive, stats] = await Promise.all([
        permissionService.getAll(),
        permissionService.getByModule(),
        permissionService.getModules(),
        permissionService.getSensitive(),
        permissionService.statistics(),
      ]);
      set({
        permissions: permissions ?? [],
        groups: groups ?? {},
        modules: modules ?? [],
        sensitive: sensitive ?? [],
        stats: stats ?? null,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les permissions.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /** Charge les groupes par module (pour l'éditeur de rôle). */
  fetchGroups: async () => {
    try {
      const groups = await permissionService.getByModule();
      set({ groups: groups ?? {} });
      return { success: true };
    } catch (error) {
      return { success: false, error: toErrorMessage(error, 'Impossible de charger les permissions.') };
    }
  },

  /** Charge les métadonnées des modules. */
  fetchModules: async () => {
    try {
      const modules = await permissionService.getModules();
      set({ modules: modules ?? [] });
      return { success: true };
    } catch (error) {
      return { success: false, error: toErrorMessage(error, 'Impossible de charger les modules.') };
    }
  },

  /** Recharge le catalogue complet. */
  refresh: async () => usePermissionStore.getState().fetchAll(),

  /** Efface l'erreur courante. */
  clearError: () => set({ error: null }),

  /** Réinitialise entièrement le store. */
  reset: () => set({ ...initialState }),
}));

export default usePermissionStore;
