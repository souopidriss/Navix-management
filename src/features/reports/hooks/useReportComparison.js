/**
 * Navix Reports — Comparaison de périodes
 * --------------------------------------------------------------------------
 * Calcule, pour le rapport courant, la différence absolue et relative entre
 * la période sélectionnée et la période précédente de même durée. Les valeurs
 * sont dérivées de `report.statistics` (champs `raw`, `variation`, `trend`).
 */
import { useMemo } from 'react';
import { useReports } from './useReports';

/**
 * @returns {object} — { variations: Array<{key, label, current, previous,
 *                      variation, trend}>, total: object }
 */
export const useReportComparison = () => {
  const { statistics, report } = useReports();

  const variations = useMemo(
    () =>
      statistics
        .map((stat) => ({
          key: stat.key,
          label: stat.label,
          current: stat.raw,
          previous: stat.previous ?? null,
          variation: stat.variation,
          trend: stat.trend,
          format: stat.format,
        }))
        .filter((entry) => entry.current !== undefined),
    [statistics],
  );

  const period = report?.period ?? { from: '', to: '' };
  const previous = report?.comparison?.previous ?? { from: '', to: '' };

  return { variations, period, previous };
};
