/**
 * Navix Companies — CompanyListPage
 * --------------------------------------------------------------------------
 * Liste des entreprises : statistiques, recherche instantanée, filtres, tri,
 * pagination, états chargement / erreur / vide et suppression.
 * Responsive : tableau sur desktop, cartes sur tablette / mobile.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button, Pagination, Spinner } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES, companyDetailPath, companyEditPath } from '@/routes/route.constants';
import { useMediaQuery } from '@/hooks';
import { useCompaniesStore } from '../store';
import { useCompanyListData } from '../hooks';
import {
  CompanyStatsCards,
  CompanySearchBar,
  CompanyFilter,
  CompanyTable,
  CompanyCard,
  CompanyEmptyState,
  DeleteCompanyModal,
} from '../components';

const CompanyListPage = () => {
  const navigate = useNavigate();

  const companies = useCompaniesStore((state) => state.companies);
  const search = useCompaniesStore((state) => state.search);
  const filters = useCompaniesStore((state) => state.filters);
  const sort = useCompaniesStore((state) => state.sort);
  const pageSize = useCompaniesStore((state) => state.pagination.pageSize);
  const isLoading = useCompaniesStore((state) => state.isLoading);
  const error = useCompaniesStore((state) => state.error);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);
  const setSearch = useCompaniesStore((state) => state.setSearch);
  const setFilter = useCompaniesStore((state) => state.setFilter);
  const resetFilters = useCompaniesStore((state) => state.resetFilters);
  const setSort = useCompaniesStore((state) => state.setSort);
  const setPage = useCompaniesStore((state) => state.setPage);
  const setPageSize = useCompaniesStore((state) => state.setPageSize);
  const deleteCompany = useCompaniesStore((state) => state.deleteCompany);
  const clearError = useCompaniesStore((state) => state.clearError);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const isCompact = useMediaQuery('(max-width: 991.98px)');
  const { items, totalItems, totalPages, page } = useCompanyListData();

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const cities = useMemo(
    () =>
      [...new Set(companies.map((company) => company.city).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, 'fr'),
      ),
    [companies],
  );

  const hasActiveFilters = Boolean(search.trim() || filters.country || filters.status || filters.plan || filters.city);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteCompany(deleteTarget.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success(`L’entreprise « ${deleteTarget.name} » a été supprimée.`);
      setDeleteTarget(null);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer l’entreprise.');
    }
  };

  const closeDelete = () => {
    setDeleteTarget(null);
    setDeleteError('');
  };

  const breadcrumbs = [{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Entreprises' }];

  const headerActions = (
    <Button variant="primary" icon="bi-plus-lg" onClick={() => navigate(ROUTES.COMPANIES_CREATE)}>
      Nouvelle entreprise
    </Button>
  );

  return (
    <PageContainer>
      <Helmet>
        <title>Entreprises — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Entreprises"
        subtitle="Gérez les entreprises clientes de la plateforme (multi-tenant)."
        icon="bi-buildings"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      <CompanyStatsCards companies={companies} />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <CompanySearchBar value={search} onChange={setSearch} resultCount={totalItems} />

      <CompanyFilter
        filters={filters}
        cities={cities}
        onChange={setFilter}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isLoading && companies.length === 0 ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner size="lg" label="Chargement des entreprises…" />
        </div>
      ) : items.length === 0 ? (
        <CompanyEmptyState
          onReset={hasActiveFilters ? resetFilters : undefined}
          onCreate={() => navigate(ROUTES.COMPANIES_CREATE)}
        />
      ) : (
        <>
          {isCompact ? (
            <div className="row g-3">
              {items.map((company) => (
                <div key={company.id} className="col-12 col-sm-6 col-xl-4">
                  <CompanyCard
                    company={company}
                    onView={(id) => navigate(companyDetailPath(id))}
                    onEdit={(id) => navigate(companyEditPath(id))}
                    onDelete={setDeleteTarget}
                  />
                </div>
              ))}
            </div>
          ) : (
            <CompanyTable
              companies={items}
              sort={sort}
              onSortChange={(by, direction) => setSort(by, direction)}
              onView={(id) => navigate(companyDetailPath(id))}
              onEdit={(id) => navigate(companyEditPath(id))}
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

      <DeleteCompanyModal
        company={deleteTarget}
        open={Boolean(deleteTarget)}
        loading={isDeleting}
        error={deleteError}
        onConfirm={handleDelete}
        onClose={closeDelete}
      />
    </PageContainer>
  );
};

export default CompanyListPage;
