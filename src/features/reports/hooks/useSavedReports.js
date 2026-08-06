/**
 * Navix Reports — Rapports enregistrés
 * --------------------------------------------------------------------------
 * Charge la liste des rapports enregistrés (bornée à l'entreprise courante)
 * et expose les actions de création, mise à jour et suppression (simulées).
 */
import { useEffect } from 'react';
import { useReportStore } from '../store';

/**
 * @returns {object} — { savedReports, isSaving, saveReport, deleteReport,
 *                      refresh, reload }
 */
export const useSavedReports = () => {
  const savedReports = useReportStore((state) => state.savedReports);
  const isSaving = useReportStore((state) => state.isSaving);
  const error = useReportStore((state) => state.error);
  const saveReport = useReportStore((state) => state.saveReport);
  const deleteReport = useReportStore((state) => state.deleteReport);
  const refresh = useReportStore((state) => state.refresh);

  useEffect(() => {
    useReportStore.getState().fetchSavedReports();
  }, []);

  return {
    savedReports,
    isSaving,
    error,
    saveReport,
    deleteReport,
    reload: () => useReportStore.getState().fetchSavedReports(),
    refresh,
  };
};
