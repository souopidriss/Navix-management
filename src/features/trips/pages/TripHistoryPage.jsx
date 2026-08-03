/**
 * Navix Trips — TripHistoryPage
 * --------------------------------------------------------------------------
 * Historique des trajets passés (terminés / annulés) : recherche, filtre de
 * statut, tri, pagination locale et états chargement / erreur / vide.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Alert, Button, Pagination, Spinner } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES, tripDetailPath } from '@/routes/route.constants';
import { TRIP_STATUSES, TRIP_STATUS_VALUES, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../constants';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '@/features/vehicles';
import { useDriversStore } from '@/features/drivers';
import { useTripsStore } from '../store';
import { useTripHistoryData } from '../hooks';
import { TripSearchBar, TripTable, TripEmptyState } from '../components';

const TripHistoryPage = () => {
  const navigate = useNavigate();

  const history = useTripsStore((state) => state.history);
  const isLoading = useTripsStore((state) => state.isLoading);
  const error = useTripsStore((state) => state.error);
  const fetchHistory = useTripsStore((state) => state.fetchHistory);
  const clearError = useTripsStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const vehicles = useVehiclesStore((state) => state.vehicles);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);

  const drivers = useDriversStore((state) => state.drivers);
  const fetchDrivers = useDriversStore((state) => state.fetchDrivers);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState({ by: 'arrivalDate', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const companyById = useMemo(
    () => Object.fromEntries(companies.map((company) => [company.id, company])),
    [companies],
  );

  const driverById = useMemo(
    () => Object.fromEntries(drivers.map((driver) => [driver.id, driver])),
    [drivers],
  );

  const vehicleById = useMemo(
    () => Object.fromEntries(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles],
  );

  useEffect(() => {
    fetchHistory();
    fetchCompanies();
    fetchVehicles();
    fetchDrivers();
  }, [fetchHistory, fetchCompanies, fetchVehicles, fetchDrivers]);

  const { items, totalItems, totalPages } = useTripHistoryData({
    history,
    search,
    status,
    sort,
    companyById,
    driverById,
    vehicleById,
    page,
    pageSize,
  });

  const hasActiveFilters = Boolean(search.trim() || status);

  const handleReset = () => {
    setSearch('');
    setStatus('');
    setSort({ by: 'arrivalDate', direction: 'desc' });
    setPage(1);
  };

  return (
    <PageContainer>
      <Helmet>
        <title>Historique des trajets — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Historique des trajets"
        subtitle="Trajets terminés et annulés : dates, distance et durée."
        icon="bi-clock-history"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Trajets', to: ROUTES.TRIPS },
          { label: 'Historique' },
        ]}
        actions={
          <Button variant="primary" icon="bi-plus-lg" onClick={() => navigate(ROUTES.TRIPS_CREATE)}>
            Nouveau trajet
          </Button>
        }
      />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <TripSearchBar value={search} onChange={setSearch} resultCount={totalItems} />

      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <select
            id="history-status"
            className="form-select w-auto"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Filtrer par statut"
          >
            <option value="">Tous les statuts</option>
            {TRIP_STATUS_VALUES.map((value) => (
              <option key={value} value={value}>
                {TRIP_STATUSES[value].label}
              </option>
            ))}
          </select>
          <select
            id="history-sort-by"
            className="form-select w-auto"
            value={sort.by}
            onChange={(event) => {
              setSort((current) => ({ ...current, by: event.target.value }));
              setPage(1);
            }}
            aria-label="Trier par"
          >
            <option value="arrivalDate">Tri : Date d’arrivée</option>
            <option value="departureDate">Tri : Date de départ</option>
            <option value="duration">Tri : Durée</option>
          </select>
          <select
            id="history-sort-direction"
            className="form-select w-auto"
            value={sort.direction}
            onChange={(event) => setSort((current) => ({ ...current, direction: event.target.value }))}
            aria-label="Sens du tri"
          >
            <option value="desc">Ordre : Décroissant</option>
            <option value="asc">Ordre : Croissant</option>
          </select>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" icon="bi-arrow-counterclockwise" onClick={handleReset}>
            Réinitialiser
          </Button>
        )}
      </div>

      {isLoading && history.length === 0 ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner size="lg" label="Chargement de l’historique…" />
        </div>
      ) : items.length === 0 ? (
        <TripEmptyState hasQuery={hasActiveFilters} onReset={hasActiveFilters ? handleReset : undefined} variant="history" />
      ) : (
        <>
          <div className="card">
            <div className="card-body p-0">
              <TripTable
                trips={items}
                companyById={companyById}
                driverById={driverById}
                vehicleById={vehicleById}
                onView={(tripId) => navigate(tripDetailPath(tripId))}
              />
            </div>
          </div>

          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        </>
      )}
    </PageContainer>
  );
};

export default TripHistoryPage;
