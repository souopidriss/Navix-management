/**
 * Navix Settings — Hooks du centre de configuration
 * --------------------------------------------------------------------------
 * useSettings : accès global au store (sections, actions, portée tenant).
 * useSettingsSection : hook paramétrable par section ; les hooks nommés
 * (useCompanySettings, useFleetSettings, …) en sont des facades.
 */
import { useCallback } from 'react';
import { useSettingsStore } from '../store';

/** Accès global aux paramètres (sections + actions + portée). */
export const useSettings = () => {
  const state = useSettingsStore();

  const data = {};
  Object.keys(state).forEach((key) => {
    if (['general', 'company', 'fleet', 'maintenance', 'fuel', 'documents', 'notifications', 'user', 'appearance', 'tables', 'regional', 'billing', 'saas', 'security', 'system'].includes(key)) {
      data[key] = state[key];
    }
  });

  return {
    ...data,
    meta: state.meta,
    loading: state.loading,
    savingSection: state.savingSection,
    error: state.error,
    fetchSettings: state.fetchSettings,
    fetchSection: state.fetchSection,
    updateSection: state.updateSection,
    resetSection: state.resetSection,
    resetAllSettings: state.resetAllSettings,
    resetUserPreferences: state.resetUserPreferences,
    clearError: state.clearError,
    reset: state.reset,
  };
};

/** Hook paramétrable pour une section de paramètres. */
export const useSettingsSection = (sectionKey) => {
  const data = useSettingsStore((s) => s[sectionKey]);
  const meta = useSettingsStore((s) => s.meta);
  const loading = useSettingsStore((s) => s.loading);
  const savingSection = useSettingsStore((s) => s.savingSection);
  const error = useSettingsStore((s) => s.error);
  const fetchSection = useSettingsStore((s) => s.fetchSection);
  const updateSection = useSettingsStore((s) => s.updateSection);
  const resetSection = useSettingsStore((s) => s.resetSection);
  const clearError = useSettingsStore((s) => s.clearError);

  const fetch = useCallback(() => fetchSection(sectionKey), [fetchSection, sectionKey]);
  const update = useCallback((values) => updateSection(sectionKey, values), [updateSection, sectionKey]);
  const reset = useCallback(() => resetSection(sectionKey), [resetSection, sectionKey]);

  return {
    data,
    meta,
    loading,
    isSaving: savingSection === sectionKey,
    isResetting: savingSection === sectionKey,
    error,
    clearError,
    fetch,
    update,
    resetSection: reset,
  };
};

/** @returns {{ data, meta, loading, isSaving, error, fetch, update, resetSection }} */
const makeSectionHook = (sectionKey) => () => useSettingsSection(sectionKey);

export const useGeneralSettings = makeSectionHook('general');
export const useCompanySettings = makeSectionHook('company');
export const useFleetSettings = makeSectionHook('fleet');
export const useMaintenanceSettings = makeSectionHook('maintenance');
export const useFuelSettings = makeSectionHook('fuel');
export const useDocumentSettings = makeSectionHook('documents');
export const useNotificationSettings = makeSectionHook('notifications');
export const useUserSettings = makeSectionHook('user');
export const useAppearanceSettings = makeSectionHook('appearance');
export const useTablesSettings = makeSectionHook('tables');
export const useRegionalSettings = makeSectionHook('regional');
export const useBillingSettings = makeSectionHook('billing');
export const useSaasSettings = makeSectionHook('saas');
export const useSecuritySettings = makeSectionHook('security');
export const useSystemSettings = makeSectionHook('system');
