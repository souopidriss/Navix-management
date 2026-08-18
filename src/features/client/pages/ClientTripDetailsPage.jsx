import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  LoadingState,
  ErrorState,
  StatusBadge,
  ConfirmDialog,
} from '@/components/core';
import {
  getTripType,
  getTripStatus,
  formatTripDate,
  formatTripDateTime,
  formatTripDistance,
  formatTripMileage,
  formatTripDuration,
  formatTripSpeed,
} from '@/features/trips/constants';
import { getDriverStatus } from '@/features/drivers/constants';
import { getVehicleStatus } from '@/features/vehicles/constants';
import { ROUTES, clientTripDetailPath } from '@/routes/route.constants';
import { useClientData } from '../hooks/useClientData';
import { useClientTrip } from '../hooks/useClientTrip';
import { useClientVehicles } from '../hooks/useClientVehicles';
import { useClientDrivers } from '../hooks/useClientDrivers';
import { useClientAssignments } from '../hooks/useClientAssignments';
import { useClientTrips } from '../hooks/useClientTrips';
import { getNextTripStatuses } from '../services/clientOperationsData';import ClientTripFinishModal from '../components/ClientOperations/ClientTripFinishModal';
import ClientTripTimeline from '../components/ClientOperations/ClientTripTimeline';
import '../components/ClientOperations/ClientOperations.css';

const DetailItem = ({ icon, label, value, mono }) => (
  <div className="navix-ops-detail-item">
    <div className="navix-ops-detail-item__label">
      <i className={`bi ${icon}`} aria-hidden="true" />
      {label}
    </div>
    <div className={`navix-ops-detail-item__value ${mono ? 'font-monospace' : ''}`}>{value}</div>
  </div>
);

const ClientTripDetailsPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { isEnterprise } = useClientData();
  const { trip, isLoading, error, refetch } = useClientTrip(tripId);
  const { vehicles } = useClientVehicles();
  const { drivers } = useClientDrivers();
  const { assignments, refetch: refetchAssignments } = useClientAssignments();
  const { refetch: refetchTrips, startTrip, finishTrip, cancelTrip } = useClientTrips();

  const [finishOpen, setFinishOpen] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState('');

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement du trajet…" />
      </PageContainer>
    );
  }

  if (error || !trip) {
    return (
      <PageContainer>
        <ErrorState
          title="Trajet introuvable"
          description={error || 'Ce trajet n’existe pas ou a été supprimé.'}
          retry={refetch}
        />
      </PageContainer>
    );
  }

  const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
  const driver = drivers.find((d) => d.id === trip.driverId);
  const assignment = assignments.find((a) => a.id === trip.assignmentId);

  const status = getTripStatus(trip.status);
  const type = getTripType(trip.tripType);
  const vehicleStatus = vehicle ? getVehicleStatus(vehicle.status) : null;
  const driverStatus = driver ? getDriverStatus(driver.status) : null;

  const canStart = getNextTripStatuses(trip.status).includes('in_progress');
  const canFinish = getNextTripStatuses(trip.status).includes('completed');
  const canCancel = getNextTripStatuses(trip.status).includes('cancelled');

  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchAssignments(), refetchTrips()]);
    toast.success('Trajet actualisé.');
  };

  const handleStart = async () => {
    try {
      await startTrip(trip.id, { departureMileage: trip.departureMileage });
      toast.success('Trajet démarré. Chauffeur et véhicule en service.');
      await handleRefresh();
    } catch (err) {
      toast.error(err?.message || 'Impossible de démarrer le trajet.');
    }
  };

  const handleFinish = async (payload) => {
    setIsFinishing(true);
    setFinishError('');
    try {
      await finishTrip(trip.id, payload);
      toast.success('Trajet terminé. Véhicule et chauffeur libérés.');
      setFinishOpen(false);
      await handleRefresh();
    } catch (err) {
      setFinishError(err?.message || 'Impossible de terminer le trajet.');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    setCancelError('');
    try {
      await cancelTrip(trip.id, { reason: cancelReason });
      toast.success('Trajet annulé.');
      setCancelOpen(false);
      setCancelReason('');
      await handleRefresh();
    } catch (err) {
      setCancelError(err?.message || 'Impossible d’annuler le trajet.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <PageContainer>
      <Helmet>
        <title>{trip.tripNumber} — Navix Client</title>
      </Helmet>

      <PageHeader
        title={trip.tripNumber}
        subtitle={`${trip.departureLocation || '—'} → ${trip.arrivalLocation || '—'} · ${formatTripDate(trip.departureDate)}`}
        icon="bi-signpost-split"
        breadcrumbs={[
          { label: 'Espace Client', to: ROUTES.CLIENT_DASHBOARD },
          { label: 'Mes trajets', to: ROUTES.CLIENT_TRIPS },
          { label: trip.tripNumber, to: clientTripDetailPath(trip.id) },
        ]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" icon="bi-arrow-left" onClick={() => navigate(ROUTES.CLIENT_TRIPS)}>
              Retour
            </Button>
            {canStart && (
              <Button variant="primary" size="sm" icon="bi-play-fill" onClick={handleStart}>
                Démarrer le trajet
              </Button>
            )}
            {canFinish && (
              <Button variant="success" size="sm" icon="bi-flag-fill" onClick={() => setFinishOpen(true)}>
                Terminer le trajet
              </Button>
            )}
            {canCancel && (
              <Button variant="danger" outline size="sm" icon="bi-x-octagon" onClick={() => setCancelOpen(true)}>
                Annuler
              </Button>
            )}
            <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={handleRefresh} aria-label="Actualiser">
              <span className="visually-hidden">Actualiser</span>
            </Button>
          </div>
        }
      />

      {!isEnterprise ? (
        <ErrorState
          title="Trajet non disponible"
          description="Le suivi des trajets n’est pas disponible pour un client particulier."
        />
      ) : (
        <>
          <div className="navix-ops-identity mb-4">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="navix-ops-identity__logo" aria-hidden="true">
                <i className={`bi ${type.icon}`} />
              </div>
              <div className="flex-grow-1 min-w-0">
                <h5 className="mb-1 fw-bold text-body-emphasis">
                  {type.label} · {trip.purpose || 'Sans motif'}
                </h5>
                <div className="d-flex gap-2 flex-wrap">
                  <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />
                  <span className="badge bg-secondary-subtle text-body">
                    <i className="bi bi-signpost-split me-1" aria-hidden="true" />
                    {trip.tripType}
                  </span>
                </div>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <span className="badge bg-body-secondary px-3 py-2">
                  🇨🇲 {trip.departureLocation || '—'} → {trip.arrivalLocation || '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-lg-8">
              <div className="navix-ops-panel mb-3">
                <h6 className="navix-ops-panel__title">
                  <i className="bi bi-signpost-split" aria-hidden="true" />
                  Détails du trajet
                </h6>
                <div className="navix-ops-detail-grid">
                  <DetailItem icon="bi-pencil-square" label="Motif" value={trip.purpose || '—'} />
                  <DetailItem icon="bi-calendar" label="Départ" value={formatTripDateTime(trip.departureDate, trip.departureTime)} />
                  <DetailItem icon="bi-calendar-check" label="Arrivée" value={formatTripDateTime(trip.arrivalDate, trip.arrivalTime)} />
                  <DetailItem icon="bi-rulers" label="Distance prévue" value={formatTripDistance(trip.plannedDistance)} />
                  <DetailItem icon="bi-rulers" label="Distance réelle" value={formatTripDistance(trip.actualDistance)} />
                  <DetailItem icon="bi-hourglass-split" label="Durée" value={formatTripDuration(trip.actualDuration || trip.estimatedDuration)} />
                  <DetailItem icon="bi-speedometer2" label="Vitesse moyenne" value={formatTripSpeed(trip.averageSpeed)} />
                  <DetailItem icon="bi-sign-turn-left" label="Km au départ" value={formatTripMileage(trip.departureMileage)} />
                  <DetailItem icon="bi-sign-turn-right" label="Km à l’arrivée" value={formatTripMileage(trip.arrivalMileage)} />
                  <DetailItem icon="bi-people" label="Passagers" value={trip.passengerCount || '—'} />
                  <DetailItem icon="bi-box" label="Chargement" value={trip.cargoWeight ? `${trip.cargoWeight} kg` : '—'} />
                  <DetailItem icon="bi-journal-text" label="Notes" value={trip.notes || '—'} />
                </div>
              </div>

              <div className="navix-ops-panel">
                <h6 className="navix-ops-panel__title">
                  <i className="bi bi-clock-history" aria-hidden="true" />
                  Historique
                </h6>
                <ClientTripTimeline events={trip.events || []} />
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="navix-ops-panel mb-3">
                <h6 className="navix-ops-panel__title">
                  <i className="bi bi-truck" aria-hidden="true" />
                  Véhicule
                </h6>
                {vehicle ? (
                  <>
                    <p className="mb-2 fw-semibold">
                      {vehicle.brand} {vehicle.model}
                      <span className="text-secondary fw-normal d-block small">{vehicle.registrationNumber}</span>
                    </p>
                    {vehicleStatus && (
                      <StatusBadge variant={vehicleStatus.variant} label={vehicleStatus.label} icon={vehicleStatus.icon} />
                    )}
                  </>
                ) : (
                  <p className="text-secondary small mb-0">Véhicule non renseigné.</p>
                )}
              </div>

              <div className="navix-ops-panel mb-3">
                <h6 className="navix-ops-panel__title">
                  <i className="bi bi-person-badge" aria-hidden="true" />
                  Chauffeur
                </h6>
                {driver ? (
                  <>
                    <p className="mb-2 fw-semibold">
                      {driver.fullName}
                      <span className="text-secondary fw-normal d-block small">{driver.employeeCode}</span>
                    </p>
                    {driverStatus && (
                      <StatusBadge variant={driverStatus.variant} label={driverStatus.label} icon={driverStatus.icon} />
                    )}
                  </>
                ) : (
                  <p className="text-secondary small mb-0">Chauffeur non renseigné.</p>
                )}
              </div>

              <div className="navix-ops-panel">
                <h6 className="navix-ops-panel__title">
                  <i className="bi bi-link-45deg" aria-hidden="true" />
                  Affectation liée
                </h6>
                {assignment ? (
                  <>
                    <p className="mb-1 fw-semibold font-monospace">{assignment.assignmentNumber}</p>
                    <small className="text-secondary d-block">
                      {assignment.startDate || '—'} → {assignment.endDate || 'en cours'}
                    </small>
                  </>
                ) : (
                  <p className="text-secondary small mb-0">Aucune affectation liée.</p>
                )}
              </div>
            </div>
          </div>

          <ClientTripFinishModal
            open={finishOpen}
            onClose={() => setFinishOpen(false)}
            trip={trip}
            onSubmit={handleFinish}
            loading={isFinishing}
            error={finishError}
          />

          <ConfirmDialog
            open={cancelOpen}
            onClose={() => setCancelOpen(false)}
            title="Annuler ce trajet"
            icon="bi-x-octagon"
            confirmLabel="Annuler le trajet"
            confirmVariant="danger"
            loading={isCancelling}
            error={cancelError}
            onConfirm={handleCancel}
            message={
              <>
                <p className="mb-3">
                  Vous êtes sur le point d’annuler le trajet{' '}
                  <strong className="font-monospace">{trip.tripNumber}</strong>.
                </p>
                <div>
                  <label className="form-label" htmlFor="client-trip-detail-cancel-reason">
                    Motif d’annulation
                  </label>
                  <textarea
                    id="client-trip-detail-cancel-reason"
                    className="form-control"
                    rows={3}
                    value={cancelReason}
                    onChange={(event) => setCancelReason(event.target.value)}
                    placeholder="Raison de l’annulation…"
                  />
                </div>
              </>
            }
          />
        </>
      )}
    </PageContainer>
  );
};

export default ClientTripDetailsPage;
