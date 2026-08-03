/**
 * Navix Fuel — FuelEmptyState
 * --------------------------------------------------------------------------
 * État vide du module carburant : aucun plein ne correspond aux critères
 * courants (recherche / filtres) ou à la liste source.
 *
 * Props :
 *   hasQuery : booléen — une recherche ou des filtres sont actifs
 *   onReset  : () => void — réinitialise recherche et filtres
 */
import { Button } from '@/components/ui';
import './FuelEmptyState.css';

const FuelEmptyState = ({ hasQuery = false, onReset }) => (
  <div className="navix-fuel-empty text-center">
    <span className="navix-fuel-empty__icon" aria-hidden="true">
      <i className="bi bi-fuel-pump" />
    </span>
    <h2 className="navix-fuel-empty__title">{hasQuery ? 'Aucun résultat' : 'Aucun plein'}</h2>
    <p className="navix-fuel-empty__text">
      {hasQuery
        ? 'Aucun plein ne correspond à votre recherche ou à vos filtres. Essayez de modifier vos critères.'
        : 'Enregistrez votre premier plein pour suivre la consommation de carburant de vos véhicules.'}
    </p>
    {hasQuery && onReset && (
      <Button variant="outline" size="sm" icon="bi-arrow-counterclockwise" onClick={onReset}>
        Réinitialiser les filtres
      </Button>
    )}
  </div>
);

export default FuelEmptyState;
