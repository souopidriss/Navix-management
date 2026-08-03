/**
 * Navix Vehicles — VehicleStatsCards
 * --------------------------------------------------------------------------
 * Cartes de statistiques du module Véhicules : parc total, disponibles,
 * en mission et en maintenance. Les valeurs sont dérivées de la liste chargée.
 *
 * Props :
 *   vehicles : liste des véhicules (source des compteurs)
 */
import { Card } from '@/components/ui';
import './VehicleStatsCards.css';

const buildStats = (vehicles = []) => [
  {
    key: 'total',
    label: 'Parc total',
    value: vehicles.length,
    icon: 'bi-truck',
    variant: 'primary',
  },
  {
    key: 'available',
    label: 'Disponibles',
    value: vehicles.filter((vehicle) => vehicle.status === 'available').length,
    icon: 'bi-check-circle',
    variant: 'success',
  },
  {
    key: 'in_use',
    label: 'En mission',
    value: vehicles.filter((vehicle) => vehicle.status === 'in_use').length,
    icon: 'bi-play-circle',
    variant: 'info',
  },
  {
    key: 'maintenance',
    label: 'En maintenance',
    value: vehicles.filter((vehicle) => vehicle.status === 'maintenance').length,
    icon: 'bi-wrench-adjustable',
    variant: 'warning',
  },
];

const VehicleStatsCards = ({ vehicles = [] }) => (
  <div className="row g-3 navix-vehicle-stats">
    {buildStats(vehicles).map((stat) => (
      <div key={stat.key} className="col-6 col-lg-3">
        <Card className="navix-vehicle-stat">
          <span className={`navix-vehicle-stat__icon navix-vehicle-stat__icon--${stat.variant}`} aria-hidden="true">
            <i className={`bi ${stat.icon}`} />
          </span>
          <span className="navix-vehicle-stat__body">
            <span className="navix-vehicle-stat__value">{stat.value}</span>
            <span className="navix-vehicle-stat__label">{stat.label}</span>
          </span>
        </Card>
      </div>
    ))}
  </div>
);

export default VehicleStatsCards;
