/**
 * Navix Client Dashboard — ClientMaintenanceCard
 * --------------------------------------------------------------------------
 * Carte maintenance : prochain entretien (véhicule + km restants) et
 * hiérarchie de suivi OK / À surveiller / Urgent. Aucune donnée hors
 * de la flotte du client connecté.
 */
import { Card } from '@/components/ui';
import { StatusBadge } from '@/components/core';
import './ClientDashboard.css';

const STATUS_COUNTS_META = [
  { key: 'ok', label: 'OK', variant: 'success', icon: 'bi-check-circle' },
  { key: 'watch', label: 'À surveiller', variant: 'warning', icon: 'bi-exclamation-triangle' },
  { key: 'urgent', label: 'Urgent', variant: 'danger', icon: 'bi-exclamation-octagon' },
];

const ClientMaintenanceCard = ({ maintenance = null }) => {
  const nextService = maintenance?.nextService;
  const counts = maintenance?.statusCounts || { ok: 0, watch: 0, urgent: 0 };

  const progressPercent = nextService?.intervalKm
    ? Math.min(100, Math.max(4, Math.round(((nextService.intervalKm - nextService.remainingKm) / nextService.intervalKm) * 100)))
    : 0;

  return (
    <Card
      className="h-100"
      title={
        <span className="d-flex align-items-center gap-2">
          <i className="bi bi-wrench-adjustable text-warning" aria-hidden="true" />
          <span>Maintenance</span>
        </span>
      }
      footer={
        maintenance ? (
          <span className="small text-muted d-flex align-items-center gap-1">
            <i className="bi bi-calendar2-week" aria-hidden="true" />
            {maintenance.upcoming} entretien{maintenance.upcoming > 1 ? 's' : ''} à venir
            {maintenance.overdue > 0 && (
              <span className="text-danger fw-semibold ms-1">
                · {maintenance.overdue} en retard
              </span>
            )}
          </span>
        ) : null
      }
    >
      {nextService ? (
        <div className="navix-client-maint__next mb-3">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="fw-semibold">{nextService.vehicle}</span>
            <span className="font-monospace small text-muted">{nextService.registrationNumber}</span>
          </div>
          <div className="text-muted small mb-2">
            {nextService.type} — Entretien dans <span className="fw-bold text-body-emphasis">{nextService.remainingKm} km</span>
          </div>
          <div
            className="progress navix-client-maint__progress"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label={`Prochain entretien à ${progressPercent} % du cycle`}
          >
            <div className="progress-bar bg-warning" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="d-flex justify-content-between small text-muted mt-1">
            <span>Dernier entretien</span>
            <span>Prochain</span>
          </div>
        </div>
      ) : (
        <p className="text-secondary mb-3">
          <i className="bi bi-check2-circle me-1 text-success" aria-hidden="true" />
          Aucune maintenance planifiée.
        </p>
      )}

      <div className="navix-client-maint__counts">
        {STATUS_COUNTS_META.map(({ key, label, variant, icon }) => (
          <div key={key} className="navix-client-maint__count">
            <StatusBadge variant={variant} label={label} icon={icon} />
            <span className="fs-4 fw-bold text-body-emphasis">{counts[key] || 0}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ClientMaintenanceCard;
