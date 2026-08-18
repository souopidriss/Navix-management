/**
 * Navix Super Admin — SuperAdminFinanceReportsPage (SA-FIN-04)
 * --------------------------------------------------------------------------
 * Rapports financiers et contrôle du Super Admin : KPI, évolution des
 * revenus, flux entrées/sorties, répartition des transactions (type,
 * statut, direction), commissions, remboursements, comparaison de
 * périodes, tableau synthétique, export CSV et contrôle financier.
 *
 * READ ONLY — aucune action de modification sur les transactions.
 */
import { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button, Card } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  LoadingState,
  ErrorState,
  MetricCard,
  EmptyState,
} from '@/components/core';
import ExportButton from '@/components/core/ExportButton';
import {
  ROUTES,
} from '@/routes/route.constants';
import { formatNumber } from '@/utils/format';
import { computeVariation, formatVariation } from '@/features/reports/constants/report.constants';
import VariationBadge from '@/features/reports/components/VariationBadge';
import AreaChart from '@/features/reports/components/charts/AreaChart';
import BarChart from '@/features/reports/components/charts/BarChart';
import DonutChart from '@/features/reports/components/charts/DonutChart';
import { useSuperAdminFinance } from '../hooks/useSuperAdminFinance';
import { computeReportData } from '../services/superAdminFinanceService';
import {
  FCFA_LABEL,
  SA_PERIOD_FILTER_OPTIONS,
  SA_TYPE_FILTER_OPTIONS,
  SA_DIRECTION_FILTER_OPTIONS,
  SA_STATUS_FILTER_OPTIONS,
  transactionDirectionOf,
} from '../constants/superAdminFinance.constants';
import './SuperAdminFinanceReportsPage.css';

const EMPTY_FILTERS = { period: '', dateFrom: '', dateTo: '', type: '', direction: '', status: '' };

const TYPE_LABELS = {
  deposit: 'Dépôt', withdrawal: 'Retrait', transfer_in: 'Transfert entrant',
  transfer_out: 'Transfert sortant', payment: 'Paiement', refund: 'Remboursement',
  commission: 'Commission', fee: 'Frais', adjustment: 'Ajustement',
};

const STATUS_LABELS = { success: 'Terminée', pending: 'En attente', failed: 'Échouée', cancelled: 'Annulée' };

const BOM = '\uFEFF';

