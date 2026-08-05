/**
 * Navix Subscriptions — SubscriptionSearchBar
 * --------------------------------------------------------------------------
 * Recherche instantanée par entreprise, plan, statut, prix ou date.
 * Construite sur le SearchBar générique de la bibliothèque core.
 *
 * Props :
 *   value       : valeur de recherche (contrôlée)
 *   onChange    : (value: string) => void
 *   resultCount : nombre de résultats affichés (optionnel)
 */
import { SearchBar } from '@/components/core';

const SubscriptionSearchBar = (props) => (
  <SearchBar
    id="subscription-search"
    label="Rechercher un abonnement"
    placeholder="Rechercher par entreprise, plan, statut, prix…"
    {...props}
  />
);

export default SubscriptionSearchBar;
