/**
 * Navix Trips — TripSearchBar
 * --------------------------------------------------------------------------
 * Recherche instantanée par n° de trajet, chauffeur, immatriculation,
 * entreprise, ville de départ ou d'arrivée. Construite sur le SearchBar
 * générique de la bibliothèque core (debounce 300 ms, effacement, compteur).
 *
 * Props :
 *   value       : valeur de recherche (contrôlée)
 *   onChange    : (value: string) => void
 *   resultCount : nombre de résultats affichés (optionnel)
 */
import { SearchBar } from '@/components/core';

const TripSearchBar = (props) => (
  <SearchBar
    id="trip-search"
    label="Rechercher un trajet"
    placeholder="Rechercher par n° de trajet, chauffeur, immatriculation, entreprise, ville…"
    {...props}
  />
);

export default TripSearchBar;
