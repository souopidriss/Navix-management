/**
 * Navix Audit — Actions du journal (rafraîchir, exporter)
 * --------------------------------------------------------------------------
 * Enveloppe les actions du store avec des toasts utilisateur
 * (react-hot-toast, système existant). Composants et pages ne manipulent
 * jamais le service directement. Les logs étant immuables, aucune action de
 * modification n'existe.
 */
import { useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAuditStore } from '../store';

export const useAuditActions = () => {
  const isLoading = useAuditStore((state) => state.isLoading);
  const isGenerating = useAuditStore((state) => state.isGenerating);
  const refresh = useAuditStore((state) => state.refresh);
  const exportLogs = useAuditStore((state) => state.exportLogs);
  const clearError = useAuditStore((state) => state.clearError);

  const run = useCallback(async (action, successMessage) => {
    const result = await action();
    if (result.success) {
      toast.success(successMessage);
      return true;
    }
    toast.error(result.error || 'L’opération a échoué.');
    return false;
  }, []);

  const actions = useMemo(
    () => ({
      refresh: () => run(() => refresh(), 'Journal actualisé.'),
      exportLogs: (format) =>
        run(
          () => exportLogs(format),
          `Export ${format.toUpperCase()} généré (${format === 'csv' ? 'fichier téléchargeable' : 'à venir côté serveur'}).`,
        ),
      clearError,
    }),
    [run, refresh, exportLogs, clearError],
  );

  return { actions, isLoading, isGenerating };
};
