/**
 * Navix Subscriptions — SubscriptionEmptyState
 * --------------------------------------------------------------------------
 * État vide du module abonnements : aucun abonnement ne correspond aux
 * critères courants (recherche / filtres) ou à la liste source. Construit
 * sur le EmptyState générique de la bibliothèque core.
 *
 * Props :
 *   hasQuery : booléen — une recherche ou des filtres sont actifs
 *   onReset  : () => void — réinitialise recherche et filtres
 *   onBrowse : () => void — navigue vers la page des plans
 */
import { Button } from '@/components/ui';
import { EmptyState } from '@/components/core';

const SubscriptionEmptyState = ({ hasQuery = false, onReset, onBrowse }) => (
  <EmptyState
    icon="bi-credit-card"
    title={hasQuery ? 'Aucun résultat' : 'Aucun abonnement'}
    description={
      hasQuery
        ? 'Aucun abonnement ne correspond à votre recherche ou à vos filtres. Essayez de modifier vos critères.'
        : 'Aucune entreprise n’est abonnée pour le moment. Découvrez les plans disponibles pour démarrer.'
    }
    action={
      hasQuery && onReset ? (
        <Button variant="outline" size="sm" icon="bi-arrow-counterclockwise" onClick={onReset}>
          Réinitialiser les filtres
        </Button>
      ) : onBrowse ? (
        <Button variant="primary" size="sm" icon="bi-stars" onClick={onBrowse}>
          Voir les plans
        </Button>
      ) : undefined
    }
  />
);

export default SubscriptionEmptyState;
