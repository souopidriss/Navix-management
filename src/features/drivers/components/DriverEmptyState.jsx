/**
 * Navix Drivers — DriverEmptyState
 * --------------------------------------------------------------------------
 * État vide de la liste (aucun chauffeur ou aucun résultat) : icône, message,
 * bouton de réinitialisation des filtres et/ou de création.
 *
 * Props :
 *   onReset  : () => void — réinitialise recherche et filtres
 *   onCreate : () => void — navigue vers la création
 *   title    : titre personnalisé
 *   message  : message personnalisé
 */
import { Button } from '@/components/ui';

const DriverEmptyState = ({
  onReset,
  onCreate,
  title = 'Aucun chauffeur trouvé',
  message = 'Aucun chauffeur ne correspond à vos critères. Modifiez votre recherche ou vos filtres.',
}) => (
  <div className="card">
    <div className="card-body text-center py-5">
      <i className="bi bi-person-badge display-4 text-secondary" aria-hidden="true" />
      <h2 className="h5 mt-3 mb-1">{title}</h2>
      <p className="text-secondary mx-auto mb-4 navix-driver-empty__message">{message}</p>
      <div className="d-flex justify-content-center gap-2 flex-wrap">
        {onReset && (
          <Button variant="outline" icon="bi-arrow-counterclockwise" onClick={onReset}>
            Réinitialiser les filtres
          </Button>
        )}
        {onCreate && (
          <Button variant="primary" icon="bi-plus-lg" onClick={onCreate}>
            Ajouter un chauffeur
          </Button>
        )}
      </div>
    </div>
  </div>
);

export default DriverEmptyState;
