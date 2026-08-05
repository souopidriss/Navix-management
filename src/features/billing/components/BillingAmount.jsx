/**
 * Navix Billing — BillingAmount
 * --------------------------------------------------------------------------
 * Montant formaté selon la devise (XAF entier / EUR & USD à 2 décimales).
 * Le symbole provient des constantes du module.
 */
import { formatBillingMoney } from '../constants';

const BillingAmount = ({ value, currency, className }) => (
  <span className={className}>{formatBillingMoney(value, currency)}</span>
);

export default BillingAmount;
