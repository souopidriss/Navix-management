/**
 * Navix Maintenance — MaintenanceEmptyState
 * --------------------------------------------------------------------------
 * État vide du module entretiens : aucun entretien ne correspond aux critères
 * courants (recherche / filtres) ou à la liste source. Construit sur le
 * EmptyState générique de la bibliothèque core.
 *
 * Props :
 *   hasQuery : booléen — une recherche ou des filtres sont actifs
 *   onReset  : () => void — réinitialise recherche et filtres
 */
import { Button } from '@/components/ui';
import { EmptyState } from '@/components/core';

const MaintenanceEmptyState = ({ hasQuery = false, onReset }) => (
  <EmptyState
    icon="bi-wrench-adjustable"
    title={hasQuery ? 'Aucun résultat' : 'Aucun entretien'}
    description={
      hasQuery
        ? 'Aucun entretien ne correspond à votre recherche ou à vos filtres. Essayez de modifier vos critères.'
        : 'Planifiez votre premier entretien pour suivre la maintenance de vos véhicules.'
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

export default MaintenanceEmptyState;
