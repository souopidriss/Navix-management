/**
 * Navix Trips — TripEmptyState
 * --------------------------------------------------------------------------
 * État vide du module trajets : aucun trajet ne correspond aux critères
 * courants (recherche / filtres / historique) ou à la liste source.
 *
 * Props :
 *   hasQuery : booléen — une recherche ou des filtres sont actifs
 *   onReset  : () => void — réinitialise recherche et filtres
 *   variant  : 'list' | 'history' — variante du libellé (défaut : 'list')
 */
import { Button } from '@/components/ui';
import './TripEmptyState.css';

const TripEmptyState = ({ hasQuery = false, onReset, variant = 'list' }) => (
  <div className="navix-trip-empty text-center">
    <span className="navix-trip-empty__icon" aria-hidden="true">
      <i className="bi bi-signpost-split" />
    </span>
    <h2 className="navix-trip-empty__title">
      {hasQuery
        ? 'Aucun résultat'
        : variant === 'history'
          ? 'Aucun trajet dans l’historique'
          : 'Aucun trajet'}
    </h2>
    <p className="navix-trip-empty__text">
      {hasQuery
        ? 'Aucun trajet ne correspond à votre recherche ou à vos filtres. Essayez de modifier vos critères.'
        : variant === 'history'
          ? 'Les trajets terminés et annulés apparaîtront ici.'
          : 'Créez votre premier trajet pour planifier un déplacement de véhicule.'}
    </p>
    {hasQuery && onReset && (
      <Button variant="outline" size="sm" icon="bi-arrow-counterclockwise" onClick={onReset}>
        Réinitialiser les filtres
      </Button>
    )}
  </div>
);

export default TripEmptyState;
