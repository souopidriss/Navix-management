/**
 * Navix Partner Portal — PartnerNotificationEmptyState (PROMPT 067)
 * --------------------------------------------------------------------------
 * États vides pour les notifications et activités partenaire.
 */
import { EmptyState } from '@/components/core';

export const NotificationEmptyState = ({ hasFilters = false }) => (
  <EmptyState
    icon="bi-bell-slash"
    title={hasFilters ? 'Aucun résultat' : 'Vous êtes à jour'}
    description={
      hasFilters
        ? 'Aucune notification ne correspond à vos filtres.'
        : 'Aucune nouvelle notification pour le moment.'
    }
  />
);

export const ActivityEmptyState = () => (
  <EmptyState
    icon="bi-activity"
    title="Aucune activité récente"
    description="Les activités de votre espace apparaîtront ici."
  />
);

export const ErrorNotificationState = ({ onRetry }) => (
  <EmptyState
    icon="bi-exclamation-triangle"
    title="Impossible de charger les notifications"
    description="Une erreur est survenue lors du chargement."
    action={
      <button type="button" className="btn btn-primary btn-sm" onClick={onRetry}>
        <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
        Réessayer
      </button>
    }
  />
);
