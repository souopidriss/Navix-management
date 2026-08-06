/**
 * Navix Reports — Hook principal `useReports`
 * --------------------------------------------------------------------------
 * Expose l'état du rapport courant (données calculées par le service),
 * les filtres globaux, la catégorie active et les actions du store
 * (changer de catégorie, filtrer, rafraîchir, exporter).
 */
import { useEffect, useCallback } from 'react';
import { useReportStore } from '../store';

/**
 * @returns {object} — { reportType, report, filters, isLoading, isExporting,
 *                      error, statistics, setReportType, setFilter,
 *                      resetFilters, refresh, exportReport, clearError }
 */
export const useReports = () => {
  const reportType = useReportStore((state) => state.reportType);
  const report = useReportStore((state) => state.report);
  const filters = useReportStore((state) => state.filters);
  const isLoading = useReportStore((state) => state.isLoading);
  const isExporting = useReportStore((state) => state.isExporting);
  const error = useReportStore((state) => state.error);

  const setReportType = useReportStore((state) => state.setReportType);
  const setFilter = useReportStore((state) => state.setFilter);
  const resetFilters = useReportStore((state) => state.resetFilters);
  const refresh = useReportStore((state) => state.refresh);
  const exportReport = useReportStore((state) => state.exportReport);
  const clearError = useReportStore((state) => state.clearError);

  useEffect(() => {
    useReportStore.getState().fetchReport();
  }, []);

  const setPeriod = useCallback(
    (period) => setFilter('period', period),
    [setFilter],
  );

  return {
    reportType,
    report,
    filters,
    isLoading,
    isExporting,
    error,
    statistics: report?.statistics ?? [],
    series: report?.series ?? { labels: [], datasets: [] },
    breakdown: report?.breakdown ?? { labels: [], values: [], variants: [] },
    top: report?.top ?? [],
    rows: report?.rows ?? [],
    summary: report?.summary ?? {},
    periodLabel: report?.periodLabel ?? '',
    setReportType,
    setFilter,
    setPeriod,
    resetFilters,
    refresh,
    exportReport,
    clearError,
  };
};
