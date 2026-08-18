/**
 * Navix Client Dashboard — ClientFleetCategoriesCard
 * --------------------------------------------------------------------------
 * Répartition de la flotte par groupe (Motos, V. légers, Utilitaires,
 * Camions, Engins, Bus, V. spéciaux). Réutilise les groupes du module
 * Véhicules (libellés + icônes) et le langage visuel du Dashboard Master.
 */
import { Card } from '@/components/ui';
import { VEHICLE_GROUPS } from '@/features/vehicles/constants';
import './ClientDashboard.css';

const ClientFleetCategoriesCard = ({ categories = [], total = 0 }) => {
  const resolvedTotal = total || categories.reduce((sum, cat) => sum + (cat.count || 0), 0);

  return (
    <Card
      className="h-100"
      title={
        <span className="d-flex align-items-center gap-2">
          <i className="bi bi-pie-chart text-accent" aria-hidden="true" />
          <span>Répartition de la flotte</span>
        </span>
      }
    >
      {categories.length === 0 ? (
        <p className="text-secondary mb-0 py-3 text-center">
          <i className="bi bi-truck me-1" aria-hidden="true" />
          Aucune donnée de flotte.
        </p>
      ) : (
        <ul className="navix-client-categories list-unstyled mb-0">
          {categories.map((cat) => {
            const group = VEHICLE_GROUPS[cat.group] || { label: cat.label, variant: 'secondary', icon: 'bi-truck' };
            const percent = resolvedTotal > 0 ? Math.round((cat.count / resolvedTotal) * 100) : 0;
            return (
              <li key={cat.group || cat.label} className="navix-client-category">
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <span className="d-flex align-items-center gap-2">
                    <i className={`bi ${group.icon} text-muted`} aria-hidden="true" />
                    <span className="small fw-semibold">{group.label}</span>
                  </span>
                  <span className="navix-client-category__count">
                    {cat.count} <span className="text-muted">({percent} %)</span>
                  </span>
                </div>
                <div
                  className="progress navix-client-category__progress"
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={`${group.label} : ${percent} % de la flotte`}
                >
                  <div className={`progress-bar bg-${group.variant === 'primary' ? 'primary' : group.variant}`} style={{ width: `${Math.max(percent, 3)}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default ClientFleetCategoriesCard;