const csvEscape = (value) => {
  const text = String(value ?? '');
  return /[",;\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const SuperAdminFinanceReportsPage = () => {
  const { transactions, isLoading, error, refetch } = useSuperAdminFinance();

  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const reportData = useMemo(
    () => computeReportData(transactions, filters),
    [transactions, filters],
  );

  const {
    kpis, previous, evolution, byType, flowByType, byStatus, byDirection,
    reportRows, control, filteredCount,
  } = reportData;

  const variations = useMemo(() => ({
    income: computeVariation(kpis.totalIncome, previous.totalIncome),
    expense: computeVariation(kpis.totalExpense, previous.totalExpense),
    net: computeVariation(kpis.netRevenue, previous.netRevenue),
    commissions: computeVariation(kpis.commissions, previous.commissions),
    refunds: computeVariation(kpis.refunds, previous.refunds),
    count: computeVariation(kpis.transactionCount, previous.transactionCount),
  }), [kpis, previous]);

  const chartEvolution = useMemo(() => ({
    labels: evolution.labels,
    datasets: [
      { key: 'income', label: 'Entrées', values: evolution.incomeValues, variant: 'success' },
      { key: 'outcome', label: 'Sorties', values: evolution.outcomeValues, variant: 'danger' },
    ],
  }), [evolution]);

  const chartFlow = useMemo(() => ({
    labels: flowByType.labels.map((k) => TYPE_LABELS[k] || k),
    datasets: [
      { key: 'in', label: 'Entrées (FCFA)', values: flowByType.inValues, variant: 'success' },
      { key: 'out', label: 'Sorties (FCFA)', values: flowByType.outValues, variant: 'danger' },
    ],
  }), [flowByType]);

  const chartByType = useMemo(() => ({
    labels: byType.labels.map((k) => TYPE_LABELS[k] || k),
    values: byType.values,
    variants: byType.labels.map(() => 'primary'),
  }), [byType]);

  const chartByStatus = useMemo(() => ({
    labels: byStatus.labels.map((k) => STATUS_LABELS[k] || k),
    values: byStatus.values,
    variants: byStatus.variants,
  }), [byStatus]);

  const chartByDirection = useMemo(() => ({
    labels: byDirection.labels.map((k) => (k === 'in' ? 'Entrées' : 'Sorties')),
    values: byDirection.values,
    variants: byDirection.variants,
  }), [byDirection]);

  const reportColumns = useMemo(() => [
    { key: 'period', label: 'Période' },
    { key: 'income', label: 'Entrées' },
    { key: 'expense', label: 'Sorties' },
    { key: 'revenue', label: 'Revenu net' },
    { key: 'transactions', label: 'Transactions' },
  ], []);

  const formattedReportRows = useMemo(
    () => reportRows.map((row) => ({
      ...row,
      period: row.period,
      income: `${formatNumber(row.income)} ${FCFA_LABEL}`,
      expense: `${formatNumber(row.expense)} ${FCFA_LABEL}`,
      revenue: `${formatNumber(row.revenue)} ${FCFA_LABEL}`,
      transactions: String(row.transactions),
    })),
    [reportRows],
  );

  const anomalyColumns = useMemo(() => [
    { key: 'reference', label: 'Référence' },
    { key: 'type', label: 'Type' },
    { key: 'issue', label: 'Problème' },
    { key: 'expected', label: 'Attendu' },
    { key: 'actual', label: 'Réel' },
  ], []);

  const formattedAnomalies = useMemo(
    () => control.anomalies.map((a) => ({
      ...a,
      type: TYPE_LABELS[a.type] || a.type,
      expected: typeof a.expected === 'number' ? formatNumber(a.expected) : a.expected,
      actual: typeof a.actual === 'number' ? formatNumber(a.actual) : a.actual,
    })),
    [control.anomalies],
  );

  const handleExportReport = useCallback(() => {
    const headers = ['Période', 'Entrées', 'Sorties', 'Revenu net', 'Transactions'];
    const rows = reportRows.map((r) => [r.period, r.income, r.expense, r.revenue, r.transactions]);
    const csv = [headers.join(';'), ...rows.map((row) => row.map(csvEscape).join(';'))].join('\n');
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-finance-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [reportRows]);

  const handleExportTransactions = useCallback(() => {
    const headers = ['Référence', 'Date', 'Type', 'Direction', 'Source', 'Destination', 'Montant', 'Devise', 'Statut', 'Description'];
    const rows = transactions
      .filter((tx) => {
        if (filters.type && tx.type !== filters.type) return false;
        if (filters.direction && transactionDirectionOf(tx) !== filters.direction) return false;
        if (filters.status && tx.status !== filters.status) return false;
        return true;
      })
      .map((tx) => [
        tx.reference || '',
        tx.createdAt || '',
        tx.type || '',
        transactionDirectionOf(tx) || '',
        tx.source || '',
        tx.destination || '',
        tx.amount || 0,
        tx.currency || 'XAF',
        tx.status || '',
        tx.description || '',
      ]);
    const csv = [headers.join(';'), ...rows.map((row) => row.map(csvEscape).join(';'))].join('\n');
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-filtrees-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [transactions, filters]);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters],
  );

  if (isLoading && transactions.length === 0) {
    return (
      <PageContainer>
        <Helmet><title>Rapports Financiers — Navix</title></Helmet>
        <LoadingState variant="cards" rows={4} label="Chargement des rapports financiers…" />
      </PageContainer>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <PageContainer>
        <Helmet><title>Rapports Financiers — Navix</title></Helmet>
        <ErrorState
          title="Impossible de charger les rapports"
          description="Les données sont temporairement indisponibles."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet><title>Rapports Financiers — Navix Super Admin</title></Helmet>

      <PageHeader
        title="Rapports financiers"
        subtitle="Analyse et contrôle des flux financiers de la plateforme."
        icon="bi-bar-chart-line"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Finance', to: ROUTES.SA_FINANCE },
          { label: 'Rapports' },
        ]}
        actions={
          <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={refetch} aria-label="Actualiser">
            <span className="visually-hidden">Actualiser</span>
          </Button>
        }
      />

      {/* ─── Filtres globaux ─── */}
      <Card title={<span><i className="bi bi-funnel me-2" aria-hidden="true" />Filtres</span>}>
        <div className="row g-3 align-items-end">
          <div className="col-12 col-sm-6 col-lg-2">
            <label className="form-label small" htmlFor="sa-report-period">Période</label>
            <select
              id="sa-report-period"
              className="form-select form-select-sm"
              value={filters.period}
              onChange={(e) => updateFilter('period', e.target.value)}
            >
              {SA_PERIOD_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="col-6 col-sm-6 col-lg-2">
            <label className="form-label small" htmlFor="sa-report-dateFrom">Date début</label>
            <input
              id="sa-report-dateFrom"
              type="date"
              className="form-control form-control-sm"
              value={filters.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
            />
          </div>
          <div className="col-6 col-sm-6 col-lg-2">
            <label className="form-label small" htmlFor="sa-report-dateTo">Date fin</label>
            <input
              id="sa-report-dateTo"
              type="date"
              className="form-control form-control-sm"
              value={filters.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
            />
          </div>
          <div className="col-6 col-sm-6 col-lg-2">
            <label className="form-label small" htmlFor="sa-report-type">Type</label>
            <select
              id="sa-report-type"
              className="form-select form-select-sm"
              value={filters.type}
              onChange={(e) => updateFilter('type', e.target.value)}
            >
              {SA_TYPE_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="col-6 col-sm-6 col-lg-2">
            <label className="form-label small" htmlFor="sa-report-direction">Direction</label>
            <select
              id="sa-report-direction"
              className="form-select form-select-sm"
              value={filters.direction}
              onChange={(e) => updateFilter('direction', e.target.value)}
            >
              {SA_DIRECTION_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="col-6 col-sm-6 col-lg-2">
            <label className="form-label small" htmlFor="sa-report-status">Statut</label>
            <select
              id="sa-report-status"
              className="form-select form-select-sm"
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
            >
              {SA_STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {activeFilterCount > 0 && (
            <div className="col-12 col-lg-2">
              <Button variant="ghost" size="sm" icon="bi-x-lg" onClick={resetFilters}>
                Réinitialiser
              </Button>
            </div>
          )}
        </div>
        {activeFilterCount > 0 && (
          <div className="mt-2">
            <span className="badge bg-primary bg-opacity-10 text-primary">
              {activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''} actif{activeFilterCount > 1 ? 's' : ''}
            </span>
            <span className="ms-2 small text-secondary">
              {filteredCount} transaction{filteredCount > 1 ? 's' : ''} trouvée{filteredCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </Card>

      {/* ─── KPI Rapport ─── */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-4 col-xl">
          <MetricCard
            label="Total entrées"
            value={`${formatNumber(kpis.totalIncome)} ${FCFA_LABEL}`}
            icon="bi-arrow-down-circle"
            variant="success"
          />
        </div>
        <div className="col-6 col-lg-4 col-xl">
          <MetricCard
            label="Total sorties"
            value={`${formatNumber(kpis.totalExpense)} ${FCFA_LABEL}`}
            icon="bi-arrow-up-circle"
            variant="danger"
          />
        </div>
        <div className="col-6 col-lg-4 col-xl">
          <MetricCard
            label="Revenu net"
            value={`${formatNumber(kpis.netRevenue)} ${FCFA_LABEL}`}
            icon="bi-graph-up-arrow"
            variant={kpis.netRevenue >= 0 ? 'success' : 'danger'}
          />
        </div>
        <div className="col-6 col-lg-4 col-xl">
          <MetricCard
            label="Commissions"
            value={`${formatNumber(kpis.commissions)} ${FCFA_LABEL}`}
            icon="bi-percent"
            variant="info"
          />
        </div>
        <div className="col-6 col-lg-4 col-xl">
          <MetricCard
            label="Remboursements"
            value={`${formatNumber(kpis.refunds)} ${FCFA_LABEL}`}
            icon="bi-arrow-counterclockwise"
            variant="warning"
          />
        </div>
        <div className="col-6 col-lg-4 col-xl">
          <MetricCard
            label="Transactions"
            value={String(kpis.transactionCount)}
            icon="bi-receipt"
            variant="primary"
          />
        </div>
      </div>

      {/* ─── Comparaison des périodes ─── */}
      {filters.period && (
        <Card title={<span><i className="bi bi-arrow-left-right me-2" aria-hidden="true" />Comparaison des périodes</span>}>
          <div className="row g-3">
            <div className="col-6 col-md-4 col-lg-2">
              <div className="navix-sa-report-period-card">
                <span className="navix-sa-report-period-card__label">Entrées</span>
                <span className="navix-sa-report-period-card__value">{formatVariation(variations.income)}</span>
                <VariationBadge variation={variations.income} />
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="navix-sa-report-period-card">
                <span className="navix-sa-report-period-card__label">Sorties</span>
                <span className="navix-sa-report-period-card__value">{formatVariation(variations.expense)}</span>
                <VariationBadge variation={variations.expense} invert />
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="navix-sa-report-period-card">
                <span className="navix-sa-report-period-card__label">Revenu net</span>
                <span className="navix-sa-report-period-card__value">{formatVariation(variations.net)}</span>
                <VariationBadge variation={variations.net} />
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="navix-sa-report-period-card">
                <span className="navix-sa-report-period-card__label">Commissions</span>
                <span className="navix-sa-report-period-card__value">{formatVariation(variations.commissions)}</span>
                <VariationBadge variation={variations.commissions} />
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="navix-sa-report-period-card">
                <span className="navix-sa-report-period-card__label">Remboursements</span>
                <span className="navix-sa-report-period-card__value">{formatVariation(variations.refunds)}</span>
                <VariationBadge variation={variations.refunds} invert />
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="navix-sa-report-period-card">
                <span className="navix-sa-report-period-card__label">Transactions</span>
                <span className="navix-sa-report-period-card__value">{formatVariation(variations.count)}</span>
                <VariationBadge variation={variations.count} />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ─── Évolution des revenus ─── */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <Card title={<span><i className="bi bi-graph-up me-2" aria-hidden="true" />Évolution des revenus</span>}>
            {chartEvolution.labels.length > 0 ? (
              <AreaChart data={chartEvolution} height={280} title="Évolution des revenus et sorties" showDots legend />
            ) : (
              <EmptyState icon="bi-graph-up" label="Aucune donnée pour la période sélectionnée." />
            )}
          </Card>
        </div>
        <div className="col-12 col-lg-4">
          <Card title={<span><i className="bi bi-pie-chart me-2" aria-hidden="true" />Répartition par type</span>}>
            {chartByType.labels.length > 0 ? (
              <DonutChart
                data={chartByType}
                size={160}
                title="Répartition des transactions par type"
                totalLabel="Total"
                formatValue={(v) => String(v)}
              />
            ) : (
              <EmptyState icon="bi-pie-chart" label="Aucune donnée de répartition." />
            )}
          </Card>
        </div>
      </div>

      {/* ─── Flux entrées / sorties ─── */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <Card title={<span><i className="bi bi-bar-chart me-2" aria-hidden="true" />Flux par type</span>}>
            {chartFlow.labels.length > 0 ? (
              <BarChart data={chartFlow} height={260} title="Montants entrées et sorties par type de transaction" legend />
            ) : (
              <EmptyState icon="bi-bar-chart" label="Aucune donnée de flux pour la période." />
            )}
          </Card>
        </div>
        <div className="col-12 col-lg-4">
          <Card title={<span><i className="bi bi-arrow-left-right me-2" aria-hidden="true" />Répartition par direction</span>}>
            {chartByDirection.labels.length > 0 ? (
              <DonutChart
                data={chartByDirection}
                size={160}
                title="Répartition entrées vs sorties"
                totalLabel="Total"
                formatValue={(v) => `${formatNumber(v)} ${FCFA_LABEL}`}
              />
            ) : (
              <EmptyState icon="bi-arrow-left-right" label="Aucune donnée." />
            )}
          </Card>
        </div>
      </div>

      {/* ─── Analyse des statuts ─── */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-6">
          <Card title={<span><i className="bi bi-check2-circle me-2" aria-hidden="true" />Transactions par statut</span>}>
            {chartByStatus.labels.length > 0 ? (
              <DonutChart
                data={chartByStatus}
                size={160}
                title="Répartition des statuts de transaction"
                totalLabel="Total"
                formatValue={(v) => String(v)}
              />
            ) : (
              <EmptyState icon="bi-check2-circle" label="Aucune donnée de statut." />
            )}
          </Card>
        </div>
        <div className="col-12 col-lg-6">
          <Card title={<span><i className="bi bi-cash-stack me-2" aria-hidden="true" />Commissions & Remboursements</span>}>
            <div className="row g-3">
              <div className="col-6">
                <div className="navix-sa-report-stat-card">
                  <div className="navix-sa-report-stat-card__icon navix-sa-report-stat-card__icon--info">
                    <i className="bi bi-percent" aria-hidden="true" />
                  </div>
                  <div className="navix-sa-report-stat-card__info">
                    <span className="navix-sa-report-stat-card__label">Total commissions</span>
                    <span className="navix-sa-report-stat-card__value">{formatNumber(kpis.commissions)} {FCFA_LABEL}</span>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="navix-sa-report-stat-card">
                  <div className="navix-sa-report-stat-card__icon navix-sa-report-stat-card__icon--warning">
                    <i className="bi bi-arrow-counterclockwise" aria-hidden="true" />
                  </div>
                  <div className="navix-sa-report-stat-card__info">
                    <span className="navix-sa-report-stat-card__label">Total remboursements</span>
                    <span className="navix-sa-report-stat-card__value">{formatNumber(kpis.refunds)} {FCFA_LABEL}</span>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="navix-sa-report-stat-card">
                  <div className="navix-sa-report-stat-card__icon navix-sa-report-stat-card__icon--success">
                    <i className="bi bi-receipt" aria-hidden="true" />
                  </div>
                  <div className="navix-sa-report-stat-card__info">
                    <span className="navix-sa-report-stat-card__label">Transactions filtrées</span>
                    <span className="navix-sa-report-stat-card__value">{formatNumber(filteredCount)}</span>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="navix-sa-report-stat-card">
                  <div className="navix-sa-report-stat-card__icon navix-sa-report-stat-card__icon--primary">
                    <i className="bi bi-graph-up-arrow" aria-hidden="true" />
                  </div>
                  <div className="navix-sa-report-stat-card__info">
                    <span className="navix-sa-report-stat-card__label">Revenu net</span>
                    <span className="navix-sa-report-stat-card__value">{formatNumber(kpis.netRevenue)} {FCFA_LABEL}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ─── Tableau rapport synthétique ─── */}
      <Card
        title={<span><i className="bi bi-table me-2" aria-hidden="true" />Rapport mensuel</span>}
        actions={
          <ExportButton
            format="csv"
            filename={`rapport-mensuel-${new Date().toISOString().slice(0, 10)}`}
            onExport={handleExportReport}
            label="Exporter le rapport"
            icon="bi-download"
            size="sm"
          />
        }
      >
        {reportRows.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  {reportColumns.map((col) => (
                    <th key={col.key} className="small text-secondary fw-semibold">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formattedReportRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="font-monospace small">{row.period}</td>
                    <td className="small">{row.income}</td>
                    <td className="small">{row.expense}</td>
                    <td className={`small fw-semibold ${reportRows[idx]?.revenue >= 0 ? 'text-success' : 'text-danger'}`}>
                      {row.revenue}
                    </td>
                    <td className="small text-center">{row.transactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="bi-table" label="Aucune donnée pour le tableau de rapport." />
        )}
      </Card>

      {/* ─── Export des transactions filtrées ─── */}
      <div className="mb-4">
        <ExportButton
          format="csv"
          filename={`transactions-filtrees-${new Date().toISOString().slice(0, 10)}`}
          onExport={handleExportTransactions}
          label="Exporter les transactions filtrées"
          icon="bi-download"
          variant="outline"
          size="sm"
        />
      </div>

      {/* ─── Contrôle financier ─── */}
      <Card title={<span><i className="bi bi-shield-check me-2" aria-hidden="true" />Contrôle financier</span>}>
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="navix-sa-report-control-card">
              <span className="navix-sa-report-control-card__label">Transactions contrôlées</span>
              <span className="navix-sa-report-control-card__value">{formatNumber(control.totalChecked)}</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="navix-sa-report-control-card">
              <span className="navix-sa-report-control-card__label">Conformes</span>
              <span className="navix-sa-report-control-card__value navix-sa-report-control-card__value--success">
                {formatNumber(control.conformCount)}
              </span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="navix-sa-report-control-card">
              <span className="navix-sa-report-control-card__label">Anomalies</span>
              <span className={`navix-sa-report-control-card__value ${control.anomalyCount > 0 ? 'navix-sa-report-control-card__value--danger' : 'navix-sa-report-control-card__value--success'}`}>
                {formatNumber(control.anomalyCount)}
              </span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="navix-sa-report-control-card">
              <span className="navix-sa-report-control-card__label">Montant concerné</span>
              <span className="navix-sa-report-control-card__value">
                {formatNumber(control.anomalyAmount)} {FCFA_LABEL}
              </span>
            </div>
          </div>
        </div>

        {control.anomalyCount > 0 ? (
          <div className="navix-sa-report-alert navix-sa-report-alert--warning mb-3" role="alert">
            <i className="bi bi-exclamation-triangle navix-sa-report-alert__icon" aria-hidden="true" />
            <span className="navix-sa-report-alert__text">
              {control.anomalyCount} transaction{control.anomalyCount > 1 ? 's' : ''} présente{control.anomalyCount > 1 ? 'nt' : ''} une incohérence.
            </span>
          </div>
        ) : (
          <div className="navix-sa-report-alert navix-sa-report-alert--success mb-3" role="status">
            <i className="bi bi-check-circle navix-sa-report-alert__icon" aria-hidden="true" />
            <span className="navix-sa-report-alert__text">
              Aucune anomalie détectée — {formatNumber(control.conformCount)} transaction{control.conformCount > 1 ? 's' : ''} conforme{control.conformCount > 1 ? 's' : ''}.
            </span>
          </div>
        )}

        {control.anomalies.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  {anomalyColumns.map((col) => (
                    <th key={col.key} className="small text-secondary fw-semibold">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formattedAnomalies.map((row, idx) => (
                  <tr key={idx}>
                    <td className="font-monospace small">{row.reference}</td>
                    <td className="small">{row.type}</td>
                    <td className="small text-danger">{row.issue}</td>
                    <td className="small">{row.expected}</td>
                    <td className="small">{row.actual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageContainer>
  );
};

export default SuperAdminFinanceReportsPage;
