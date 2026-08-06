/**
 * Navix Reports — ReportContentView
 * --------------------------------------------------------------------------
 * Gabarit unique partagé par les 13 pages de rapports : charge la catégorie
 * via `useReports`, applique les filtres globaux et compose les blocs
 * (stats → StatsCards, série → Area/BarChart, répartition → DonutChart,
 * top → TopItems, détail → ReportDataTable).
 *
 * Props :
 *   reportType      : catégorie (ex. 'fuel')
 *   columns         : colonnes déclaratives du tableau (reportColumn)
 *   statusOptions   : options de statuts du panneau de filtres
 *   extraFields     : champs FilterBar supplémentaires
 *   chartKind       : 'area' (défaut) | 'bar' — série principale
 *   seriesTitle / breakdownTitle / topTitle : titres des cartes
 *   showSeries / showBreakdown / showTop    : activer/désactiver un bloc
 *   exportFilename  : nom de fichier d'export
 */
import { useEffect, useMemo } from 'react';
import { Button, Card } from '@/components/ui';
import { LoadingState, StatsCards, StatusBadge } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { useReports, useReportFilters } from '../hooks';
import { useReportStore } from '../store';
import { getReportType } from '../constants';
import {
  formatReportMoney,
  formatReportNumber,
  formatReportPercent,
  formatReportDistance,
  formatReportDuration,
  formatReportDate,
  formatReportDateTime,
} from '../constants';
import {
  ReportPageShell,
  ReportFilters,
  PeriodSelector,
  VariationBadge,
  ReportDataTable,
  TopItems,
  AreaChart,
  BarChart,
  DonutChart,
} from '../components';
import './reportPages.css';

const FORMATTERS = {
  money: formatReportMoney,
  number: formatReportNumber,
  percent: formatReportPercent,
  distance: formatReportDistance,
  duration: formatReportDuration,
  date: formatReportDate,
  datetime: formatReportDateTime,
};

const trendLabelFor = (trend) =>
  trend === 'up' ? 'en hausse' : trend === 'down' ? 'en baisse' : 'stable';

const metricFromStat = (stat) => ({
  key: stat.key,
  label: stat.label,
  value: stat.value,
  icon: stat.icon,
  variant: stat.variant,
  variation: <VariationBadge variation={stat.variation} trend={stat.trend} />,
  trend: stat.trend,
  trendLabel: trendLabelFor(stat.trend),
});

const ReportContentView = ({
  reportType,
  columns = [],
  statusOptions,
  extraFields = [],
  chartKind = 'area',
  seriesTitle,
  breakdownTitle,
  showSeries = true,
  showBreakdown = true,
  showTop = true,
  exportFilename,
}) => {
  const report = useReports();
  const filters = useReportFilters();
  const storeReportType = useReportStore((state) => state.reportType);
  const setReportType = useReportStore((state) => state.setReportType);

  useEffect(() => {
    if (storeReportType !== reportType) {
      setReportType(reportType);
    }
  }, [storeReportType, reportType, setReportType]);

  const resolvedColumns = useMemo(
    () =>
      columns.map((column) => ({
        ...column,
        render: column.render
          ? column.render
          : (row) => {
              const value = row[column.key];
              if (column.badge) {
                const meta = column.badge(value) || {};
                return <StatusBadge variant={meta.variant} label={meta.label} size="sm" />;
              }
              if (column.format) {
                const formatter = FORMATTERS[column.format];
                return <span className="text-nowrap">{formatter ? formatter(value) : value}</span>;
              }
              return value ?? '—';
            },
      })),
    [columns],
  );

  const meta = getReportType(reportType);
  const ready = !report.isLoading && report.report?.reportType === reportType;

  const metrics = (report.statistics || []).map(metricFromStat);
  const series = report.series || { labels: [], datasets: [] };
  const breakdown = report.breakdown || { labels: [], values: [], variants: [] };
  const top = report.top || [];
  const rows = report.rows || [];

  const hasSeries = showSeries && series.labels.length > 0 && series.datasets.some((dataset) => dataset.values.some((v) => Number(v) > 0));
  const hasBreakdown = showBreakdown && breakdown.labels.length > 0;
  const hasTop = showTop && top.length > 0;

  const actions = (
    <div className="d-flex gap-2 flex-wrap align-items-center">
      <PeriodSelector
        value={report.filters.period}
        onChange={report.setPeriod}
        options={filters.periodOptions}
        disabled={report.isLoading}
      />
      <Button variant="outline" size="sm" icon="bi-funnel" onClick={filters.toggle} aria-pressed={filters.isOpen}>
        Filtres
        {filters.activeCount > 0 && <span className="navix-report-filters__badge ms-1">{filters.activeCount}</span>}
      </Button>
      <Button variant="outline" size="sm" icon="bi-arrow-clockwise" onClick={report.refresh} disabled={report.isLoading}>
        Rafraîchir
      </Button>
    </div>
  );

  const breadcrumbs = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Rapports', to: ROUTES.REPORTS },
    { label: meta.label },
  ];

  return (
    <ReportPageShell
      meta={meta}
      breadcrumbs={breadcrumbs}
      periodLabel={ready ? report.periodLabel : undefined}
      actions={actions}
      error={report.error}
      onRetry={report.refresh}
    >
      <ReportFilters
        isOpen={filters.isOpen}
        filters={report.filters}
        onChange={report.setFilter}
        onReset={report.resetFilters}
        activeCount={filters.activeCount}
        options={filters.options}
        statusOptions={statusOptions}
        extraFields={extraFields}
      />

      {!ready ? (
        <LoadingState variant="cards" rows={3} label={`Chargement du rapport ${meta.label.toLowerCase()}…`} />
      ) : (
        <div className="navix-report-content">
          <StatsCards stats={metrics} columns={4} />

          {(hasSeries || hasBreakdown) && (
            <div className="row g-3 mb-4">
              {hasSeries && (
                <div className={hasBreakdown ? 'col-12 col-xl-7' : 'col-12'}>
                  <Card title={seriesTitle || 'Évolution'} subtitle={report.periodLabel}>
                    {chartKind === 'bar' ? (
                      <BarChart data={series} />
                    ) : (
                      <AreaChart data={series} />
                    )}
                  </Card>
                </div>
              )}
              {hasBreakdown && (
                <div className={hasSeries ? 'col-12 col-xl-5' : 'col-12 col-xl-7'}>
                  <Card title={breakdownTitle || 'Répartition'} subtitle={report.periodLabel}>
                    <DonutChart data={breakdown} />
                  </Card>
                </div>
              )}
            </div>
          )}

          {hasTop && (
            <div className="mb-4">
              <TopItems items={top} />
            </div>
          )}

          <ReportDataTable
            columns={resolvedColumns}
            rows={rows}
            rowKey="id"
            emptyTitle="Aucune donnée"
            ariaLabel={`Tableau du rapport ${meta.label}`}
            exportFilename={exportFilename || `rapport-${reportType}`}
            title="Détail"
            subtitle={`${rows.length} enregistrement${rows.length > 1 ? 's' : ''}`}
          />
        </div>
      )}
    </ReportPageShell>
  );
};

export default ReportContentView;
