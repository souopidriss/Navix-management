/**
 * Navix Companies — CompanySearchBar
 * --------------------------------------------------------------------------
 * Recherche instantanée par nom, code, ville ou email. Construite sur le
 * SearchBar générique de la bibliothèque core (debounce 300 ms, effacement,
 * compteur).
 *
 * Props :
 *   value       : valeur de recherche (contrôlée)
 *   onChange    : (value: string) => void
 *   resultCount : nombre de résultats affichés (optionnel)
 */
import { SearchBar } from '@/components/core';

const CompanySearchBar = (props) => (
  <SearchBar
    id="company-search"
    label="Rechercher une entreprise"
    placeholder="Rechercher par nom, code, ville ou email…"
    {...props}
  />
);

export default CompanySearchBar;
