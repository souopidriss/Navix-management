/**
 * Navix Maintenance — MaintenanceTimeline
 * --------------------------------------------------------------------------
 * Cycle de vie d'un entretien (planifié → en attente → en cours → terminé /
 * annulé), construit sur le Timeline générique de la bibliothèque core.
 * Les jalons sont dérivés du statut et des horodatages de l'entretien.
 *
 * Props :
 *   maintenance : entretien dont on affiche le cycle de vie
 */
import { Timeline } from '@/components/core';
import { formatMaintenanceDate, getMaintenanceType } from '../constants';

const formatTimestamp = (value) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

const buildTimeline = (maintenance) => {
  const type = getMaintenanceType(maintenance.maintenanceType);
  const items = [];

  items.push({
    id: 'planned',
    title: 'Planifié',
    description: `${type.label} — ${maintenance.description || 'Intervention programmée'}`,
    date: formatMaintenanceDate(maintenance.scheduledDate),
    icon: 'bi-calendar2-event',
    variant: 'secondary',
    active: maintenance.status !== 'cancelled',
  });

  if (maintenance.status === 'pending') {
    items.push({
      id: 'pending',
      title: 'En attente',
      description: maintenance.workshop ? `Atelier : ${maintenance.workshop}` : 'En attente de créneau atelier',
      date: formatMaintenanceDate(maintenance.scheduledDate),
      icon: 'bi-hourglass-split',
      variant: 'warning',
      active: true,
    });
  }

  if (maintenance.startedAt) {
    items.push({
      id: 'started',
      title: 'En cours',
      description: maintenance.mechanic ? `Mécanicien : ${maintenance.mechanic}` : 'Intervention en atelier',
      date: formatTimestamp(maintenance.startedAt),
      icon: 'bi-gear-wide-connected',
      variant: 'primary',
      active: maintenance.status === 'in_progress',
    });
  }

  if (maintenance.status === 'completed') {
    items.push({
      id: 'completed',
      title: 'Terminé',
      description: maintenance.performedWork || 'Intervention finalisée',
      date: formatTimestamp(maintenance.completedAt),
      icon: 'bi-check2-circle',
      variant: 'success',
      active: true,
    });
  }

  if (maintenance.status === 'cancelled') {
    items.push({
      id: 'cancelled',
      title: 'Annulé',
      description: maintenance.notes || 'Entretien annulé',
      date: formatMaintenanceDate(maintenance.scheduledDate),
      icon: 'bi-x-circle',
      variant: 'danger',
      active: true,
    });
  }

  return items;
};

const MaintenanceTimeline = ({ maintenance }) => (
  <Timeline items={buildTimeline(maintenance)} />
);

export default MaintenanceTimeline;
