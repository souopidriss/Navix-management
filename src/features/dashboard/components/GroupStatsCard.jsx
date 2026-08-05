/**
 * Navix Dashboard — GroupStatsCard
 * --------------------------------------------------------------------------
 * Répartition du parc par groupe officiel (A → G) avec barres horizontales,
 * compteurs et taux d'utilisation par groupe.
 */
import { Card } from '@/components/ui';
import './GroupStatsCard.css';

const GroupStatsCard = ({ byGroup = [] }) => {
  const maxTotal = Math.max(...byGroup.map((group) => Number(group.total || 0)), 1);

  return (
    <Card title={<span><i className="bi bi-grid me-2" aria-hidden="true" />Répartition par groupe</span>}>
      {byGroup.length === 0 ? (
        <p className="text-secondary mb-0">Aucune donnée.</p>
      ) : (
        <div className="navix-dash-groups">
          {byGroup.map(({ group, label, icon, variant, total, available, inUse, maintenance, outOfService }) => (
            <div key={group} className="navix-dash-groups__row">
              <div className="navix-dash-groups__head">
                <span className={`navix-dash-groups__badge navix-dash-groups__badge--${variant}`}>
                  <i className={`bi ${icon}`} aria-hidden="true" />
                </span>
                <span className="navix-dash-groups__name">
                  {label}
                  <span className="navix-dash-groups__meta">
                    {available} dispo · {inUse} en mission · {maintenance} en maint. · {outOfService} hors service
                  </span>
                </span>
                <span className="navix-dash-groups__count">{total}</span>
              </div>
              <div
                className="progress navix-dash-groups__progress"
                role="progressbar"
                aria-valuenow={total}
                aria-valuemin="0"
                aria-valuemax={maxTotal}
                aria-label={`${label} : ${total} véhicules`}
              >
                <div
                  className={`progress-bar bg-${variant === 'dark' ? 'secondary' : variant}`}
                  style={{ width: `${Math.max((total / maxTotal) * 100, 3)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default GroupStatsCard;
