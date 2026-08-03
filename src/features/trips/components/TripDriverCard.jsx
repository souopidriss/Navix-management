/**
 * Navix Trips — TripDriverCard
 * --------------------------------------------------------------------------
 * Carte du chauffeur assigné à un trajet (page de détail) : photo, nom
 * complet, code employé, statut, disponibilité et téléphone.
 *
 * Props :
 *   driver : chauffeur à afficher
 *   onView : (id: string) => void — navigation vers le chauffeur
 */
import { Badge, Button } from '@/components/ui';
import { DriverAvatar, DriverStatusBadge } from '@/features/drivers/components';
import { getDriverAvailability } from '@/features/drivers';
import './TripDriverCard.css';

const TripDriverCard = ({ driver, onView }) => {
  const availability = driver ? getDriverAvailability(driver.availability) : null;

  return (
    <article className="card h-100 navix-trip-driver-card">
      <div className="card-body">
        <div className="d-flex align-items-center gap-3 min-w-0">
          <DriverAvatar src={driver?.photo} fullName={driver?.fullName} size="lg" />
          <div className="min-w-0">
            <h3 className="navix-trip-driver-card__name">{driver?.fullName ?? 'Chauffeur'}</h3>
            <p className="navix-trip-driver-card__code mb-0">{driver?.employeeCode ?? '—'}</p>
          </div>
        </div>

        {driver && (
          <div className="navix-trip-driver-card__badges">
            <DriverStatusBadge status={driver.status} />
            {availability && (
              <Badge variant={availability.variant} soft>
                {availability.label}
              </Badge>
            )}
          </div>
        )}

        <dl className="navix-trip-driver-card__meta">
          <div>
            <dt>
              <i className="bi bi-telephone" aria-hidden="true" /> Téléphone
            </dt>
            <dd>{driver?.phone ?? '—'}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-award" aria-hidden="true" /> Expérience
            </dt>
            <dd>{driver?.yearsExperience ?? '—'} ans</dd>
          </div>
        </dl>
      </div>

      {onView && driver && (
        <div className="card-footer">
          <Button variant="ghost" size="sm" icon="bi-box-arrow-up-right" onClick={() => onView(driver.id)}>
            Voir le chauffeur
          </Button>
        </div>
      )}
    </article>
  );
};

export default TripDriverCard;
