/**
 * Navix Trips — TripDetailsPage
 * --------------------------------------------------------------------------
 * Détail d'un trajet : en-tête (statut, type, entreprise, affectation),
 * itinéraire, cartes véhicule et chauffeur, indicateurs, chronologie et
 * notes. Actions (modifier / clôturer / supprimer) et états chargement /
 * erreur / introuvable.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Badge, Button, Card, Spinner } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES, tripEditPath, vehicleDetailPath, driverDetailPath, assignmentDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '@/features/vehicles';
import { useDriversStore } from '@/features/drivers';
import { useAssignmentsStore } from '@/features/assignments';
import { useTripsStore } from '../store';
import {
  TripStatusBadge,
  TripRouteCard,
  TripVehicleCard,
  TripDriverCard,
  TripTimeline,
  DeleteTripModal,
  TripFinishModal,
} from '../components';
import {
  getTripType,
  getTripStatus,
  formatTripLongDate,
  formatTripDateTime,
  formatTripDistance,
  formatTripMileage,
  formatTripDuration,
  formatTripSpeed,
} from '../constants';
import './TripDetailsPage.css';

const InfoRow = ({ icon, label, children }) => (
  <div className="d-flex align-items-start gap-3 py-2">
    <span className="navix-trip-detail__icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <div className="min-w-0">
      <dt className="navix-trip-detail__label">{label}</dt>
      <dd className="navix-trip-detail__value mb-0">{children}</dd>
    </div>
  </div>
);

const TripDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedTrip = useTripsStore((state) => state.selectedTrip);
  const isLoading = useTripsStore((state) => state.isLoading);
  const error = useTripsStore((state) => state.error);
  const fetchTrip = useTripsStore((state) => state.fetchTrip);
  const finishTrip = useTripsStore((state) => state.finishTrip);
  const deleteTrip = useTripsStore((state) => state.deleteTrip);
  const clearError = useTripsStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const vehicles = useVehiclesStore((state) => state.vehicles);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);

  const drivers = useDriversStore((state) => state.drivers);
  const fetchDrivers = useDriversStore((state) => state.fetchDrivers);

  const assignments = useAssignmentsStore((state) => state.assignments);
  const fetchAssignments = useAssignmentsStore((state) => state.fetchAssignments);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [finishOpen, setFinishOpen] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState('');

  useEffect(() => {
    if (id) fetchTrip(id);
    fetchCompanies();
    fetchVehicles();
    fetchDrivers();
    fetchAssignments();
  }, [id, fetchTrip, fetchCompanies, fetchVehicles, fetchDrivers, fetchAssignments]);

  const trip = selectedTrip?.id === id ? selectedTrip : null;

  const company = useMemo(
    () => (trip ? companies.find((item) => item.id === trip.companyId) : null),
    [companies, trip],
  );

  const assignment = useMemo(
    () => (trip ? assignments.find((item) => item.id === trip.assignmentId) : null),
    [assignments, trip],
  );

  const vehicle = useMemo(
    () => (trip ? vehicles.find((item) => item.id === trip.vehicleId) : null),
    [vehicles, trip],
  );

  const driver = useMemo(
    () => (trip ? drivers.find((item) => item.id === trip.driverId) : null),
    [drivers, trip],
  );

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteTrip(id);
    setIsDeleting(false);

    if (result.success) {
      toast.success('Trajet supprimé.');
      navigate(ROUTES.TRIPS);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer le trajet.');
    }
  };

  const handleFinish = async (values) => {
    if (!id) return;
    setIsFinishing(true);
    setFinishError('');

    const result = await finishTrip(id, values);
    setIsFinishing(false);

    if (result.success) {
      toast.success('Trajet clôturé.');
      setFinishOpen(false);
    } else {
      setFinishError(result.error || 'Impossible de clôturer le trajet.');
    }
  };

  const type = trip ? getTripType(trip.tripType) : null;
  const status = trip ? getTripStatus(trip.status) : null;
  const canFinish = trip && trip.status !== 'completed' && trip.status !== 'cancelled';

  const breadcrumbs = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Trajets', to: ROUTES.TRIPS },
    { label: trip ? trip.tripNumber : '…' },
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>{trip ? `${trip.tripNumber} — Navix Management` : 'Trajet — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title={trip ? trip.tripNumber : 'Trajet'}
        subtitle={trip ? formatTripDateTime(trip.departureDate, trip.departureTime) : undefined}
        icon="bi-signpost-split"
        breadcrumbs={breadcrumbs}
        actions={
          trip ? (
            <div className="d-flex gap-2 flex-wrap">
              <Button variant="outline" icon="bi-pencil" onClick={() => navigate(tripEditPath(trip.id))}>
                Modifier
              </Button>
              {canFinish && (
                <Button variant="success" icon="bi-flag" onClick={() => setFinishOpen(true)}>
                  Clôturer
                </Button>
              )}
              <Button variant="outline" icon="bi-trash3" onClick={() => setDeleteOpen(true)}>
                Supprimer
              </Button>
            </div>
          ) : undefined
        }
      />

      {isLoading && !trip ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner size="lg" label="Chargement du trajet…" />
        </div>
      ) : error || !trip ? (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error || 'Trajet introuvable.'}
        </Alert>
      ) : (
        <>
          <div className="card mb-3">
            <div className="card-body d-flex flex-wrap align-items-center gap-3">
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex flex-wrap gap-2">
                  <TripStatusBadge status={trip.status} />
                  {type && (
                    <Badge variant={type.variant} soft>
                      <i className={`bi ${type.icon} me-1`} aria-hidden="true" />
                      {type.label}
                    </Badge>
                  )}
                  {company && (
                    <Badge variant="dark" soft>
                      {company.name}
                    </Badge>
                  )}
                  {assignment && (
                    <Badge variant="light" soft>
                      {assignment.assignmentNumber}
                    </Badge>
                  )}
                </div>
                <p className="text-secondary mb-0 mt-2">
                  {driver?.fullName ?? '—'} · {vehicle?.registrationNumber ?? '—'}
                </p>
              </div>
              <div className="navix-trip-detail__stats d-flex gap-2 flex-wrap">
                <div className="navix-trip-detail__stat">
                  <span className="navix-trip-detail__stat-icon" aria-hidden="true">
                    <i className="bi bi-speedometer" />
                  </span>
                  <span className="navix-trip-detail__stat-body">
                    <span className="navix-trip-detail__stat-value">
                      {formatTripDistance(trip.actualDistance || trip.plannedDistance)}
                    </span>
                    <span className="navix-trip-detail__stat-label">Distance</span>
                  </span>
                </div>
                <div className="navix-trip-detail__stat">
                  <span className="navix-trip-detail__stat-icon" aria-hidden="true">
                    <i className="bi bi-clock" />
                  </span>
                  <span className="navix-trip-detail__stat-body">
                    <span className="navix-trip-detail__stat-value">
                      {formatTripDuration(trip.actualDuration || trip.estimatedDuration)}
                    </span>
                    <span className="navix-trip-detail__stat-label">Durée</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <TripRouteCard trip={trip} />

          <div className="row g-3 mt-0">
            <div className="col-lg-6">
              <TripVehicleCard vehicle={vehicle} departureMileage={trip.departureMileage} onView={vehicle ? (vehicleId) => navigate(vehicleDetailPath(vehicleId)) : undefined} />
            </div>
            <div className="col-lg-6">
              <TripDriverCard driver={driver} onView={driver ? (driverId) => navigate(driverDetailPath(driverId)) : undefined} />
            </div>
          </div>

          <div className="row g-3 mt-0">
            <div className="col-lg-7">
              <Card title="Informations du trajet">
                <dl className="mb-0">
                  <InfoRow icon="bi-upc-scan" label="Type">
                    {type?.label || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-flag" label="Statut">
                    <Badge variant={status.variant} soft>
                      {status.label}
                    </Badge>
                  </InfoRow>
                  <InfoRow icon="bi-buildings" label="Entreprise">
                    {company?.name || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-shuffle" label="Affectation">
                    {assignment ? (
                      <Button variant="link" className="p-0 navix-trip-detail__link" onClick={() => navigate(assignmentDetailPath(assignment.id))}>
                        {assignment.assignmentNumber}
                      </Button>
                    ) : (
                      '—'
                    )}
                  </InfoRow>
                  <InfoRow icon="bi-question-circle" label="Motif">
                    {trip.purpose || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-people" label="Passagers">
                    {trip.passengerCount ? `${trip.passengerCount}` : '—'}
                  </InfoRow>
                  <InfoRow icon="bi-box-seam" label="Chargement">
                    {trip.cargoWeight ? `${trip.cargoWeight} kg` : '—'}
                  </InfoRow>
                </dl>
              </Card>

              <Card title="Programmation & indicateurs" className="mt-3">
                <dl className="mb-0">
                  <InfoRow icon="bi-geo-alt" label="Départ">
                    {trip.departureLocation || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-geo-alt-fill" label="Arrivée">
                    {trip.arrivalLocation || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-calendar-plus" label="Date de départ">
                    {formatTripDateTime(trip.departureDate, trip.departureTime)}
                  </InfoRow>
                  <InfoRow icon="bi-calendar-check" label="Date d’arrivée">
                    {formatTripDateTime(trip.arrivalDate, trip.arrivalTime)}
                  </InfoRow>
                  <InfoRow icon="bi-signpost-split" label="Distance prévue">
                    {formatTripDistance(trip.plannedDistance)}
                  </InfoRow>
                  {trip.actualDistance ? (
                    <InfoRow icon="bi-signpost-split" label="Distance réelle">
                      {formatTripDistance(trip.actualDistance)}
                    </InfoRow>
                  ) : null}
                  <InfoRow icon="bi-stopwatch" label="Durée prévue">
                    {formatTripDuration(trip.estimatedDuration)}
                  </InfoRow>
                  {trip.actualDuration ? (
                    <InfoRow icon="bi-stopwatch" label="Durée réelle">
                      {formatTripDuration(trip.actualDuration)}
                    </InfoRow>
                  ) : null}
                  {trip.averageSpeed ? (
                    <InfoRow icon="bi-speedometer2" label="Vitesse moyenne">
                      {formatTripSpeed(trip.averageSpeed)}
                    </InfoRow>
                  ) : null}
                  <InfoRow icon="bi-fuel-pump" label="Kilométrage">
                    {formatTripMileage(trip.departureMileage)}
                    {trip.arrivalMileage
                      ? ` → ${formatTripMileage(trip.arrivalMileage)}`
                      : ''}
                  </InfoRow>
                  <InfoRow icon="bi-person-badge" label="Créé par">
                    {trip.createdBy || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-calendar2-event" label="Créé le">
                    {formatTripLongDate(trip.createdAt)}
                  </InfoRow>
                </dl>
              </Card>
            </div>

            <div className="col-lg-5">
              <Card title="Chronologie">
                <TripTimeline trip={trip} />
              </Card>

              <Card title="Notes" className="mt-3">
                <p className="mb-0 text-secondary">{trip.notes || 'Aucune note.'}</p>
              </Card>
            </div>
          </div>

          <DeleteTripModal
            trip={trip}
            open={deleteOpen}
            loading={isDeleting}
            error={deleteError}
            onConfirm={handleDelete}
            onClose={() => {
              setDeleteOpen(false);
              setDeleteError('');
            }}
          />

          <TripFinishModal
            trip={trip}
            open={finishOpen}
            loading={isFinishing}
            error={finishError}
            onSubmit={handleFinish}
            onClose={() => {
              setFinishOpen(false);
              setFinishError('');
            }}
          />
        </>
      )}
    </PageContainer>
  );
};

export default TripDetailsPage;
