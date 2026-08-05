/**
 * Navix Dashboard — TopVehicles
 * --------------------------------------------------------------------------
 * Classement des 5 véhicules les plus utilisés (distance parcourue).
 */
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { StatusBadge } from '@/components/core';
import { vehicleDetailPath } from '@/routes/route.constants';
import { getVehicleGroup } from '@/features/vehicles/constants';
import { formatDashboardDistance } from '../constants';
import './Rankings.css';

const TopVehicles = ({ vehicles = [] }) => (
  <Card title={<span><i className="bi bi-truck me-2" aria-hidden="true" />Top véhicules</span>}>
    {vehicles.length === 0 ? (
      <p className="text-secondary mb-0">Aucune donnée.</p>
    ) : (
      <ol className="navix-dash-rankings">
        {vehicles.map((vehicle, index) => {
          const group = getVehicleGroup(vehicle.group);
          return (
            <li key={vehicle.vehicleId} className="navix-dash-rankings__row">
              <span className="navix-dash-rankings__rank" aria-hidden="true">
                {index + 1}
              </span>
              <Link to={vehicleDetailPath(vehicle.vehicleId)} className="navix-dash-rankings__main">
                <span className="navix-dash-rankings__name">
                  {vehicle.registrationNumber}
                  <span className="navix-dash-rankings__sub">
                    {vehicle.brand} {vehicle.model}
                  </span>
                </span>
                <StatusBadge variant={group.variant} label={group.label} dot={false} size="sm" />
              </Link>
              <span className="navix-dash-rankings__value">
                {formatDashboardDistance(vehicle.distanceKm)}
                <span className="navix-dash-rankings__sub d-block text-end">
                  {vehicle.trips} trajet{vehicle.trips > 1 ? 's' : ''}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    )}
  </Card>
);

export default TopVehicles;
