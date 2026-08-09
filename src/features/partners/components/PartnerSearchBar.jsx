/**
 * Navix Partners — PartnerSearchBar
 * --------------------------------------------------------------------------
 * Recherche instantanée par code, nom, contact, email, ville, pays, type ou
 * entreprise. Construite sur le SearchBar générique de la bibliothèque core
 * (debounce 300 ms, effacement, compteur).
 *
 * Props :
 *   value       : valeur de recherche (contrôlée)
 *   onChange    : (value: string) => void
 *   resultCount : nombre de résultats affichés (optionnel)
 */
import { SearchBar } from '@/components/core';

const PartnerSearchBar = (props) => (
  <SearchBar
    id="partner-search"
    label="Rechercher un partenaire"
    placeholder="Rechercher par nom, code, contact, ville, type…"
    {...props}
  />
);

export default PartnerSearchBar;
