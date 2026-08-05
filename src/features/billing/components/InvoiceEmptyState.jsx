/**
 * Navix Billing — InvoiceEmptyState
 * --------------------------------------------------------------------------
 * État vide de la liste des factures : aucun résultat (recherche / filtres)
 * ou liste source vide. Construit sur le EmptyState générique de Core UI.
 */
import { Button } from '@/components/ui';
import { EmptyState } from '@/components/core';

const InvoiceEmptyState = ({ hasQuery = false, onReset }) => (
  <EmptyState
    icon="bi-receipt"
    title={hasQuery ? 'Aucun résultat' : 'Aucune facture'}
    description={
      hasQuery
        ? 'Aucune facture ne correspond à votre recherche ou à vos filtres. Essayez de modifier vos critères.'
        : 'Aucune facture n’a encore été émise. Les renouvellements d’abonnement généreront des factures automatiquement.'
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

export default InvoiceEmptyState;
