/**
 * Navix Assignments — EmptyAssignmentState
 * --------------------------------------------------------------------------
 * État vide du module affectations : aucune affectation ne correspond aux
 * critères courants (recherche / filtres / historique) ou à la liste source.
 *
 * Props :
 *   hasQuery  : booléen — une recherche ou des filtres sont actifs
 *   onReset   : () => void — réinitialise recherche et filtres
 *   variant   : 'list' | 'history' — variante du libellé (défaut : 'list')
 */
import { Button } from '@/components/ui';
import './EmptyAssignmentState.css';

const EmptyAssignmentState = ({ hasQuery = false, onReset, variant = 'list' }) => (
  <div className="navix-assignment-empty text-center">
    <span className="navix-assignment-empty__icon" aria-hidden="true">
      <i className="bi bi-shuffle" />
    </span>
    <h2 className="navix-assignment-empty__title">
      {hasQuery
        ? 'Aucun résultat'
        : variant === 'history'
          ? 'Aucune affectation dans l’historique'
          : 'Aucune affectation'}
    </h2>
    <p className="navix-assignment-empty__text">
      {hasQuery
        ? 'Aucune affectation ne correspond à votre recherche ou à vos filtres. Essayez de modifier vos critères.'
        : variant === 'history'
          ? 'Les affectations terminées et annulées apparaîtront ici.'
          : 'Créez votre première affectation pour affecter un véhicule à un chauffeur.'}
    </p>
    {hasQuery && onReset && (
      <Button variant="outline" size="sm" icon="bi-arrow-counterclockwise" onClick={onReset}>
        Réinitialiser les filtres
      </Button>
    )}
  </div>
);

export default EmptyAssignmentState;
