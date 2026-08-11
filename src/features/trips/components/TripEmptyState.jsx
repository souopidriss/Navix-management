/**
 * Navix Trips — TripEmptyState
 * --------------------------------------------------------------------------
 * État vide du module trajets : aucun trajet ne correspond aux critères
 * courants (recherche / filtres / historique) ou à la liste source.
 * Construit sur l'EmptyState générique de la bibliothèque core.
 *
 * Props :
 *   hasQuery : booléen — une recherche ou des filtres sont actifs
 *   onReset  : () => void — réinitialise recherche et filtres
 *   variant  : 'list' | 'history' — variante du libellé (défaut : 'list')
 */
import { Button } from '@/components/ui';
import { EmptyState } from '@/components/core';

const TripEmptyState = ({ hasQuery = false, onReset, variant = 'list' }) => (
  <EmptyState
    icon="bi-signpost-split"
    title={
      hasQuery
        ? 'Aucun résultat'
        : variant === 'history'
          ? 'Aucun trajet dans l’historique'
          : 'Aucun trajet'
    }
    description={
      hasQuery
        ? 'Aucun trajet ne correspond à votre recherche ou à vos filtres. Essayez de modifier vos critères.'
        : variant === 'history'
          ? 'Les trajets terminés et annulés apparaîtront ici.'
          : 'Créez votre premier trajet pour planifier un déplacement de véhicule.'
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

export default TripEmptyState;
