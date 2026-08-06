/**
 * Navix Reports — Rapports personnalisés (builder)
 * --------------------------------------------------------------------------
 * Constructeur de rapport : choisir une source, des indicateurs, une période
 * et des filtres, générer un aperçu (stats, répartition, tableau) puis
 * l'enregistrer / le supprimer via useSavedReports.
 */
import { useMemo, useState } from 'react';
import { PageContainer, PageHeader, LoadingState, ErrorState, StatsCards, StatusBadge } from '@/components/core';
import { Card, Button } from '@/components/ui';
import { ROUTES } from '@/routes/route.constants';
import { reportService } from '../services';
import { useReportStore, getReportsCompanyScopeId } from '../store';
import { useSavedReports } from '../hooks';
import {
  CUSTOM_REPORT_SOURCES,
  getCustomReportSource,
  REPORT_PERIODS,
  getReportStatus,
  getReportType,
} from '../constants';
import { customReportDefaultValues, customReportSchema, sanitizeCustomReport } from '../schemas';
import { CUSTOM_INDICATORS_BY_SOURCE } from '../services';
import { ReportFilters, ReportDataTable, DonutChart, TopItems } from '../components';
import '../components/ReportComponents.css';

const PERIOD_OPTIONS = Object.entries(REPORT_PERIODS).map(([value, meta]) => ({ value, label: meta.label }));

const FILTER_KEYS = [
  'companyId',
  'agencyId',
  'vehicleGroup',
  'vehicleId',
  'driverId',
  'status',
  'planCode',
  'tripType',
  'maintenanceType',
  'documentCategory',
];

