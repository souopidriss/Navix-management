/**
 * Navix Dashboard — TopDrivers
 * --------------------------------------------------------------------------
 * Classement des 5 chauffeurs les plus actifs (distance parcourue).
 */
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { driverDetailPath } from '@/routes/route.constants';
import { formatDashboardDistance } from '../constants';
import './Rankings.css';

const formatHours = (value) =>
  Number.isFinite(Number(value)) ? `${Math.round(Number(value))} h` : '—';

const TopDrivers = ({ drivers = [] }) => (
  <Card title={<span><i className="bi bi-person-badge me-2" aria-hidden="true" />Top chauffeurs</span>}>
    {drivers.length === 0 ? (
      <p className="text-secondary mb-0">Aucune donnée.</p>
    ) : (
      <ol className="navix-dash-rankings">
        {drivers.map((driver, index) => (
          <li key={driver.driverId} className="navix-dash-rankings__row">
            <span className="navix-dash-rankings__rank" aria-hidden="true">
              {index + 1}
            </span>
            <Link to={driverDetailPath(driver.driverId)} className="navix-dash-rankings__main">
              <span className="navix-dash-rankings__name">
                {driver.fullName}
                <span className="navix-dash-rankings__sub">
                  {formatHours(driver.hoursDriven)} de conduite
                </span>
              </span>
            </Link>
            <span className="navix-dash-rankings__value">
              {formatDashboardDistance(driver.distanceKm)}
              <span className="navix-dash-rankings__sub d-block text-end">
                {driver.trips} trajet{driver.trips > 1 ? 's' : ''}
              </span>
            </span>
          </li>
        ))}
      </ol>
    )}
  </Card>
);

export default TopDrivers;
