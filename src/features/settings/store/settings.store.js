/**
 * Navix Settings — Store du centre de configuration (Zustand)
 * --------------------------------------------------------------------------
 * État : une clé par section de paramètres (general, company, fleet, …),
 * meta (portée + horodatage), loading, savingSection, error.
 *
 * Actions : fetchSettings (bundle complet), fetchSection, updateSection,
 * resetSection, resetAllSettings, clearError, reset.
 *
 * Multi-tenant simulé : `getSettingsCompanyScopeId` borne les paramètres
 * d'entreprise / SaaS au `companyId` courant (sauf super_admin), et
 * `getSettingsUserScopeId` borne les préférences utilisateur au `userId`
 * courant. Le store ne contient aucune logique métier — il délègue au
 * SettingsService.
 */
import { create } from 'zustand';
import { useAuthStore } from '@/features/auth';
import { settingsService } from '../services/settingsService';
import { SETTINGS_SECTION_VALUES } from '../constants';

const toErrorMessage = (error, fallback) => error?.message || fallback;

/** Entreprise du contexte courant (simulation tenant). */
export const getSettingsCompanyScopeId = () => {
  const { user, company } = useAuthStore.getState();
  if (!user) return '';
  if (user.role === 'super_admin') return '';
  return company?.id ?? '';
};

/** Utilisateur du contexte courant (préférences personnelles). */
export const getSettingsUserScopeId = () => {
  const { user } = useAuthStore.getState();
  return user?.id ?? 'usr_001';
};

const getScope = () => ({
  companyScopeId: getSettingsCompanyScopeId(),
  userId: getSettingsUserScopeId(),
});

const sectionKeys = Object.fromEntries(SETTINGS_SECTION_VALUES.map((key) => [key, null]));

const initialState = {
  ...sectionKeys,
  meta: null,
  loading: false,
  savingSection: null,
  error: null,
};

const useSettingsStore = create((set) => ({
  ...initialState,

  /**
   * Charge le bundle complet des paramètres de la portée courante.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const bundle = await settingsService.getSettings(getScope());
      const sections = {};
      SETTINGS_SECTION_VALUES.forEach((key) => {
        sections[key] = bundle[key] ?? null;
      });
      set({ ...sections, meta: bundle.meta ?? null, loading: false });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les paramètres.');
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge une section de paramètres (si absente du store).
   * @param {string} sectionKey
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchSection: async (sectionKey) => {
    if (!SETTINGS_SECTION_VALUES.includes(sectionKey)) {
      return { success: false, error: 'Section de paramètres inconnue.' };
    }
    set({ loading: true, error: null });
    try {
      const data = await settingsService.getSectionSettings(sectionKey, getScope());
      set({ [sectionKey]: data, loading: false });
      return { success: true, data };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger cette section.');
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Enregistre une section de paramètres (notification + audit simulés).
   * @param {string} sectionKey
   * @param {object} values
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  updateSection: async (sectionKey, values) => {
    if (!SETTINGS_SECTION_VALUES.includes(sectionKey)) {
      return { success: false, error: 'Section de paramètres inconnue.' };
    }
    set({ savingSection: sectionKey, error: null });
    try {
      const data = await settingsService.updateSectionSettings(sectionKey, values, getScope());
      set({ [sectionKey]: data, savingSection: null });
      return { success: true, data };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible d’enregistrer les paramètres.');
      set({ savingSection: null, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Réinitialise une section aux valeurs par défaut.
   * @param {string} sectionKey
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  resetSection: async (sectionKey) => {
    if (!SETTINGS_SECTION_VALUES.includes(sectionKey)) {
      return { success: false, error: 'Section de paramètres inconnue.' };
    }
    set({ savingSection: sectionKey, error: null });
    try {
      const data = await settingsService.resetSectionSettings(sectionKey, getScope());
      set({ [sectionKey]: data, savingSection: null });
      return { success: true, data };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de réinitialiser cette section.');
      set({ savingSection: null, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Réinitialise tous les paramètres aux valeurs par défaut.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  resetAllSettings: async () => {
    set({ savingSection: 'all', error: null });
    try {
      const bundle = await settingsService.resetAllSettings(getScope());
      const sections = {};
      SETTINGS_SECTION_VALUES.forEach((key) => {
        sections[key] = bundle[key] ?? null;
      });
      set({ ...sections, meta: bundle.meta ?? null, savingSection: null });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de réinitialiser les paramètres.');
      set({ savingSection: null, error: message });
      return { success: false, error: message };
    }
  },

  /** Efface l'erreur courante. */
  clearError: () => set({ error: null }),

  /** Réinitialise entièrement le store. */
  reset: () => set({ ...initialState }),
}));

export default useSettingsStore;
