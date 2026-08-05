/**
 * Navix Billing — PaymentEmptyState
 * --------------------------------------------------------------------------
 * État vide de la liste des paiements : aucun résultat (recherche / filtres)
 * ou liste source vide. Construit sur le EmptyState générique de Core UI.
 */
import { Button } from '@/components/ui';
import { EmptyState } from '@/components/core';

const PaymentEmptyState = ({ hasQuery = false, onReset }) => (
  <EmptyState
    icon="bi-cash-coin"
    title={hasQuery ? 'Aucun résultat' : 'Aucun paiement'}
    description={
      hasQuery
        ? 'Aucun paiement ne correspond à votre recherche ou à vos filtres. Essayez de modifier vos critères.'
        : 'Aucun paiement n’a encore été enregistré. Les paiements sont simulés depuis le détail d’une facture.'
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

export default PaymentEmptyState;
