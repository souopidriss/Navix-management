/**
 * Navix Billing — PaymentSearchBar
 * --------------------------------------------------------------------------
 * Recherche instantanée par numéro, entreprise, référence, moyen ou statut.
 * Construite sur le SearchBar générique de la bibliothèque core.
 */
import { SearchBar } from '@/components/core';

const PaymentSearchBar = (props) => (
  <SearchBar
    id="payment-search"
    label="Rechercher un paiement"
    placeholder="Rechercher par numéro, entreprise, référence, moyen…"
    {...props}
  />
);

export default PaymentSearchBar;
