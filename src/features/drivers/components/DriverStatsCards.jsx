/**
 * Navix Drivers — DriverStatsCards
 * --------------------------------------------------------------------------
 * Cartes de statistiques du module Chauffeurs : effectif total, actifs,
 * en mission et disponibles. Les valeurs sont dérivées de la liste chargée.
 *
 * Props :
 *   drivers : liste des chauffeurs (source des compteurs)
 */
import { Card } from '@/components/ui';
import './DriverStatsCards.css';

const buildStats = (drivers = []) => [
  {
    key: 'total',
    label: 'Effectif total',
    value: drivers.length,
    icon: 'bi-people',
    variant: 'primary',
  },
  {
    key: 'active',
    label: 'Actifs',
    value: drivers.filter((driver) => driver.status === 'active').length,
    icon: 'bi-check-circle',
    variant: 'success',
  },
  {
    key: 'on_mission',
    label: 'En mission',
    value: drivers.filter((driver) => driver.status === 'on_mission').length,
    icon: 'bi-play-circle',
    variant: 'info',
  },
  {
    key: 'available',
    label: 'Disponibles',
    value: drivers.filter((driver) => driver.availability === 'available').length,
    icon: 'bi-person-check',
    variant: 'warning',
  },
];

const DriverStatsCards = ({ drivers = [] }) => (
  <div className="row g-3 navix-driver-stats">
    {buildStats(drivers).map((stat) => (
      <div key={stat.key} className="col-6 col-lg-3">
        <Card className="navix-driver-stat">
          <span className={`navix-driver-stat__icon navix-driver-stat__icon--${stat.variant}`} aria-hidden="true">
            <i className={`bi ${stat.icon}`} />
          </span>
          <span className="navix-driver-stat__body">
            <span className="navix-driver-stat__value">{stat.value}</span>
            <span className="navix-driver-stat__label">{stat.label}</span>
          </span>
        </Card>
      </div>
    ))}
  </div>
);

export default DriverStatsCards;
