/**
 * Navix Maintenance — MaintenanceAlertBadge
 * --------------------------------------------------------------------------
 * Série d'alertes visuelles d'un entretien (priorité urgente, retard, date
 * proche, kilométrage proche, véhicule immobilisé). Les règles métier sont
 * simulées dans les constantes ; chaque alerte est un badge-icône accessible
 * (title + aria-label). Aucune alerte → rien n'est rendu.
 *
 * Props :
 *   maintenance : entretien à analyser
 *   vehicle     : véhicule lié (kilométrage actuel pour les seuils)
 */
import { Badge } from '@/components/ui';
import {
  isMaintenanceLate,
  isMaintenanceDateDueSoon,
  isMaintenanceMileageDueSoon,
  isMaintenanceUrgent,
  isMaintenanceImmobilizing,
} from '../constants';

const MaintenanceAlertBadge = ({ maintenance = {}, vehicle }) => {
  const alerts = [];

  if (isMaintenanceUrgent(maintenance)) {
    alerts.push({ variant: 'danger', icon: 'bi-exclamation-triangle-fill', label: 'Priorité urgente' });
  }
  if (isMaintenanceLate(maintenance, vehicle)) {
    alerts.push({ variant: 'danger', icon: 'bi-clock-history', label: 'Entretien en retard' });
  }
  if (isMaintenanceDateDueSoon(maintenance)) {
    alerts.push({ variant: 'warning', icon: 'bi-calendar-event', label: 'Prochaine échéance proche' });
  }
  if (isMaintenanceMileageDueSoon(maintenance, vehicle)) {
    alerts.push({ variant: 'warning', icon: 'bi-speedometer', label: 'Seuil kilométrique proche' });
  }
  if (isMaintenanceImmobilizing(maintenance)) {
    alerts.push({ variant: 'primary', icon: 'bi-pause-circle-fill', label: 'Véhicule immobilisé' });
  }

  if (alerts.length === 0) return null;

  return (
    <span className="navix-maint-alerts d-inline-flex gap-1" role="group" aria-label={`${alerts.length} alerte(s)`}>
      {alerts.map((alert) => (
        <Badge key={alert.label} variant={alert.variant} soft title={alert.label} aria-label={alert.label}>
          <i className={`bi ${alert.icon}`} aria-hidden="true" />
        </Badge>
      ))}
    </span>
  );
};

export default MaintenanceAlertBadge;
