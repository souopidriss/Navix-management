/**
 * Navix Trips — TripStatsCards
 * --------------------------------------------------------------------------
 * Cartes de statistiques du module Trajets : total, en cours, prévus et
 * terminés. Les valeurs sont dérivées de la liste chargée.
 *
 * Props :
 *   trips : liste des trajets (source des compteurs)
 */
import { Card } from '@/components/ui';
import './TripStatsCards.css';

const buildStats = (trips = []) => [
  {
    key: 'total',
    label: 'Trajets',
    value: trips.length,
    icon: 'bi-signpost-split',
    variant: 'primary',
  },
  {
    key: 'in_progress',
    label: 'En cours',
    value: trips.filter((trip) => trip.status === 'in_progress').length,
    icon: 'bi-play-circle',
    variant: 'success',
  },
  {
    key: 'planned',
    label: 'Prévus',
    value: trips.filter((trip) => trip.status === 'planned').length,
    icon: 'bi-calendar2-check',
    variant: 'info',
  },
  {
    key: 'completed',
    label: 'Terminés',
    value: trips.filter((trip) => trip.status === 'completed').length,
    icon: 'bi-check2-circle',
    variant: 'warning',
  },
];

const TripStatsCards = ({ trips = [] }) => (
  <div className="row g-3 navix-trip-stats">
    {buildStats(trips).map((stat) => (
      <div key={stat.key} className="col-6 col-lg-3">
        <Card className="navix-trip-stat">
          <span className={`navix-trip-stat__icon navix-trip-stat__icon--${stat.variant}`} aria-hidden="true">
            <i className={`bi ${stat.icon}`} />
          </span>
          <span className="navix-trip-stat__body">
            <span className="navix-trip-stat__value">{stat.value}</span>
            <span className="navix-trip-stat__label">{stat.label}</span>
          </span>
        </Card>
      </div>
    ))}
  </div>
);

export default TripStatsCards;
