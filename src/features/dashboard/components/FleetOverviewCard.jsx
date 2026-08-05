/**
 * Navix Dashboard — FleetOverviewCard
 * --------------------------------------------------------------------------
 * Synthèse de la flotte : compteurs par statut (badges) et taux de
 * disponibilité / d'utilisation (barres de progression).
 */
import { Card } from '@/components/ui';
import { StatusBadge } from '@/components/core';
import { VEHICLE_STATUSES } from '@/features/vehicles/constants';
import { formatDashboardRate } from '../constants';
import './FleetOverviewCard.css';

const STATUS_ORDER = ['available', 'in_use', 'maintenance', 'out_of_service'];

const FleetOverviewCard = ({ fleet = {} }) => {
  const total = Number(fleet.total || 0);
  const statuses = STATUS_ORDER.map((status) => {
    const meta = VEHICLE_STATUSES[status] || { label: status, variant: 'secondary', icon: 'bi-circle' };
    const count = Number(fleet[status] || 0);
    return { status, ...meta, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 };
  });

  return (
    <Card title={<span><i className="bi bi-truck me-2" aria-hidden="true" />État de la flotte</span>}>
      <div className="navix-dash-fleet">
        {statuses.map(({ status, label, variant, icon, count, percent }) => (
          <div key={status} className="navix-dash-fleet__row">
            <div className="d-flex align-items-center justify-content-between gap-2">
              <StatusBadge variant={variant} label={label} icon={icon} />
              <span className="navix-dash-fleet__count">
                {count} <span className="navix-dash-fleet__percent">({percent} %)</span>
              </span>
            </div>
            <div
              className="progress navix-dash-fleet__progress"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label={`${label} : ${percent} %`}
            >
              <div
                className={`progress-bar bg-${variant === 'primary' ? 'primary' : variant}`}
                style={{ width: `${Math.max(percent, 2)}%` }}
              />
            </div>
          </div>
        ))}

        <div className="navix-dash-fleet__rates row g-3 mt-1">
          <div className="col-6">
            <div className="navix-dash-fleet__rate">
              <span className="navix-dash-fleet__rate-label">Disponibilité</span>
              <span className="navix-dash-fleet__rate-value text-success">
                {formatDashboardRate(fleet.availabilityRate)}
              </span>
            </div>
          </div>
          <div className="col-6">
            <div className="navix-dash-fleet__rate">
              <span className="navix-dash-fleet__rate-label">Utilisation</span>
              <span className="navix-dash-fleet__rate-value text-info">
                {formatDashboardRate(fleet.utilizationRate)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FleetOverviewCard;
