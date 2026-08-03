/**
 * Navix Fuel — FuelSearchBar
 * --------------------------------------------------------------------------
 * Recherche instantanée par station, ville, n° de facture, immatriculation,
 * chauffeur, entreprise ou n° de plein. Construite sur le SearchBar générique
 * de la bibliothèque core (debounce 300 ms, effacement, compteur).
 *
 * Props :
 *   value       : valeur de recherche (contrôlée)
 *   onChange    : (value: string) => void
 *   resultCount : nombre de résultats affichés (optionnel)
 */
import { SearchBar } from '@/components/core';

const FuelSearchBar = (props) => (
  <SearchBar
    id="fuel-search"
    label="Rechercher un plein de carburant"
    placeholder="Rechercher par station, immatriculation, chauffeur, n° de facture…"
    {...props}
  />
);

export default FuelSearchBar;
