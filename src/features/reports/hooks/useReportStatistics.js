/**
 * Navix Reports — Statistiques du rapport courant
 * --------------------------------------------------------------------------
 * Expose les cartes statistiques calculées par le service (`report.statistics`)
 * ainsi que la comparaison avec la période précédente pour chaque indicateur
 * (variation %, tendance et label lisible).
 */
import { useMemo } from 'react';
import { useReports } from './useReports';
import { formatVariation } from '../constants';

/**
 * @returns {object} — { statistics, getStat, compareCurrent, comparePrevious,
 *                      compareVariation }
 */
export const useReportStatistics = () => {
  const { statistics, report } = useReports();

  const byKey = useMemo(
    () => statistics.reduce((acc, stat) => {
      acc[stat.key] = stat;
      return acc;
    }, {}),
    [statistics],
  );

  return {
    statistics,
    getStat: (key) => byKey[key] ?? null,
    period: report?.period ?? { from: '', to: '' },
    comparison: report?.comparison ?? { current: {}, previous: {} },
  };
};

/** Raccourci pour formater une variation (exporté pour les composants). */
export const formatReportVariation = (variation) => formatVariation(variation);
