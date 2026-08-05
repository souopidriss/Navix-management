/**
 * Navix Notifications — NotificationSearchBar
 * --------------------------------------------------------------------------
 * Recherche instantanée (titre, message, entreprise, type, catégorie,
 * sévérité, statut, ressource) construite sur le SearchBar générique de Core
 * UI. `resultCount` est piloté par la page pour afficher le nombre de
 * résultats.
 */
import { SearchBar } from '@/components/core';

const NotificationSearchBar = (props) => (
  <SearchBar
    id="notification-search"
    label="Rechercher une notification"
    placeholder="Rechercher par titre, entreprise, type, statut…"
    {...props}
  />
);

export default NotificationSearchBar;
