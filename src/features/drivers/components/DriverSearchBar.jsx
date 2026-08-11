/**
 * Navix Drivers — DriverSearchBar
 * --------------------------------------------------------------------------
 * Recherche instantanée par nom, prénom, téléphone, email, code employé ou
 * numéro de permis. Construite sur le SearchBar générique de la bibliothèque
 * core (debounce 300 ms, effacement, compteur).
 *
 * Props :
 *   value       : valeur de recherche (contrôlée)
 *   onChange    : (value: string) => void
 *   resultCount : nombre de résultats affichés (optionnel)
 */
import { SearchBar } from '@/components/core';

const DriverSearchBar = (props) => (
  <SearchBar
    id="driver-search"
    label="Rechercher un chauffeur"
    placeholder="Rechercher par nom, prénom, téléphone, email, code ou permis…"
    {...props}
  />
);

export default DriverSearchBar;
