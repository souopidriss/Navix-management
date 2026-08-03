/**
 * Navix Assignments — AssignmentListPage
 * --------------------------------------------------------------------------
 * Liste des affectations : statistiques, recherche instantanée, filtres, tri,
 * pagination, états chargement / erreur / vide et suppression.
 * Responsive : tableau sur desktop, cartes sur tablette / mobile.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button, Pagination, Spinner } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES, assignmentDetailPath, assignmentEditPath } from '@/routes/route.constants';
import { useMediaQuery } from '@/hooks';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '@/features/vehicles';
import { useDriversStore } from '@/features/drivers';
import { useAssignmentsStore } from '../store';
import { useAssignmentListData } from '../hooks';
import {
  AssignmentStatsCards,
  AssignmentSearchBar,
  AssignmentFilters,
  AssignmentTable,
  AssignmentCard,
  EmptyAssignmentState,
  DeleteAssignmentModal,
  FinishAssignmentModal,
} from '../components';

const AssignmentListPage = () => {
  const navigate = useNavigate();

  const assignments = useAssignmentsStore((state) => state.assignments);
  const search = useAssignmentsStore((state) => state.search);
  const filters = useAssignmentsStore((state) => state.filters);
  const sort = useAssignmentsStore((state) => state.sort);
  const pageSize = useAssignmentsStore((state) => state.pagination.pageSize);
  const isLoading = useAssignmentsStore((state) => state.isLoading);
  const error = useAssignmentsStore((state) => state.error);
  const fetchAssignments = useAssignmentsStore((state) => state.fetchAssignments);
  const setSearch = useAssignmentsStore((state) => state.setSearch);
  const setFilter = useAssignmentsStore((state) => state.setFilter);
  const resetFilters = useAssignmentsStore((state) => state.resetFilters);
  const setSort = useAssignmentsStore((state) => state.setSort);
  const setPage = useAssignmentsStore((state) => state.setPage);
  const setPageSize = useAssignmentsStore((state) => state.setPageSize);
  const deleteAssignment = useAssignmentsStore((state) => state.deleteAssignment);
  const finishAssignment = useAssignmentsStore((state) => state.finishAssignment);
  const clearError = useAssignmentsStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const vehicles = useVehiclesStore((state) => state.vehicles);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);

  const drivers = useDriversStore((state) => state.drivers);
  const agencies = useDriversStore((state) => state.agencies);
  const fetchDrivers = useDriversStore((state) => state.fetchDrivers);
  const fetchAgencies = useDriversStore((state) => state.fetchAgencies);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [finishTarget, setFinishTarget] = useState(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState('');

  const isCompact = useMediaQuery('(max-width: 991.98px)');

  const companyById = useMemo(
    () => Object.fromEntries(companies.map((company) => [company.id, company])),
    [companies],
  );

  const agencyById = useMemo(
    () => Object.fromEntries(agencies.map((agency) => [agency.id, agency])),
    [agencies],
  );

  const driverById = useMemo(
    () => Object.fromEntries(drivers.map((driver) => [driver.id, driver])),
    [drivers],
  );

  const vehicleById = useMemo(
    () => Object.fromEntries(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles],
  );

  const { items, totalItems, totalPages, page } = useAssignmentListData(
    companyById,
    agencyById,
    driverById,
    vehicleById,
  );

  useEffect(() => {
    fetchAssignments();
    fetchCompanies();
    fetchAgencies();
    fetchVehicles();
    fetchDrivers();
  }, [fetchAssignments, fetchCompanies, fetchAgencies, fetchVehicles, fetchDrivers]);

  const hasActiveFilters = Boolean(
    search.trim() ||
      filters.companyId ||
      filters.agencyId ||
      filters.status ||
      filters.assignmentType ||
      filters.period,
  );

  const handleFilterChange = (key, value) => {
    if (key === 'companyId') setFilter('agencyId', '');
    setFilter(key, value);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteAssignment(deleteTarget.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success(`L’affectation « ${deleteTarget.assignmentNumber} » a été supprimée.`);
      setDeleteTarget(null);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer l’affectation.');
    }
  };

  const closeDelete = () => {
    setDeleteTarget(null);
    setDeleteError('');
  };

  const handleFinish = async (values) => {
    if (!finishTarget) return;
    setIsFinishing(true);
    setFinishError('');

    const result = await finishAssignment(finishTarget.id, values);
    setIsFinishing(false);

    if (result.success) {
      toast.success(`L’affectation « ${finishTarget.assignmentNumber} » a été terminée.`);
      setFinishTarget(null);
    } else {
      setFinishError(result.error || 'Impossible de terminer l’affectation.');
    }
  };

  const closeFinish = () => {
    setFinishTarget(null);
    setFinishError('');
  };

  const breadcrumbs = [{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Affectations' }];

  const headerActions = (
    <div className="d-flex gap-2 flex-wrap">
      <Button variant="outline" icon="bi-clock-history" onClick={() => navigate(ROUTES.ASSIGNMENTS_HISTORY)}>
        Historique
      </Button>
      <Button variant="primary" icon="bi-plus-lg" onClick={() => navigate(ROUTES.ASSIGNMENTS_CREATE)}>
        Nouvelle affectation
      </Button>
    </div>
  );

  return (
    <PageContainer>
      <Helmet>
        <title>Affectations — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Affectations"
        subtitle="Affectez des véhicules à des chauffeurs et suivez les affectations en cours."
        icon="bi-shuffle"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      <AssignmentStatsCards assignments={assignments} />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <AssignmentSearchBar value={search} onChange={setSearch} resultCount={totalItems} />

      <AssignmentFilters
        filters={filters}
        companies={companies}
        agencies={agencies}
        sort={sort}
        onChange={handleFilterChange}
        onSortChange={(by, direction) => setSort(by, direction)}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isLoading && assignments.length === 0 ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner size="lg" label="Chargement des affectations…" />
        </div>
      ) : items.length === 0 ? (
        <EmptyAssignmentState
          hasQuery={hasActiveFilters}
          onReset={hasActiveFilters ? resetFilters : undefined}
        />
      ) : (
        <>
          {isCompact ? (
            <div className="row g-3">
              {items.map((assignment) => (
                <div key={assignment.id} className="col-12 col-sm-6 col-xl-4">
                  <AssignmentCard
                    assignment={assignment}
                    companyName={companyById[assignment.companyId]?.name}
                    driverName={driverById[assignment.driverId]?.fullName}
                    vehicleLabel={
                      vehicleById[assignment.vehicleId]?.registrationNumber ||
                      `${vehicleById[assignment.vehicleId]?.brand ?? ''} ${vehicleById[assignment.vehicleId]?.model ?? ''}`.trim()
                    }
                    onView={(id) => navigate(assignmentDetailPath(id))}
                    onEdit={(id) => navigate(assignmentEditPath(id))}
                    onFinish={setFinishTarget}
                    onDelete={setDeleteTarget}
                  />
                </div>
              ))}
            </div>
          ) : (
            <AssignmentTable
              assignments={items}
              companyById={companyById}
              driverById={driverById}
              vehicleById={vehicleById}
              onView={(id) => navigate(assignmentDetailPath(id))}
              onEdit={(id) => navigate(assignmentEditPath(id))}
              onFinish={setFinishTarget}
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

      <DeleteAssignmentModal
        assignment={deleteTarget}
        open={Boolean(deleteTarget)}
        loading={isDeleting}
        error={deleteError}
        onConfirm={handleDelete}
        onClose={closeDelete}
      />

      <FinishAssignmentModal
        assignment={finishTarget}
        open={Boolean(finishTarget)}
        loading={isFinishing}
        error={finishError}
        onSubmit={handleFinish}
        onClose={closeFinish}
      />
    </PageContainer>
  );
};

export default AssignmentListPage;
