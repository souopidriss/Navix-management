/**
 * Navix Audit — Entrée du journal (hook)
 * --------------------------------------------------------------------------
 * Détail d'une entrée du journal : expose l'état du store (log sélectionné,
 * chargement, erreur) et déclenche le chargement lorsque l'identifiant
 * change.
 */
import { useEffect } from 'react';
import { useAuditStore } from '../store';

export const useAuditLog = (id) => {
  const selectedLog = useAuditStore((state) => state.selectedLog);
  const isLoading = useAuditStore((state) => state.isLoading);
  const error = useAuditStore((state) => state.error);
  const fetchLog = useAuditStore((state) => state.fetchLog);
  const clearError = useAuditStore((state) => state.clearError);

  useEffect(() => {
    if (id) fetchLog(id);
  }, [id, fetchLog]);

  return {
    log: selectedLog?.id === id ? selectedLog : null,
    isLoading,
    error,
    clearError,
  };
};