const CustomReportPage = () => {
  const saved = useSavedReports();
  const filters = useReportStore((state) => state.filters);
  const setFilter = useReportStore((state) => state.setFilter);
  const resetFilters = useReportStore((state) => state.resetFilters);

  const [form, setForm] = useState({ ...customReportDefaultValues });
  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const sourceMeta = getCustomReportSource(form.source);
  const indicators = useMemo(() => CUSTOM_INDICATORS_BY_SOURCE[form.source] ?? [], [form.source]);
  const periodOptions = PERIOD_OPTIONS;
  const activeCount = FILTER_KEYS.filter((key) => filters[key]).length;

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const toggleIndicator = (key) =>
    setForm((current) => ({
      ...current,
      indicators: current.indicators.includes(key)
        ? current.indicators.filter((item) => item !== key)
        : [...current.indicators, key],
    }));

  const generate = async (event) => {
    event?.preventDefault();
    const safeForm = sanitizeCustomReport(form);
    const parsed = customReportSchema.safeParse(safeForm);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Formulaire invalide.');
      return;
    }

    setForm(safeForm);
    setError('');
    setIsGenerating(true);
    try {
      const config = {
        source: safeForm.source,
        indicators: safeForm.indicators,
        period: safeForm.period,
        dateFrom: safeForm.dateFrom,
        dateTo: safeForm.dateTo,
        filters: { ...filters, period: safeForm.period, dateFrom: safeForm.dateFrom, dateTo: safeForm.dateTo },
      };
      const data = await reportService.getCustomReport(config, { companyScopeId: getReportsCompanyScopeId() });
      setResult(data);
    } catch (err) {
      setError(err?.message || 'Impossible de générer le rapport personnalisé.');
    } finally {
      setIsGenerating(false);
    }
  };

  const save = async () => {
    const safeForm = sanitizeCustomReport(form);
    const parsed = customReportSchema.safeParse(safeForm);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Complétez le formulaire avant d’enregistrer.');
      return;
    }
    setForm(safeForm);
    setError('');
    await saved.saveReport({
      name: safeForm.name,
      description: safeForm.description,
      reportType: 'custom',
      status: 'active',
      configuration: {
        period: safeForm.period,
        dateFrom: safeForm.dateFrom,
        dateTo: safeForm.dateTo,
        indicators: safeForm.indicators,
        filters: { ...filters, period: safeForm.period },
      },
    });
  };

  const breadcrumbs = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Rapports', to: ROUTES.REPORTS },
    { label: 'Rapports personnalisés' },
  ];

  const dynamicColumns = useMemo(() => {
    const sample = result?.rows?.[0];
    if (!sample) return [];
    return Object.keys(sample)
      .filter((key) => !['id', 'companyId', 'companyName'].includes(key))
      .map((key) => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        sortable: true,
      }));
  }, [result]);

  const customSaved = saved.savedReports.filter((report) => report.reportType === 'custom');

  return (
    <PageContainer>
      <PageHeader
        title="Rapports personnalisés"
        subtitle="Construisez un rapport à partir de vos propres indicateurs, sources et filtres."
        breadcrumbs={breadcrumbs}
        icon={getReportType('custom').icon}
      />

      {error && (
        <div className="mb-4">
          <ErrorState title="Rapport personnalisé" description={error} retry={generate} />
        </div>
      )}

      <div className="row g-4">
        <div className="col-12 col-xl-4">
          <form onSubmit={generate} noValidate>
            <Card title="Configuration" subtitle="Source, indicateurs et période">
              <div className="mb-3">
                <label htmlFor="custom-source" className="form-label">
                  Source
                </label>
                <select
                  id="custom-source"
                  className="form-select"
                  value={form.source}
                  onChange={(event) => setField('source', event.target.value)}
                >
                  {Object.values(CUSTOM_REPORT_SOURCES).map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="custom-name" className="form-label">
                  Nom du rapport
                </label>
                <input
                  id="custom-name"
                  className="form-control"
                  placeholder="Ex. Suivi carburant — Q3"
                  value={form.name}
                  onChange={(event) => setField('name', event.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="custom-description" className="form-label">
                  Description
                </label>
                <textarea
                  id="custom-description"
                  className="form-control"
                  rows={2}
                  placeholder="Optionnel"
                  value={form.description}
                  onChange={(event) => setField('description', event.target.value)}
                />
              </div>

              <fieldset className="mb-3">
                <legend className="form-label mb-2">Indicateurs ({form.indicators.length})</legend>
                {indicators.map((indicator) => (
                  <div className="form-check" key={indicator.key}>
                    <input
                      id={`indicator-${indicator.key}`}
                      className="form-check-input"
                      type="checkbox"
                      checked={form.indicators.includes(indicator.key)}
                      onChange={() => toggleIndicator(indicator.key)}
                    />
                    <label className="form-check-label small" htmlFor={`indicator-${indicator.key}`}>
                      {indicator.label}
                    </label>
                  </div>
                ))}
                {indicators.length === 0 && <p className="small text-secondary mb-0">Aucun indicateur disponible.</p>}
              </fieldset>

              <div className="mb-3">
                <label htmlFor="custom-period" className="form-label">
                  Période
                </label>
                <select
                  id="custom-period"
                  className="form-select"
                  value={form.period}
                  onChange={(event) => setField('period', event.target.value)}
                >
                  {periodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {form.period === 'custom' && (
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label htmlFor="custom-from" className="form-label">
                      Du
                    </label>
                    <input
                      id="custom-from"
                      type="date"
                      className="form-control"
                      value={form.dateFrom}
                      onChange={(event) => setField('dateFrom', event.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label htmlFor="custom-to" className="form-label">
                      Au
                    </label>
                    <input
                      id="custom-to"
                      type="date"
                      className="form-control"
                      value={form.dateTo}
                      onChange={(event) => setField('dateTo', event.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="d-flex gap-2 flex-wrap">
                <Button type="submit" variant="primary" icon="bi-play" loading={isGenerating}>
                  Générer
                </Button>
                <Button type="button" variant="outline" icon="bi-bookmark-plus" onClick={save} loading={saved.isSaving}>
                  Enregistrer
                </Button>
              </div>
            </Card>
          </form>

          <div className="mt-4">
            <ReportFilters
              isOpen
              filters={filters}
              onChange={setFilter}
              onReset={resetFilters}
              activeCount={activeCount}
            />
          </div>
        </div>

        <div className="col-12 col-xl-8">
          {isGenerating ? (
            <LoadingState variant="cards" rows={3} label="Génération du rapport personnalisé…" />
          ) : result ? (
            <>
              <StatsCards
                stats={result.statistics || []}
                columns={4}
                className="mb-4"
              />
              <div className="row g-4 mb-4">
                <div className="col-12 col-xl-6">
                  <Card title="Répartition" subtitle={`Source : ${getCustomReportSource(result.source).label}`}>
                    <DonutChart data={result.breakdown || { labels: [], values: [], variants: [] }} />
                  </Card>
                </div>
                <div className="col-12 col-xl-6">
                  <TopItems items={result.top || []} title="Points saillants" />
                </div>
              </div>
              <ReportDataTable
                columns={dynamicColumns}
                rows={result.rows || []}
                rowKey="id"
                ariaLabel="Tableau du rapport personnalisé"
                exportFilename={`${result.source || 'rapport'}-personnalise`}
                title={`${form.name || sourceMeta.label}`}
                subtitle={`${(result.rows || []).length} enregistrement(s)`}
              />
            </>
          ) : (
            <Card title="Aperçu" subtitle="Configurez puis cliquez sur Générer.">
              <p className="text-secondary mb-0">
                Les statistiques, la répartition et le tableau détaillé s’afficheront ici après la génération du rapport.
              </p>
            </Card>
          )}
        </div>
      </div>

      {customSaved.length > 0 && (
        <Card title="Mes rapports personnalisés" subtitle={`${customSaved.length} rapport(s)`} className="mt-4" flush>
          <ul className="list-group list-group-flush">
            {customSaved.map((report) => {
              const status = getReportStatus(report.status);
              return (
                <li key={report.id} className="list-group-item d-flex align-items-center gap-3">
                  <div className="flex-grow-1 min-width-0">
                    <span className="fw-semibold">{report.name}</span>
                    <span className="d-block small text-secondary text-truncate">{report.description || '—'}</span>
                  </div>
                  <StatusBadge variant={status.variant} label={status.label} size="sm" />
                  <Button
                    size="sm"
                    variant="danger"
                    outline
                    icon="bi-trash"
                    onClick={() => saved.deleteReport(report.id)}
                    loading={saved.isSaving}
                    aria-label={`Supprimer ${report.name}`}
                  >
                    Supprimer
                  </Button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </PageContainer>
  );
};

export default CustomReportPage;
