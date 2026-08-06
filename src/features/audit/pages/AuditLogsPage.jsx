/**
 * Navix Audit — AuditLogsPage
 * --------------------------------------------------------------------------
 * Journal des actions : indicateurs, recherche instantanée, filtres, tri,
 * pagination, états chargement / erreur / vide, export (CSV client,
 * Excel/PDF simulés) et rafraîchissement. Responsive : tableau sur desktop,
 * cartes sur tablette / mobile. Lecture seule — le journal est immuable.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button, Alert } from '@/components/ui';
import { PageContainer, PageHeader, Pagination, LoadingState, SearchBar } from '@/components/core';
import { ROUTES, auditLogDetailPath } from '@/routes/route.constants';
import { useMediaQuery } from '@/hooks';
import { useCompaniesStore } from '@/features/companies';
import { useAgenciesStore } from '@/features/agencies';
import { useAuditStore } from '../store';
import { useAuditLogs, useAuditActions, useAuditStatistics } from '../hooks';
import {
  AuditOverview,
  AuditFilters,
  AuditLogTable,
  AuditLogCard,
  ExportAuditButton,
} from '../components';
import { AUDIT_ICON, getAuditResourcePath } from '../constants';
import './AuditLogsPage.css';

const AuditLogsPage = () => {
  const navigate = useNavigate();

  const isLoading = useAuditStore((state) => state.isLoading);
  const isGenerating = useAuditStore((state) => state.isGenerating);
  const error = useAuditStore((state) => state.error);
  const search = useAuditStore((state) => state.search);
  const filters = useAuditStore((state) => state.filters);
  const sort = useAuditStore((state) => state.sort);
  const pageSize = useAuditStore((state) => state.pagination.pageSize);
  const fetchLogs = useAuditStore((state) => state.fetchLogs);
  const setSearch = useAuditStore((state) => state.setSearch);
  const setFilter = useAuditStore((state) => state.setFilter);
  const resetFilters = useAuditStore((state) => state.resetFilters);
  const setSort = useAuditStore((state) => state.setSort);
  const setPage = useAuditStore((state) => state.setPage);
  const setPageSize = useAuditStore((state) => state.setPageSize);
  const clearError = useAuditStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);
  const agencies = useAgenciesStore((state) => state.agencies);
  const fetchAgencies = useAgenciesStore((state) => state.fetchAgencies);

  const { actions } = useAuditActions();
  const { cards, alerts, isLoading: statsLoading } = useAuditStatistics();
  const { items, totalItems, totalPages, page } = useAuditLogs();

  const isCompact = useMediaQuery('(max-width: 991.98px)');

  const hasActiveFilters = Boolean(
    search.trim() ||
      filters.companyId ||
      filters.agencyId ||
      filters.userId ||
      filters.action ||
      filters.actionType ||
      filters.resourceType ||
      filters.status ||
      filters.severity ||
      filters.period ||
      filters.dateFrom ||
      filters.dateTo,
  );

  useEffect(() => {
    fetchLogs();
    fetchCompanies();
    fetchAgencies();
  }, [fetchLogs, fetchCompanies, fetchAgencies]);

  const handleExport = async (format) => {
    await actions.exportLogs(format);
  };

  const handleOpenResource = (log) => {
    const path = getAuditResourcePath(log.resourceType, log.resourceId);
    if (path !== '/') navigate(path);
  };

  const activeCountLabel = `${totalItems} action${totalItems > 1 ? 's' : ''}`;

  return (
    <PageContainer>
      <Helmet>
        <title>Journal des actions — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Journal des actions"
        subtitle="Traçabilité complète et immuable des actions — lecture seule."
        icon={AUDIT_ICON}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Journal des actions' },
        ]}
        actions={
          <div className="d-flex gap-2">
            <ExportAuditButton
              isLoading={isLoading}
              isGenerating={isGenerating}
              onExport={handleExport}
            />
            <Button variant="outline" size="sm" icon="bi-arrow-clockwise" loading={isLoading} onClick={actions.refresh}>
              Rafraîchir
            </Button>
          </div>
        }
      />

      <AuditOverview cards={cards} alerts={alerts} loading={isLoading || statsLoading} />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <SearchBar value={search} onChange={setSearch} resultCount={totalItems} />

      <AuditFilters
        filters={filters}
        companies={companies}
        agencies={agencies}
        sort={sort}
        onChange={setFilter}
        onSortChange={(by, direction) => setSort(by, direction)}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isLoading && items.length === 0 ? (
        <LoadingState variant="table" rows={6} cols={7} label="Chargement du journal des actions…" />
      ) : items.length === 0 ? (
        <div className="navix-audit-empty">
          {hasActiveFilters ? (
            <>
              <p className="text-muted mb-0">Aucune action ne correspond aux critères.</p>
              <Button variant="ghost" size="sm" icon="bi-arrow-counterclockwise" onClick={resetFilters} className="mt-2">
                Réinitialiser les filtres
              </Button>
            </>
          ) : (
            <p className="text-muted mb-0">Aucune action enregistrée pour le moment.</p>
          )}
        </div>
      ) : (
        <>
          <div className="text-muted mb-2">{activeCountLabel}</div>
          {isCompact ? (
            <div className="row g-3">
              {items.map((log) => (
                <div key={log.id} className="col-12 col-sm-6 col-xl-4">
                  <AuditLogCard log={log} onView={(item) => navigate(auditLogDetailPath(item.id))} />
                </div>
              ))}
            </div>
          ) : (
            <AuditLogTable
              logs={items}
              sort={sort}
              onSortChange={(by, direction) => setSort(by, direction)}
              onView={(log) => navigate(auditLogDetailPath(log.id))}
              onOpenResource={handleOpenResource}
            />
          )}

          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </PageContainer>
  );
};

export default AuditLogsPage;
