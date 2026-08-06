/**
 * Navix Users — Actions utilisateurs (CRUD + statuts + invite)
 * --------------------------------------------------------------------------
 * Enveloppe les actions du store avec des toasts utilisateur
 * (react-hot-toast, système existant). Composants et pages ne manipulent
 * jamais le service directement.
 */
import { useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useUserStore } from '../store';

export const useUserActions = () => {
  const isLoading = useUserStore((state) => state.isLoading);
  const isSaving = useUserStore((state) => state.isSaving);
  const refresh = useUserStore((state) => state.refresh);
  const createUser = useUserStore((state) => state.createUser);
  const updateUser = useUserStore((state) => state.updateUser);
  const activateUser = useUserStore((state) => state.activateUser);
  const deactivateUser = useUserStore((state) => state.deactivateUser);
  const suspendUser = useUserStore((state) => state.suspendUser);
  const reactivateUser = useUserStore((state) => state.reactivateUser);
  const inviteUser = useUserStore((state) => state.inviteUser);
  const resetPassword = useUserStore((state) => state.resetPassword);
  const removeUser = useUserStore((state) => state.removeUser);
  const clearError = useUserStore((state) => state.clearError);

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
      refresh: () => run(() => refresh(), 'Utilisateurs actualisés.'),
      createUser: (payload) => run(() => createUser(payload), 'Utilisateur créé.'),
      updateUser: (id, payload) => run(() => updateUser(id, payload), 'Utilisateur mis à jour.'),
      activateUser: (id) => run(() => activateUser(id), 'Utilisateur activé.'),
      deactivateUser: (id) => run(() => deactivateUser(id), 'Utilisateur désactivé.'),
      suspendUser: (id) => run(() => suspendUser(id), 'Compte suspendu.'),
      reactivateUser: (id) => run(() => reactivateUser(id), 'Compte réactivé.'),
      inviteUser: (id) => run(() => inviteUser(id), 'Invitation envoyée (simulée).'),
      resetPassword: (id) => run(() => resetPassword(id), 'Réinitialisation déclenchée (simulée).'),
      removeUser: (id) => run(() => removeUser(id), 'Utilisateur supprimé.'),
      clearError,
    }),
    [
      run,
      refresh,
      createUser,
      updateUser,
      activateUser,
      deactivateUser,
      suspendUser,
      reactivateUser,
      inviteUser,
      resetPassword,
      removeUser,
      clearError,
    ],
  );

  return { actions, isLoading, isSaving };
};
