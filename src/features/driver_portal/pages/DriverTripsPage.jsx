/**
 * Navix Driver — DriverTripsPage
 * --------------------------------------------------------------------------
 * Liste des trajets du chauffeur : statistiques, recherche, filtres, tri,
 * pagination et états chargement / erreur / vide. Cliquer sur une ligne ouvre
 * le détail du trajet.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { formatDate, formatNumber } from '@/utils/format';
import { Button } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  DataTable,
  StatsCards,
  SearchBar,
  FilterBar,
  Pagination,
  LoadingState,
  ErrorState,
  EmptyState,
  StatusBadge,
} from '@/components/core';
import { usePermission } from '@/features/rbac/hooks';
import { ROUTES, driverTripDetailPath } from '@/routes/route.constants';
import {
  DRIVER_TRIP_STATUSES,
  DRIVER_PERIOD_OPTIONS,
  getDriverTripStatus,
  getDriverTripType,
} from '../constants/driver.constants';
import { useDriverTrips } from '../hooks/useDriverTrips';
import { useDriverTripWorkflow } from '../hooks/useDriverTripWorkflow';
import ActiveTripCard from '../components/DriverTrips/ActiveTripCard';
import TripWorkflowModals from '../components/DriverTrips/TripWorkflowModals';

const DEFAULT_PAGE_SIZE = 8;

const matchesPeriod = (trip, period) => {
  if (!period) return true;
  const date = new Date(`${trip.departureDate}T00:00:00`);
  const now = new Date();

  if (period === 'current') {
    return trip.status === 'in_progress' || trip.status === 'planned';
  }
  if (period === 'month') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  if (period === 'quarter') {
    const quarter = Math.floor(now.getMonth() / 3);
    return date.getFullYear() === now.getFullYear() && Math.floor(date.getMonth() / 3) === quarter;
  }
  return date.getFullYear() === now.getFullYear();
};

const DriverTripsPage = () => {
  const navigate = useNavigate();
  const { trips, isLoading, error, refetch } = useDriverTrips();
  const workflow = useDriverTripWorkflow();
  const canTripUpdate = usePermission('trips.update');

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', period: '', type: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const handlePause = async (trip) => {
    const result = await workflow.submitPause(trip.id);
    if (result.success) {
      toast.success(result.message);
      refetch();
    }
  };

  const handleResume = async (trip) => {
    const result = await workflow.submitResume(trip.id);
    if (result.success) {
      toast.success(result.message);
      refetch();
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (trips ?? []).filter((trip) => {
      if (query) {
        const haystack = [
          trip.tripNumber,
          trip.departure,
          trip.arrival,
          trip.purpose,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (filters.status && trip.status !== filters.status) return false;
      if (filters.type && trip.type !== filters.type) return false;
      if (!matchesPeriod(trip, filters.period)) return false;
      return true;
    });
  }, [trips, search, filters]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const hasActiveFilters = Boolean(search.trim() || filters.status || filters.period || filters.type);

  const resetFilters = () => {
    setSearch('');
    setFilters({ status: '', period: '', type: '' });
  };

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const stats = useMemo(() => {
    const list = trips ?? [];
    return [
      {
        key: 'total',
        label: 'Trajets',
        value: formatNumber(list.length),
        icon: 'bi-signpost-split',
        variant: 'primary',
      },
      {
        key: 'in_progress',
        label: 'En cours',
        value: formatNumber(list.filter((trip) => trip.status === 'in_progress').length),
        icon: 'bi-play-circle',
        variant: 'info',
      },
      {
        key: 'planned',
        label: 'À venir',
        value: formatNumber(list.filter((trip) => trip.status === 'planned').length),
        icon: 'bi-calendar2-event',
        variant: 'warning',
      },
      {
        key: 'completed',
        label: 'Terminés',
        value: formatNumber(list.filter((trip) => trip.status === 'completed').length),
        icon: 'bi-check2-circle',
        variant: 'success',
      },
    ];
  }, [trips]);

  const breadcrumbs = [{ label: 'Espace Chauffeur' }, { label: 'Mes trajets' }];

  if (isLoading && !trips) {
    return (
      <PageContainer>
        <LoadingState variant="table" rows={6} cols={5} label="Chargement de vos trajets…" />
      </PageContainer>
    );
  }

  if (error && !trips) {
    return (
      <PageContainer>
        <ErrorState
          title="Trajets indisponibles"
          description="Impossible de charger vos trajets pour le moment."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Mes trajets — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Mes trajets"
        subtitle="Retrouvez l\u2019ensemble de vos déplacements et leurs statuts."
        icon="bi-signpost-split"
        breadcrumbs={breadcrumbs}
        actions={
          <Button variant="outline" size="sm" icon="bi-arrow-clockwise" onClick={refetch}>
            Actualiser
          </Button>
        }
      />

      <StatsCards stats={stats} loading={isLoading && !trips} columns={4} />

      {workflow.activeTrip && (
        <div className="mb-4">
          <ActiveTripCard
            trip={workflow.activeTrip}
            canPause={canTripUpdate && workflow.canPause(workflow.activeTrip)}
            canResume={canTripUpdate && workflow.canResume(workflow.activeTrip)}
            canComplete={canTripUpdate && workflow.canComplete(workflow.activeTrip)}
            canReport={false}
            busy={workflow.isSubmitting}
            onPause={handlePause}
            onResume={handleResume}
            onComplete={workflow.openComplete}
          />
        </div>
      )}

      <div className="my-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          resultCount={totalItems}
          placeholder="Rechercher un numéro, une ville, une mission…"
        />
      </div>

      <FilterBar
        fields={[
          {
            key: 'status',
            type: 'select',
            label: 'Statut',
            allLabel: 'Tous les statuts',
            options: Object.entries(DRIVER_TRIP_STATUSES).map(([value, meta]) => ({ value, label: meta.label })),
          },
          {
            key: 'type',
            type: 'select',
            label: 'Type',
            allLabel: 'Tous les types',
            options: [
              { value: 'mission', label: 'Mission' },
              { value: 'delivery', label: 'Livraison' },
              { value: 'transport', label: 'Transport' },
              { value: 'personnel', label: 'Personnel' },
            ],
          },
          {
            key: 'period',
            type: 'select',
            label: 'Période',
            allLabel: 'Toutes les périodes',
            options: DRIVER_PERIOD_OPTIONS.filter((option) => option.value),
          },
        ]}
        values={filters}
        onChange={setFilter}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {pageItems.length === 0 ? (
        <EmptyState
          icon="bi-signpost-split"
          title="Aucun trajet trouvé"
          description="Aucun trajet ne correspond à vos critères."
          action={
            hasActiveFilters ? (
              <Button variant="outline" size="sm" icon="bi-arrow-counterclockwise" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            ) : undefined
          }
        />
      ) : (
        <DataTable
          ariaLabel="Liste de mes trajets"
          columns={[
            {
              key: 'tripNumber',
              label: 'N°',
              sortable: true,
              render: (trip) => <span className="fw-semibold">{trip.tripNumber}</span>,
            },
            {
              key: 'route',
              label: 'Itinéraire',
              render: (trip) => (
                <div>
                  <div className="fw-medium">
                    {trip.departure} <i className="bi bi-arrow-right mx-1 text-muted" aria-hidden="true" /> {trip.arrival}
                  </div>
                  <small className="text-muted">{trip.purpose}</small>
                </div>
              ),
            },
            {
              key: 'departureDate',
              label: 'Date',
              sortable: true,
              render: (trip) => formatDate(trip.departureDate),
            },
            {
              key: 'type',
              label: 'Type',
              render: (trip) => {
                const meta = getDriverTripType(trip.type);
                return <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} dot={false} />;
              },
            },
            {
              key: 'plannedDistance',
              label: 'Distance',
              align: 'end',
              sortable: true,
              render: (trip) => `${formatNumber(trip.plannedDistance)} km`,
            },
            {
              key: 'status',
              label: 'Statut',
              render: (trip) => {
                const meta = getDriverTripStatus(trip.status);
                return <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} />;
              },
            },
          ]}
          rows={pageItems}
          onRowClick={(trip) => navigate(driverTripDetailPath(trip.id))}
          actions={[
            ...(canTripUpdate && !workflow.activeTrip
              ? [
                  {
                    key: 'start',
                    label: 'Démarrer',
                    icon: 'bi-play-fill',
                    variant: 'success',
                    show: (trip) => trip.status === 'planned',
                    onClick: (trip) => workflow.startTrip(trip.id),
                  },
                ]
              : []),
            {
              key: 'view',
              label: 'Voir le détail',
              icon: 'bi-eye',
              onClick: (trip) => navigate(driverTripDetailPath(trip.id)),
            },
          ]}
          rowClassName="cursor-pointer"
          footer={
            <Pagination
              page={safePage}
              pageSize={pageSize}
              totalItems={totalItems}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          }
        />
      )}

      <TripWorkflowModals workflow={workflow} onSuccess={refetch} />
    </PageContainer>
  );
};

export default DriverTripsPage;
