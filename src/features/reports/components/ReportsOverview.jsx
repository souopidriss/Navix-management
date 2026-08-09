/**
 * Navix Reports — ReportsOverview
 * --------------------------------------------------------------------------
 * Aperçu analytique cross-domaines intégré au hub (/reports) : KPIs de
 * pilotage (flotte, trajets, carburant, entretien, finances), tendance des
 * coûts mensuels, répartition des coûts par groupe de véhicules et top des
 * véhicules les plus coûteux. Les préférences d'affichage (devise, unités)
 * proviennent du centre de configuration ; les cartes financières sont
 * masquées sans la permission `reports.viewFinancial`.
 */
import { useMemo } from 'react';
import { StatsCards } from '@/components/core';
import { Card } from '@/components/ui';
import { useRbacStore } from '@/features/rbac';
import { useReportStore } from '../store';
import { useReportPreferences, useReportsOverview } from '../hooks';
import { formatReportMoney, REPORT_PERIODS } from '../constants';
import { PeriodSelector, VariationBadge, TopItems, AreaChart, DonutChart } from './index';
import './ReportComponents.css';

const FINANCIAL_KEYS = ['totalInvoiced', 'totalPaid', 'collectionRate'];

const trendLabelFor = (trend) =>
  trend === 'up' ? 'en hausse' : trend === 'down' ? 'en baisse' : 'stable';

/** Formate la valeur d'une carte selon les préférences du centre de config. */
const formatPreferredValue = (stat, { currency, distanceUnit }) => {
  if (stat.format === 'money') return formatReportMoney(stat.raw, currency);
  if (stat.format === 'distance') {
    const raw = Number(stat.raw);
    if (!Number.isFinite(raw)) return '—';
    if (distanceUnit === 'mi') return `${(raw * 0.621371).toLocaleString('fr-FR')} mi`;
    return `${raw.toLocaleString('fr-FR')} km`;
  }
  return stat.value;
};

const metricFromStat = (stat, preferences) => ({
  key: stat.key,
  label: stat.label,
  value: formatPreferredValue(stat, preferences),
  icon: stat.icon,
  variant: stat.variant,
  variation: <VariationBadge variation={stat.variation} trend={stat.trend} />,
  trend: stat.trend,
  trendLabel: trendLabelFor(stat.trend),
});

const ReportsOverview = () => {
  const overview = useReportsOverview();
  const preferences = useReportPreferences();
  const permissions = useRbacStore((state) => state.permissions);
  const period = useReportStore((state) => state.filters.period);
  const setFilter = useReportStore((state) => state.setFilter);

  const canViewFinancial = permissions.includes('reports.viewFinancial');

  const periodOptions = useMemo(
    () => Object.entries(REPORT_PERIODS).map(([value, meta]) => ({ value, label: meta.label })),
    [],
  );

  const statistics = overview.statistics.filter(
    (stat) => canViewFinancial || !FINANCIAL_KEYS.includes(stat.key),
  );
  const metrics = statistics.map((stat) => metricFromStat(stat, preferences));

  const series = overview.series || { labels: [], datasets: [] };
  const breakdown = overview.breakdown || { labels: [], values: [], variants: [] };
  const statusBreakdown = overview.statusBreakdown || { labels: [], values: [], variants: [] };
  const top = overview.top || [];

  const hasSeries = series.labels.length > 0 && series.datasets.some((dataset) => dataset.values.some((v) => Number(v) > 0));
  const hasBreakdown = breakdown.labels.length > 0;
  const hasStatusBreakdown = statusBreakdown.labels.length > 0;

  return (
    <section className="mb-5" aria-label="Aperçu analytique">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h6 className="text-uppercase small text-secondary mb-0">Aperçu analytique</h6>
        <PeriodSelector
          value={period}
          onChange={(value) => setFilter('period', value)}
          options={periodOptions}
        />
      </div>

      <StatsCards stats={metrics} columns={4} />

      {(hasSeries || hasBreakdown || hasStatusBreakdown) && (
        <div className="row g-3 mt-1">
          {hasSeries && (
            <div className="col-12 col-xl-7">
              <Card title="Coûts d’exploitation mensuels" subtitle={preferences.currency}>
                <AreaChart data={series} />
              </Card>
            </div>
          )}
          {(hasBreakdown || hasStatusBreakdown) && (
            <div className="col-12 col-xl-5">
              <div className="d-grid gap-3">
                {hasBreakdown && (
                  <Card title="Coûts par groupe de véhicules" subtitle={preferences.currency}>
                    <DonutChart
                      data={breakdown}
                      formatValue={(value) => formatReportMoney(value, preferences.currency)}
                    />
                  </Card>
                )}
                {hasStatusBreakdown && (
                  <Card title="Statut de la flotte">
                    <DonutChart data={statusBreakdown} />
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {top.length > 0 && (
        <div className="mt-4">
          <TopItems
            items={top}
            title="Véhicules les plus coûteux"
            formatValue={(value) => formatReportMoney(value, preferences.currency)}
          />
        </div>
      )}
    </section>
  );
};

export default ReportsOverview;
