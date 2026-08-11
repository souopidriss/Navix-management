/**
 * Navix Vehicles — VehicleSearchBar
 * --------------------------------------------------------------------------
 * Recherche instantanée par immatriculation, VIN, marque, modèle ou
 * entreprise. Construite sur le SearchBar générique de la bibliothèque core
 * (debounce 300 ms, effacement, compteur).
 *
 * Props :
 *   value       : valeur de recherche (contrôlée)
 *   onChange    : (value: string) => void
 *   resultCount : nombre de résultats affichés (optionnel)
 */
import { SearchBar } from '@/components/core';

const VehicleSearchBar = (props) => (
  <SearchBar
    id="vehicle-search"
    label="Rechercher un véhicule"
    placeholder="Rechercher par immatriculation, VIN, marque, modèle ou entreprise…"
    {...props}
  />
);

export default VehicleSearchBar;
