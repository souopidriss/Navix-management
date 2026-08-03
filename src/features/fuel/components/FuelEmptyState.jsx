/**
 * Navix Fuel — FuelEmptyState
 * --------------------------------------------------------------------------
 * État vide du module carburant : aucun plein ne correspond aux critères
 * courants (recherche / filtres) ou à la liste source. Construit sur le
 * EmptyState générique de la bibliothèque core.
 *
 * Props :
 *   hasQuery : booléen — une recherche ou des filtres sont actifs
 *   onReset  : () => void — réinitialise recherche et filtres
 */
import { Button } from '@/components/ui';
import { EmptyState } from '@/components/core';

const FuelEmptyState = ({ hasQuery = false, onReset }) => (
  <EmptyState
    icon="bi-fuel-pump"
    title={hasQuery ? 'Aucun résultat' : 'Aucun plein'}
    description={
      hasQuery
        ? 'Aucun plein ne correspond à votre recherche ou à vos filtres. Essayez de modifier vos critères.'
        : 'Enregistrez votre premier plein pour suivre la consommation de carburant de vos véhicules.'
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

export default FuelEmptyState;
