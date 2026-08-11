/**
 * Navix Assignments — EmptyAssignmentState
 * --------------------------------------------------------------------------
 * État vide du module affectations : aucune affectation ne correspond aux
 * critères courants (recherche / filtres / historique) ou à la liste source.
 * Construit sur l'EmptyState générique de la bibliothèque core.
 *
 * Props :
 *   hasQuery  : booléen — une recherche ou des filtres sont actifs
 *   onReset   : () => void — réinitialise recherche et filtres
 *   variant   : 'list' | 'history' — variante du libellé (défaut : 'list')
 */
import { Button } from '@/components/ui';
import { EmptyState } from '@/components/core';

const EmptyAssignmentState = ({ hasQuery = false, onReset, variant = 'list' }) => (
  <EmptyState
    icon="bi-shuffle"
    title={
      hasQuery
        ? 'Aucun résultat'
        : variant === 'history'
          ? 'Aucune affectation dans l’historique'
          : 'Aucune affectation'
    }
    description={
      hasQuery
        ? 'Aucune affectation ne correspond à votre recherche ou à vos filtres. Essayez de modifier vos critères.'
        : variant === 'history'
          ? 'Les affectations terminées et annulées apparaîtront ici.'
          : 'Créez votre première affectation pour affecter un véhicule à un chauffeur.'
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

export default EmptyAssignmentState;
