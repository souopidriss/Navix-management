/**
 * Navix Notifications — Préférences de notification
 * --------------------------------------------------------------------------
 * Facade des préférences (source unique : section Settings « notifications »).
 * Expose les valeurs chargées, l'état de sauvegarde et les actions de
 * chargement / mise à jour du store.
 */
import { useMemo } from 'react';
import { useNotificationsStore } from '../store';

export const useNotificationPreferences = () => {
  const preferences = useNotificationsStore((state) => state.preferences);
  const isSaving = useNotificationsStore((state) => state.isSaving);
  const error = useNotificationsStore((state) => state.error);

  const fetchPreferences = useNotificationsStore((state) => state.fetchPreferences);
  const updatePreferences = useNotificationsStore((state) => state.updatePreferences);

  return useMemo(
    () => ({
      preferences,
      isSaving,
      error,
      fetchPreferences,
      updatePreferences,
    }),
    [preferences, isSaving, error, fetchPreferences, updatePreferences],
  );
};
