/**
 * Navix Maintenance — MaintenanceSearchBar
 * --------------------------------------------------------------------------
 * Recherche instantanée par n° d'entretien, véhicule (immatriculation ou
 * marque/modèle), entreprise, atelier, mécanicien, fournisseur ou description.
 * Construite sur le SearchBar générique de la bibliothèque core
 * (debounce 300 ms, effacement, compteur).
 *
 * Props :
 *   value       : valeur de recherche (contrôlée)
 *   onChange    : (value: string) => void
 *   resultCount : nombre de résultats affichés (optionnel)
 */
import { SearchBar } from '@/components/core';

const MaintenanceSearchBar = (props) => (
  <SearchBar
    id="maintenance-search"
    label="Rechercher un entretien"
    placeholder="Rechercher par n° d’entretien, immatriculation, atelier, mécanicien…"
    {...props}
  />
);

export default MaintenanceSearchBar;
