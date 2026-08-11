/**
 * Navix Companies — CompanyEmptyState
 * --------------------------------------------------------------------------
 * État vide de la liste (aucune entreprise ou aucun résultat) : icône,
 * message, bouton de réinitialisation des filtres et/ou de création.
 * Construit sur l'EmptyState générique de la bibliothèque core.
 *
 * Props :
 *   onReset    : () => void — réinitialise recherche et filtres
 *   onCreate   : () => void — navigue vers la création
 *   title      : titre personnalisé
 *   message    : message personnalisé
 */
import { Button } from '@/components/ui';
import { EmptyState } from '@/components/core';

const CompanyEmptyState = ({
  onReset,
  onCreate,
  title = 'Aucune entreprise trouvée',
  message = 'Aucune entreprise ne correspond à vos critères. Modifiez votre recherche ou vos filtres.',
}) => (
  <EmptyState
    icon="bi-buildings"
    title={title}
    description={message}
    action={
      <div className="d-flex justify-content-center gap-2 flex-wrap">
        {onReset && (
          <Button variant="outline" icon="bi-arrow-counterclockwise" onClick={onReset}>
            Réinitialiser les filtres
          </Button>
        )}
        {onCreate && (
          <Button variant="primary" icon="bi-plus-lg" onClick={onCreate}>
            Créer une entreprise
          </Button>
        )}
      </div>
    }
  />
);

export default CompanyEmptyState;
