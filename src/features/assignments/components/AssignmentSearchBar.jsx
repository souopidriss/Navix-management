/**
 * Navix Assignments — AssignmentSearchBar
 * --------------------------------------------------------------------------
 * Recherche instantanée par numéro d'affectation, chauffeur, immatriculation,
 * entreprise ou destination. Construite sur le SearchBar générique de la
 * bibliothèque core (debounce 300 ms, effacement, compteur).
 *
 * Props :
 *   value       : valeur de recherche (contrôlée)
 *   onChange    : (value: string) => void
 *   resultCount : nombre de résultats affichés (optionnel)
 */
import { SearchBar } from '@/components/core';

const AssignmentSearchBar = (props) => (
  <SearchBar
    id="assignment-search"
    label="Rechercher une affectation"
    placeholder="Rechercher par n° d’affectation, chauffeur, immatriculation, entreprise…"
    {...props}
  />
);

export default AssignmentSearchBar;
