/**
 * Navix Agencies — AgencySearchBar
 * --------------------------------------------------------------------------
 * Recherche instantanée par nom, code, ville, région, pays, type ou société.
 * Construite sur le SearchBar générique de la bibliothèque core
 * (debounce 300 ms, effacement, compteur).
 *
 * Props :
 *   value       : valeur de recherche (contrôlée)
 *   onChange    : (value: string) => void
 *   resultCount : nombre de résultats affichés (optionnel)
 */
import { SearchBar } from '@/components/core';

const AgencySearchBar = (props) => (
  <SearchBar
    id="agency-search"
    label="Rechercher une agence"
    placeholder="Rechercher par nom, code, ville, pays, type…"
    {...props}
  />
);

export default AgencySearchBar;
