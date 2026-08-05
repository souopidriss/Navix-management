/**
 * Navix Agencies — AgencyEmptyState
 * --------------------------------------------------------------------------
 * État vide du module agences / sites : aucune agence ne correspond aux
 * critères courants (recherche / filtres) ou à la liste source. Construit
 * sur le EmptyState générique de la bibliothèque core.
 *
 * Props :
 *   hasQuery : booléen — une recherche ou des filtres sont actifs
 *   onReset  : () => void — réinitialise recherche et filtres
 *   onCreate : () => void — navigue vers la création
 */
import { Button } from '@/components/ui';
import { EmptyState } from '@/components/core';

const AgencyEmptyState = ({ hasQuery = false, onReset, onCreate }) => (
  <EmptyState
    icon="bi-diagram-3"
    title={hasQuery ? 'Aucun résultat' : 'Aucune agence'}
    description={
      hasQuery
        ? 'Aucune agence ne correspond à votre recherche ou à vos filtres. Essayez de modifier vos critères.'
        : 'Créez votre première agence ou site pour structurer votre réseau.'
    }
    action={
      hasQuery && onReset ? (
        <Button variant="outline" size="sm" icon="bi-arrow-counterclockwise" onClick={onReset}>
          Réinitialiser les filtres
        </Button>
      ) : onCreate ? (
        <Button variant="primary" size="sm" icon="bi-plus-lg" onClick={onCreate}>
          Créer une agence
        </Button>
      ) : undefined
    }
  />
);

export default AgencyEmptyState;
