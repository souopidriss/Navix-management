/**
 * Navix Agencies — AgencyListPage
 * --------------------------------------------------------------------------
 * Liste des agences / sites : statistiques, recherche instantanée, filtres,
 * tri, pagination, états chargement / erreur / vide et suppression.
 * Responsive : tableau sur desktop, cartes sur tablette / mobile.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button } from '@/components/ui';
import { PageContainer, PageHeader, Pagination, LoadingState } from '@/components/core';
import {
  ROUTES,
  agencyDetailPath,
  agencyEditPath,
} from '@/routes/route.constants';
import { useMediaQuery } from '@/hooks';
import { useCompaniesStore } from '@/features/companies';
import { useAgenciesStore } from '../store';
import { useAgencyListData } from '../hooks';
import {
  AgencyStatsCards,
  AgencySearchBar,
  AgencyFilters,
  AgencyTable,
  AgencyCard,
  AgencyEmptyState,
  DeleteAgencyModal,
} from '../components';

const AgencyListPage = () => {
  const navigate = useNavigate();

  const agencies = useAgenciesStore((state) => state.agencies);
  const search = useAgenciesStore((state) => state.search);
  const filters = useAgenciesStore((state) => state.filters);
  const sort = useAgenciesStore((state) => state.sort);
  const pageSize = useAgenciesStore((state) => state.pagination.pageSize);
  const isLoading = useAgenciesStore((state) => state.isLoading);
  const error = useAgenciesStore((state) => state.error);
  const fetchAgencies = useAgenciesStore((state) => state.fetchAgencies);
  const setSearch = useAgenciesStore((state) => state.setSearch);
  const setFilter = useAgenciesStore((state) => state.setFilter);
  const resetFilters = useAgenciesStore((state) => state.resetFilters);
  const setSort = useAgenciesStore((state) => state.setSort);
  const setPage = useAgenciesStore((state) => state.setPage);
  const setPageSize = useAgenciesStore((state) => state.setPageSize);
  const deleteAgency = useAgenciesStore((state) => state.deleteAgency);
  const clearError = useAgenciesStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const isCompact = useMediaQuery('(max-width: 991.98px)');

  const companyById = useMemo(
    () => Object.fromEntries(companies.map((company) => [company.id, company])),
    [companies],
  );

  const { items, totalItems, totalPages, page } = useAgencyListData(companyById);

  useEffect(() => {
    fetchAgencies();
    fetchCompanies();
  }, [fetchAgencies, fetchCompanies]);

  const countries = useMemo(
    () =>
      [...new Set(agencies.map((agency) => agency.country).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, 'fr'),
      ),
    [agencies],
  );

  const hasActiveFilters = Boolean(
    search.trim() ||
      filters.companyId ||
      filters.type ||
      filters.status ||
      filters.country ||
      filters.city ||
      filters.region,
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteAgency(deleteTarget.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success(`L’agence « ${deleteTarget.name} » a été supprimée.`);
      setDeleteTarget(null);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer l’agence.');
    }
  };

  const closeDelete = () => {
    setDeleteTarget(null);
    setDeleteError('');
  };

  const breadcrumbs = [{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Agences' }];

  const headerActions = (
    <Button variant="primary" icon="bi-plus-lg" onClick={() => navigate(ROUTES.AGENCIES_CREATE)}>
      Nouvelle agence
    </Button>
  );

  return (
    <PageContainer>
      <Helmet>
        <title>Agences — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Agences & sites"
        subtitle="Gérez les agences et sites de vos entreprises (multi-tenant)."
        icon="bi-diagram-3"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      <AgencyStatsCards agencies={agencies} />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <AgencySearchBar value={search} onChange={setSearch} resultCount={totalItems} />

      <AgencyFilters
        filters={filters}
        companies={companies}
        countries={countries}
        sort={sort}
        onChange={setFilter}
        onSortChange={(by, direction) => setSort(by, direction)}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isLoading && agencies.length === 0 ? (
        <LoadingState variant="table" rows={6} cols={6} label="Chargement des agences…" />
      ) : items.length === 0 ? (
        <AgencyEmptyState
          hasQuery={hasActiveFilters}
          onReset={hasActiveFilters ? resetFilters : undefined}
          onCreate={() => navigate(ROUTES.AGENCIES_CREATE)}
        />
      ) : (
        <>
          {isCompact ? (
            <div className="row g-3">
              {items.map((agency) => (
                <div key={agency.id} className="col-12 col-sm-6 col-xl-4">
                  <AgencyCard
                    agency={agency}
                    company={companyById[agency.companyId]}
                    onView={(id) => navigate(agencyDetailPath(id))}
                    onEdit={(id) => navigate(agencyEditPath(id))}
                    onDelete={setDeleteTarget}
                  />
                </div>
              ))}
            </div>
          ) : (
            <AgencyTable
              agencies={items}
              companyById={companyById}
              sort={sort}
              onSortChange={(by, direction) => setSort(by, direction)}
              onView={(id) => navigate(agencyDetailPath(id))}
              onEdit={(id) => navigate(agencyEditPath(id))}
              onDelete={setDeleteTarget}
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

      <DeleteAgencyModal
        agency={deleteTarget}
        open={Boolean(deleteTarget)}
        loading={isDeleting}
        error={deleteError}
        onConfirm={handleDelete}
        onClose={closeDelete}
      />
    </PageContainer>
  );
};

export default AgencyListPage;
