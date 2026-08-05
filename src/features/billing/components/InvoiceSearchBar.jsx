/**
 * Navix Billing — InvoiceSearchBar
 * --------------------------------------------------------------------------
 * Recherche instantanée par numéro, entreprise, statut, montant ou devise.
 * Construite sur le SearchBar générique de la bibliothèque core.
 */
import { SearchBar } from '@/components/core';

const InvoiceSearchBar = (props) => (
  <SearchBar
    id="invoice-search"
    label="Rechercher une facture"
    placeholder="Rechercher par numéro, entreprise, statut…"
    {...props}
  />
);

export default InvoiceSearchBar;
