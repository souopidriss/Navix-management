/**
 * Navix Drivers — DriverListPage
 * --------------------------------------------------------------------------
 * Liste des chauffeurs : statistiques, recherche instantanée, filtres, tri,
 * pagination, états chargement / erreur / vide et suppression.
 * Responsive : tableau sur desktop, cartes sur tablette / mobile.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button, Pagination, Spinner } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES, driverDetailPath, driverEditPath } from '@/routes/route.constants';
import { useMediaQuery } from '@/hooks';
import { useCompaniesStore } from '@/features/companies';
import { useDriversStore } from '../store';
import { useDriverListData } from '../hooks';
import {
  DriverStatsCards,
  DriverSearchBar,
  DriverFilters,
  DriverTable,
  DriverCard,
  DriverEmptyState,
  DeleteDriverModal,
} from '../components';

const DriverListPage = () => {
  const navigate = useNavigate();

  const drivers = useDriversStore((state) => state.drivers);
  const agencies = useDriversStore((state) => state.agencies);
  const search = useDriversStore((state) => state.search);
  const filters = useDriversStore((state) => state.filters);
  const sort = useDriversStore((state) => state.sort);
  const pageSize = useDriversStore((state) => state.pagination.pageSize);
  const isLoading = useDriversStore((state) => state.isLoading);
  const error = useDriversStore((state) => state.error);
  const fetchDrivers = useDriversStore((state) => state.fetchDrivers);
  const fetchAgencies = useDriversStore((state) => state.fetchAgencies);
  const setSearch = useDriversStore((state) => state.setSearch);
  const setFilter = useDriversStore((state) => state.setFilter);
  const resetFilters = useDriversStore((state) => state.resetFilters);
  const setSort = useDriversStore((state) => state.setSort);
  const setPage = useDriversStore((state) => state.setPage);
  const setPageSize = useDriversStore((state) => state.setPageSize);
  const deleteDriver = useDriversStore((state) => state.deleteDriver);
  const clearError = useDriversStore((state) => state.clearError);

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

  const agencyById = useMemo(
    () => Object.fromEntries(agencies.map((agency) => [agency.id, agency])),
    [agencies],
  );

  const { items, totalItems, totalPages, page } = useDriverListData(companyById, agencyById);

  useEffect(() => {
    fetchDrivers();
    fetchCompanies();
    fetchAgencies();
  }, [fetchDrivers, fetchCompanies, fetchAgencies]);

  const hasActiveFilters = Boolean(
    search.trim() ||
      filters.companyId ||
      filters.agencyId ||
      filters.availability ||
      filters.status ||
      filters.licenseCategory,
  );

  const handleFilterChange = (key, value) => {
    if (key === 'companyId') setFilter('agencyId', '');
    setFilter(key, value);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteDriver(deleteTarget.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success(`Le chauffeur « ${deleteTarget.fullName} » a été supprimé.`);
      setDeleteTarget(null);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer le chauffeur.');
    }
  };

  const closeDelete = () => {
    setDeleteTarget(null);
    setDeleteError('');
  };

  const breadcrumbs = [{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Chauffeurs' }];

  const headerActions = (
    <Button variant="primary" icon="bi-plus-lg" onClick={() => navigate(ROUTES.DRIVERS_CREATE)}>
      Nouveau chauffeur
    </Button>
  );

  return (
    <PageContainer>
      <Helmet>
        <title>Chauffeurs — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Chauffeurs"
        subtitle="Gérez votre équipe de conducteurs : profils, permis et disponibilités."
        icon="bi-person-badge"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      <DriverStatsCards drivers={drivers} />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <DriverSearchBar value={search} onChange={setSearch} resultCount={totalItems} />

      <DriverFilters
        filters={filters}
        companies={companies}
        agencies={agencies}
        sort={sort}
        onChange={handleFilterChange}
        onSortChange={(by, direction) => setSort(by, direction)}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isLoading && drivers.length === 0 ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner size="lg" label="Chargement des chauffeurs…" />
        </div>
      ) : items.length === 0 ? (
        <DriverEmptyState
          onReset={hasActiveFilters ? resetFilters : undefined}
          onCreate={() => navigate(ROUTES.DRIVERS_CREATE)}
        />
      ) : (
        <>
          {isCompact ? (
            <div className="row g-3">
              {items.map((driver) => (
                <div key={driver.id} className="col-12 col-sm-6 col-xl-4">
                  <DriverCard
                    driver={driver}
                    companyName={companyById[driver.companyId]?.name}
                    agencyName={agencyById[driver.agencyId]?.name}
                    onView={(id) => navigate(driverDetailPath(id))}
                    onEdit={(id) => navigate(driverEditPath(id))}
                    onDelete={setDeleteTarget}
                  />
                </div>
              ))}
            </div>
          ) : (
            <DriverTable
              drivers={items}
              companyById={companyById}
              agencyById={agencyById}
              onView={(id) => navigate(driverDetailPath(id))}
              onEdit={(id) => navigate(driverEditPath(id))}
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

      <DeleteDriverModal
        driver={deleteTarget}
        open={Boolean(deleteTarget)}
        loading={isDeleting}
        error={deleteError}
        onConfirm={handleDelete}
        onClose={closeDelete}
      />
    </PageContainer>
  );
};

export default DriverListPage;
