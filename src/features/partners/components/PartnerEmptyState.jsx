/**
 * Navix Partners — PartnerEmptyState
 * --------------------------------------------------------------------------
 * État vide de la liste des partenaires (aucun résultat ou aucun partenaire).
 * Construit sur l'EmptyState core : icône, titre, description et action.
 *
 * Props :
 *   hasActiveFilters : booléen — il existe une recherche ou des filtres actifs
 *   onReset          : () => void — réinitialiser recherche et filtres
 *   onCreate         : () => void — ouvrir l'écran de création
 */
import { Button } from '@/components/ui';
import { EmptyState } from '@/components/core';

const PartnerEmptyState = ({ hasActiveFilters = false, onReset, onCreate }) => (
  <EmptyState
    icon={hasActiveFilters ? 'bi-search' : 'bi-handshake'}
    title={hasActiveFilters ? 'Aucun partenaire trouvé' : 'Aucun partenaire pour le moment'}
    description={
      hasActiveFilters
        ? 'Aucun partenaire ne correspond à votre recherche. Essayez d’élargir les critères ou de réinitialiser les filtres.'
        : 'Créez votre premier partenaire pour commencer à gérer vos prestataires, fournisseurs et assureurs.'
    }
    action={
      hasActiveFilters ? (
        <Button variant="outline" size="sm" icon="bi-arrow-counterclockwise" onClick={onReset}>
          Réinitialiser les filtres
        </Button>
      ) : (
        <Button variant="primary" icon="bi-plus-lg" onClick={onCreate}>
          Ajouter un partenaire
        </Button>
      )
    }
  />
);

export default PartnerEmptyState;
