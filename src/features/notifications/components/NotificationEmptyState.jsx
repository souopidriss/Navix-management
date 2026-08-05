/**
 * Navix Notifications — NotificationEmptyState
 * --------------------------------------------------------------------------
 * État vide de la liste des notifications : aucun résultat (recherche /
 * filtres) ou liste source vide. Construit sur le EmptyState de Core UI.
 */
import { Button } from '@/components/ui';
import { EmptyState } from '@/components/core';

const NotificationEmptyState = ({ hasQuery = false, onReset }) => (
  <EmptyState
    icon="bi-bell"
    title={hasQuery ? 'Aucun résultat' : 'Aucune notification'}
    description={
      hasQuery
        ? 'Aucune notification ne correspond à votre recherche ou à vos filtres. Essayez de modifier vos critères.'
        : 'Vous n’avez aucune notification pour le moment. Les alertes automatiques apparaîtront ici.'
    }
    action={
      hasQuery && onReset ? (
        <Button variant="outline" size="sm" icon="bi-arrow-counterclockwise" onClick={onReset}>
          Réinitialiser les filtres
        </Button>
      ) : undefined
    }
  />
);

export default NotificationEmptyState;
