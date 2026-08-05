/**
 * Navix Notifications — Actions de notification (marquage, archivage…)
 * --------------------------------------------------------------------------
 * Enveloppe les actions du store avec des toasts utilisateur (react-hot-toast,
 * système de toast existant) et l'état de sauvegarde. Composants et pages ne
 * manipulent jamais le service directement.
 */
import { useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useNotificationsStore } from '../store';

export const useNotificationActions = () => {
  const isSaving = useNotificationsStore((state) => state.isSaving);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAsUnread = useNotificationsStore((state) => state.markAsUnread);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);
  const archive = useNotificationsStore((state) => state.archive);
  const dismiss = useNotificationsStore((state) => state.dismiss);
  const remove = useNotificationsStore((state) => state.remove);
  const clearError = useNotificationsStore((state) => state.clearError);

  const run = useCallback(
    async (action, successMessage) => {
      const result = await action();
      if (result.success) {
        toast.success(successMessage);
        return true;
      }
      toast.error(result.error || 'L’opération a échoué.');
      return false;
    },
    [],
  );

  const actions = useMemo(
    () => ({
      markAsRead: (id) => run(() => markAsRead(id), 'Notification marquée comme lue.'),
      markAsUnread: (id) => run(() => markAsUnread(id), 'Notification marquée comme non lue.'),
      markAllAsRead: () => run(() => markAllAsRead(), 'Toutes les notifications sont marquées comme lues.'),
      archive: (id) => run(() => archive(id), 'Notification archivée.'),
      dismiss: (id) => run(() => dismiss(id), 'Notification ignorée.'),
      remove: (id) => run(() => remove(id), 'Notification supprimée.'),
      clearError,
    }),
    [run, markAsRead, markAsUnread, markAllAsRead, archive, dismiss, remove, clearError],
  );

  return { actions, isSaving };
};
