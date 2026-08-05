/**
 * Navix Billing — BillingHistoryPage
 * --------------------------------------------------------------------------
 * Journal de facturation complet : filtres (type d'événement, entreprise),
 * recherche libre et chronologie. Les événements sont triés du plus récent
 * au plus ancien par le service.
 */
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Alert, Card } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState, FilterBar, EmptyState, SearchBar } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useBillingStore } from '../store';
import { BillingHistory } from '../components';
import { BILLING_HISTORY_TYPES, BILLING_HISTORY_TYPE_VALUES, BILLING_ICON } from '../constants';

const toOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const BillingHistoryPage = () => {
  const history = useBillingStore((state) => state.history);
  const isLoading = useBillingStore((state) => state.isLoading);
  const error = useBillingStore((state) => state.error);
  const fetchHistory = useBillingStore((state) => state.fetchHistory);
  const clearError = useBillingStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type: '', companyId: '' });

  useEffect(() => {
    fetchHistory();
    fetchCompanies();
  }, [fetchHistory, fetchCompanies]);

  const companyById = useMemo(
    () => Object.fromEntries(companies.map((company) => [company.id, company])),
    [companies],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return history.filter((entry) => {
      const matchesSearch =
        !query ||
        entry.message.toLowerCase().includes(query) ||
        (companyById[entry.companyId]?.name ?? '').toLowerCase().includes(query);
      const matchesType = !filters.type || entry.type === filters.type;
      const matchesCompany = !filters.companyId || entry.companyId === filters.companyId;
      return matchesSearch && matchesType && matchesCompany;
    });
  }, [history, search, filters, companyById]);

  const hasActiveFilters = Boolean(search.trim() || filters.type || filters.companyId);

  const resetFilters = () => {
    setSearch('');
    setFilters({ type: '', companyId: '' });
  };

  return (
    <PageContainer>
      <Helmet>
        <title>Historique de facturation — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Historique de facturation"
        subtitle="Journal des émissions, paiements, avoirs, remises et remboursements."
        icon="bi-clock-history"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Facturation', to: ROUTES.BILLING },
          { label: 'Historique' },
        ]}
      />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <div className="mb-3">
        <SearchBar
          id="billing-history-search"
          label="Rechercher dans l’historique"
          placeholder="Rechercher par message ou entreprise…"
          value={search}
          onChange={setSearch}
          resultCount={filtered.length}
        />
      </div>

      <Card className="mb-3">
        <FilterBar
          fields={[
            {
              key: 'type',
              type: 'select',
              label: 'Type d’événement',
              options: toOptions(BILLING_HISTORY_TYPE_VALUES, BILLING_HISTORY_TYPES),
              allLabel: 'Tous les types',
            },
            {
              key: 'companyId',
              type: 'select',
              label: 'Entreprise',
              options: companies.map((company) => ({ value: company.id, label: company.name })),
              allLabel: 'Toutes les entreprises',
            },
          ]}
          values={filters}
          onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </Card>

      {isLoading && history.length === 0 ? (
        <LoadingState variant="text" lines={8} label="Chargement de l’historique…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="bi-clock-history"
          title={hasActiveFilters ? 'Aucun résultat' : 'Aucun événement'}
          description={
            hasActiveFilters
              ? 'Aucun événement ne correspond à vos critères. Essayez de modifier vos filtres.'
              : 'Aucune activité de facturation pour le moment.'
          }
        />
      ) : (
        <Card>
          <BillingHistory history={filtered} />
        </Card>
      )}
    </PageContainer>
  );
};

export default BillingHistoryPage;
