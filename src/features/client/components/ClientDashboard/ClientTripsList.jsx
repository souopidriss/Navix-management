/**
 * Navix Client Dashboard — ClientTripsList
 * --------------------------------------------------------------------------
 * Liste premium des trajets (en cours / prochains) : chauffeur, véhicule +
 * immatriculation, itinéraire (départ → destination), heure de départ et
 * statut. Lié à la page Trajets via un lien optionnel de pied de carte.
 */
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { StatusBadge } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import './ClientDashboard.css';

const TRIP_STATUS_META = {
  in_progress: { label: 'En cours', variant: 'success', icon: 'bi-play-circle' },
  scheduled: { label: 'Planifié', variant: 'info', icon: 'bi-calendar2-week' },
  completed: { label: 'Terminé', variant: 'secondary', icon: 'bi-check-circle' },
};

const ClientTripsList = ({ title = 'Trajets', icon = 'bi-signpost-split', items = [], showAll = false }) => {
  const statusMeta = (status) => TRIP_STATUS_META[status] || TRIP_STATUS_META.scheduled;

  return (
    <Card
      className="h-100"
      title={
        <span className="d-flex align-items-center gap-2">
          <i className={`bi ${icon} text-primary`} aria-hidden="true" />
          <span>{title}</span>
          {items.length > 0 && <span className="badge bg-primary-subtle text-primary ms-1">{items.length}</span>}
        </span>
      }
      footer={
        showAll ? (
          <Link to={ROUTES.CLIENT_TRIPS} className="btn btn-sm btn-outline-primary w-100">
            Voir tous les trajets
            <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
          </Link>
        ) : null
      }
    >
      {items.length === 0 ? (
        <p className="text-secondary mb-0 py-3 text-center">
          <i className="bi bi-signpost-split me-1" aria-hidden="true" />
          Aucun trajet pour le moment.
        </p>
      ) : (
        <ul className="navix-client-trips list-unstyled mb-0">
          {items.map((trip) => {
            const meta = statusMeta(trip.status);
            return (
              <li key={trip.id} className="navix-client-trip">
                <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                  <span className="navix-client-trip__vehicle">
                    {trip.vehicle}
                    <span className="font-monospace text-muted ms-2">{trip.registrationNumber}</span>
                  </span>
                  <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} />
                </div>

                <div className="navix-client-trip__route">
                  <span className="navix-client-trip__city">{trip.departure}</span>
                  <span className="navix-client-trip__track" aria-hidden="true">
                    <i className="bi bi-arrow-right" />
                  </span>
                  <span className="navix-client-trip__city">{trip.destination}</span>
                </div>

                <div className="d-flex align-items-center justify-content-between text-muted small mt-1">
                  <span className="d-flex align-items-center gap-1">
                    <i className="bi bi-person" aria-hidden="true" />
                    {trip.driver}
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <i className="bi bi-clock" aria-hidden="true" />
                    {trip.departureTime}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default ClientTripsList;
