/**
 * Navix Users — Actions rôles (CRUD + activation + permissions)
 * --------------------------------------------------------------------------
 * Enveloppe les actions du store avec des toasts utilisateur
 * (react-hot-toast, système existant). Composants et pages ne manipulent
 * jamais le service directement.
 */
import { useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useRoleStore } from '../store';

export const useRoleActions = () => {
  const isLoading = useRoleStore((state) => state.isLoading);
  const isSaving = useRoleStore((state) => state.isSaving);
  const refresh = useRoleStore((state) => state.refresh);
  const createRole = useRoleStore((state) => state.createRole);
  const updateRole = useRoleStore((state) => state.updateRole);
  const activateRole = useRoleStore((state) => state.activateRole);
  const deactivateRole = useRoleStore((state) => state.deactivateRole);
  const assignPermissions = useRoleStore((state) => state.assignPermissions);
  const removeRole = useRoleStore((state) => state.removeRole);
  const clearError = useRoleStore((state) => state.clearError);

  const run = useCallback(async (action, successMessage) => {
    const result = await action();
    if (result.success) {
      toast.success(successMessage);
      return result;
    }
    toast.error(result.error || 'L’opération a échoué.');
    return result;
  }, []);

  const actions = useMemo(
    () => ({
      refresh: () => run(() => refresh(), 'Rôles actualisés.'),
      createRole: (payload) => run(() => createRole(payload), 'Rôle créé.'),
      updateRole: (id, payload) => run(() => updateRole(id, payload), 'Rôle mis à jour.'),
      activateRole: (id) => run(() => activateRole(id), 'Rôle activé.'),
      deactivateRole: (id) => run(() => deactivateRole(id), 'Rôle désactivé.'),
      assignPermissions: (id, codes) =>
        run(() => assignPermissions(id, codes), 'Permissions du rôle enregistrées.'),
      removeRole: (id) => run(() => removeRole(id), 'Rôle supprimé.'),
      clearError,
    }),
    [
      run,
      refresh,
      createRole,
      updateRole,
      activateRole,
      deactivateRole,
      assignPermissions,
      removeRole,
      clearError,
    ],
  );

  return { actions, isLoading, isSaving };
};
