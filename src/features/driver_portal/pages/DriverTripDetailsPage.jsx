/**
 * Navix Driver — DriverTripDetailsPage
 * --------------------------------------------------------------------------
 * Détail d'un trajet du chauffeur : itinéraire, horaires, kilométrages,
 * durée, passagers, chargement, notes — enrichi du workflow opérationnel
 * (démarrer / pause / reprise / terminer / signaler un incident) et du
 * bilan d'un trajet terminé.
 */
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { formatDate, formatTime, formatNumber } from '@/utils/format';
import { Button } from '@/components/ui';
import { ROUTES } from '@/routes/route.constants';
import {
  PageContainer,
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  StatusBadge,
} from '@/components/core';
import { usePermission } from '@/features/rbac/hooks';
import {
  getDriverTripStatus,
  getDriverTripType,
  isDriverTripActive,
} from '../constants/driver.constants';
import { useDriverTripDetails } from '../hooks/useDriverTrips';
import { useDriverTripWorkflow } from '../hooks/useDriverTripWorkflow';
import TripWorkflowTimeline from '../components/DriverTrips/TripWorkflowTimeline';
import TripSummaryCard from '../components/DriverTrips/TripSummaryCard';
import TripWorkflowModals from '../components/DriverTrips/TripWorkflowModals';
import './DriverPortal.css';

const InfoRow = ({ label, value, icon }) => (
  <div className="d-flex align-items-center gap-3 py-2 border-bottom border-secondary-subtle">
    <span className="text-muted d-flex align-items-center gap-2" style={{ width: '11rem', flexShrink: 0 }}>
      {icon && <i className={`bi ${icon}`} aria-hidden="true" />}
      <span className="small">{label}</span>
    </span>
    <span className="fw-medium">{value || '—'}</span>
  </div>
);

const DriverTripDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: trip, isLoading, error, refetch } = useDriverTripDetails(id);
  const workflow = useDriverTripWorkflow();

  const canTripUpdate = usePermission('trips.update');
  const canReportIncident = usePermission('incidents.create');

  const handlePause = async (currentTrip) => {
    const result = await workflow.submitPause(currentTrip.id);
    if (result.success) {
      toast.success(result.message);
      refetch();
    }
  };

  const handleResume = async (currentTrip) => {
    const result = await workflow.submitResume(currentTrip.id);
    if (result.success) {
      toast.success(result.message);
      refetch();
    }
  };

  if (isLoading && !trip) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement du trajet…" />
      </PageContainer>
    );
  }

  if (error && !trip) {
    return (
      <PageContainer>
        <ErrorState
          title="Détail indisponible"
          description="Impossible de charger les informations de ce trajet."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  if (!trip) {
    return (
      <PageContainer>
        <EmptyState
          icon="bi-signpost-split"
          title="Trajet introuvable"
          description="Ce trajet n\u2019existe pas ou ne vous est pas assigné."
          action={
            <Button variant="outline" icon="bi-arrow-left" onClick={() => navigate(-1)}>
              Retour
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const status = getDriverTripStatus(trip.status);
  const type = getDriverTripType(trip.type);

  const breadcrumbs = [
    { label: 'Espace Chauffeur' },
    { label: 'Mes trajets', to: ROUTES.DRIVER_TRIPS },
    { label: trip.tripNumber },
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>Trajet {trip.tripNumber} — Navix Management</title>
      </Helmet>

      <PageHeader
        title={`Trajet ${trip.tripNumber}`}
        subtitle={trip.purpose}
        icon="bi-signpost-split"
        breadcrumbs={breadcrumbs}
        actions={
          <Button variant="outline" size="sm" icon="bi-arrow-left" onClick={() => navigate(ROUTES.DRIVER_TRIPS)}>
            Retour
          </Button>
        }
      />

      {/* ── Itinéraire ─────────────────────────────────────────────────── */}
      <div className="navix-card p-4 mb-4">
        <div className="d-flex flex-wrap align-items-start gap-3 mb-3">
          <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />
          <StatusBadge variant={type.variant} label={type.label} icon={type.icon} dot={false} />
        </div>

        <div className="row align-items-center g-4">
          <div className="col-lg-5">
            <div className="d-flex align-items-center gap-3">
              <span className="navix-detail-marker bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center">
                <i className="bi bi-geo-alt" aria-hidden="true" />
              </span>
              <div>
                <div className="fw-bold fs-5">{trip.departure}</div>
                <div className="text-muted small">{trip.departureLocation}</div>
              </div>
            </div>
          </div>

          <div className="col-lg-2 text-center">
            <div className="text-muted small text-uppercase fw-semibold">
              {formatNumber(trip.plannedDistance)} km
            </div>
            <div className="d-flex align-items-center justify-content-center gap-1 my-1 text-primary">
              <i className="bi bi-circle-fill" style={{ fontSize: '0.4rem' }} aria-hidden="true" />
              <i className="bi bi-arrow-right" aria-hidden="true" />
              <i className="bi bi-circle" style={{ fontSize: '0.4rem' }} aria-hidden="true" />
            </div>
            <div className="text-muted small">
              {trip.estimatedDuration ? `≈ ${formatNumber(Math.round(trip.estimatedDuration / 60))} h` : ''}
            </div>
          </div>

          <div className="col-lg-5">
            <div className="d-flex align-items-center gap-3 justify-content-lg-end">
              <div className="text-lg-end">
                <div className="fw-bold fs-5">{trip.arrival}</div>
                <div className="text-muted small">{trip.arrivalLocation}</div>
              </div>
              <span className="navix-detail-marker bg-secondary text-white rounded-circle d-inline-flex align-items-center justify-content-center">
                <i className="bi bi-flag" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Workflow : actions & progression ──────────────────────────── */}
      {(() => {
        const isActive = isDriverTripActive(trip);
        const showActions =
          (workflow.canStart(trip) && canTripUpdate) || (isActive && (canTripUpdate || canReportIncident));

        return (
          <div className="row g-3 mb-4">
            {showActions && (
              <div className="col-lg-5">
                <div className="navix-card p-4 h-100">
                  <h2 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
                    <i className="bi bi-lightning-charge text-primary" aria-hidden="true" />
                    Actions
                  </h2>
                  <div className="d-flex flex-wrap gap-2">
                    {workflow.canStart(trip) && canTripUpdate && (
                      <Button
                        variant="primary"
                        icon="bi-play-fill"
                        onClick={() => workflow.startTrip(trip.id)}
                        disabled={workflow.isSubmitting}
                      >
                        Démarrer le trajet
                      </Button>
                    )}
                    {isActive && workflow.canPause(trip) && canTripUpdate && (
                      <Button
                        variant="warning"
                        outline
                        icon="bi-pause-fill"
                        onClick={() => handlePause(trip)}
                        loading={workflow.isSubmitting}
                      >
                        Mettre en pause
                      </Button>
                    )}
                    {isActive && workflow.canResume(trip) && canTripUpdate && (
                      <Button
                        variant="primary"
                        icon="bi-play-fill"
                        onClick={() => handleResume(trip)}
                        loading={workflow.isSubmitting}
                      >
                        Reprendre le trajet
                      </Button>
                    )}
                    {isActive && workflow.canComplete(trip) && canTripUpdate && (
                      <Button
                        variant="success"
                        icon="bi-check2-circle"
                        onClick={() => workflow.openComplete(trip)}
                        disabled={workflow.isSubmitting}
                      >
                        Terminer le trajet
                      </Button>
                    )}
                    {isActive && canReportIncident && (
                      <Button
                        variant="danger"
                        outline
                        icon="bi-shield-exclamation"
                        onClick={() => workflow.openIncident(trip)}
                        disabled={workflow.isSubmitting}
                      >
                        Signaler un incident
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className={showActions ? 'col-lg-7' : 'col-12'}>
              <div className="navix-card p-4 h-100">
                <h2 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-diagram-3 text-primary" aria-hidden="true" />
                  Déroulement du trajet
                </h2>
                <TripWorkflowTimeline trip={trip} />
              </div>
            </div>
          </div>
        );
      })()}

      {trip.status === 'completed' && <TripSummaryCard trip={trip} />}

      {/* ── Détails ────────────────────────────────────────────────────── */}
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="navix-card p-4 h-100">
            <h2 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
              <i className="bi bi-clock-history text-primary" aria-hidden="true" />
              Horaires & durée
            </h2>
            <InfoRow
              icon="bi-calendar2"
              label="Date de départ"
              value={trip.departureDate ? formatDate(trip.departureDate) : '—'}
            />
            <InfoRow
              icon="bi-clock"
              label="Heure de départ"
              value={trip.departureTime ? formatTime(trip.departureTime) : '—'}
            />
            <InfoRow
              icon="bi-calendar2-check"
              label="Date d\u2019arrivée"
              value={trip.arrivalDate ? formatDate(trip.arrivalDate) : '—'}
            />
            <InfoRow
              icon="bi-clock-history"
              label="Heure d\u2019arrivée"
              value={trip.arrivalTime ? formatTime(trip.arrivalTime) : '—'}
            />
            <InfoRow
              icon="bi-hourglass-split"
              label="Durée estimée"
              value={trip.estimatedDuration ? `${formatNumber(Math.round(trip.estimatedDuration / 60))} h` : '—'}
            />
            <InfoRow
              icon="bi-speedometer2"
              label="Vitesse moyenne"
              value={trip.averageSpeed ? `${formatNumber(trip.averageSpeed)} km/h` : '—'}
            />
          </div>
        </div>

        <div className="col-lg-6">
          <div className="navix-card p-4 h-100">
            <h2 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
              <i className="bi bi-truck text-primary" aria-hidden="true" />
              Trajet & chargement
            </h2>
            <InfoRow
              icon="bi-speedometer"
              label="Kilométrage départ"
              value={trip.departureMileage ? `${formatNumber(trip.departureMileage)} km` : '—'}
            />
            <InfoRow
              icon="bi-speedometer2"
              label="Kilométrage arrivée"
              value={trip.arrivalMileage ? `${formatNumber(trip.arrivalMileage)} km` : '—'}
            />
            <InfoRow
              icon="bi-signpost-split"
              label="Distance planifiée"
              value={trip.plannedDistance ? `${formatNumber(trip.plannedDistance)} km` : '—'}
            />
            <InfoRow
              icon="bi-signpost-2"
              label="Distance réelle"
              value={trip.actualDistance ? `${formatNumber(trip.actualDistance)} km` : '—'}
            />
            <InfoRow
              icon="bi-people"
              label="Passagers"
              value={trip.passengerCount ? formatNumber(trip.passengerCount) : '—'}
            />
            <InfoRow
              icon="bi-box-seam"
              label="Chargement"
              value={trip.cargoWeight ? `${formatNumber(trip.cargoWeight)} kg` : '—'}
            />
          </div>
        </div>

        {trip.notes && (
          <div className="col-12">
            <div className="navix-card p-4">
              <h2 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
                <i className="bi bi-card-text text-primary" aria-hidden="true" />
                Notes
              </h2>
              <p className="mb-0 text-secondary">{trip.notes}</p>
            </div>
          </div>
        )}
      </div>

      <TripWorkflowModals workflow={workflow} onSuccess={refetch} />
    </PageContainer>
  );
};

export default DriverTripDetailsPage;
