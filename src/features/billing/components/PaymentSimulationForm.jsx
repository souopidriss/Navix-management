/**
 * Navix Billing — PaymentSimulationForm
 * --------------------------------------------------------------------------
 * Grille de champs d'une simulation de paiement, embarquée dans le FormModal
 * générique (enveloppe <form>, pied Annuler / Enregistrer, alerte d'erreur
 * globale). État piloté par useZodForm depuis PaymentSimulationModal.
 * Aucun traitement réel : montant, moyen, devise et référence sont simulés.
 */
import { Alert } from '@/components/ui';
import { CURRENCY_VALUES, CURRENCIES, PAYMENT_METHOD_VALUES, PAYMENT_METHODS } from '../constants';
import BillingAmount from './BillingAmount';
import './PaymentSimulationForm.css';

const FieldError = ({ id, error }) =>
  error ? (
    <div className="invalid-feedback d-block" id={id}>
      {error}
    </div>
  ) : null;

const PaymentSimulationForm = ({ values, errors = {}, setField, invoice }) => {
  const methodOptions = PAYMENT_METHOD_VALUES.map((value) => ({ value, meta: PAYMENT_METHODS[value] }));
  const currencyOptions = CURRENCY_VALUES.map((value) => ({ value, meta: CURRENCIES[value] }));

  const handleCurrencyChange = (value) => {
    setField('currency', value);
    if (values.amount > 0) setField('amount', 0);
  };

  return (
    <div className="row g-3 navix-payment-simulation">
      <div className="col-12">
        <Alert variant="info" className="mb-0">
          <i className="bi bi-shield-exclamation me-1" aria-hidden="true" />
          Simulation uniquement — aucun montant réel n’est prélevé.
        </Alert>
      </div>

      {invoice && (
        <div className="col-12">
          <dl className="navix-payment-simulation__summary mb-0">
            <div>
              <dt>Facture</dt>
              <dd>{invoice.number}</dd>
            </div>
            <div>
              <dt>Reste dû</dt>
              <dd>
                <BillingAmount value={invoice.amountDue} currency={invoice.currency} />
              </dd>
            </div>
            <div>
              <dt>Devise</dt>
              <dd>{getCurrencyLabel(values.currency)}</dd>
            </div>
          </dl>
        </div>
      )}

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="payment-amount">
          Montant
        </label>
        <div className="input-group">
          <span className="input-group-text" aria-hidden="true">
            <i className="bi bi-cash" />
          </span>
          <input
            id="payment-amount"
            type="number"
            min="0"
            step="0.01"
            className={errors.amount ? 'form-control is-invalid' : 'form-control'}
            value={values.amount || ''}
            onChange={(event) => setField('amount', event.target.value)}
            placeholder="0"
            aria-invalid={errors.amount ? true : undefined}
            aria-describedby={errors.amount ? 'payment-amount-error' : undefined}
          />
        </div>
        <FieldError id="payment-amount-error" error={errors.amount} />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="payment-currency">
          Devise
        </label>
        <select
          id="payment-currency"
          className={errors.currency ? 'form-select is-invalid' : 'form-select'}
          value={values.currency}
          onChange={(event) => handleCurrencyChange(event.target.value)}
          aria-invalid={errors.currency ? true : undefined}
          aria-describedby={errors.currency ? 'payment-currency-error' : undefined}
        >
          {currencyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.meta.label}
            </option>
          ))}
        </select>
        <FieldError id="payment-currency-error" error={errors.currency} />
      </div>

      <div className="col-12">
        <label className="form-label" htmlFor="payment-method">
          Moyen de paiement (simulé)
        </label>
        <div className="row g-2">
          {methodOptions.map((option) => (
            <div key={option.value} className="col-6 col-md-4">
              <label
                className={`navix-payment-simulation__method ${
                  values.method === option.value ? 'navix-payment-simulation__method--selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={option.value}
                  checked={values.method === option.value}
                  onChange={() => setField('method', option.value)}
                />
                <i className={`bi ${option.meta.icon}`} aria-hidden="true" />
                <span>{option.meta.label}</span>
              </label>
            </div>
          ))}
        </div>
        <FieldError id="payment-method-error" error={errors.method} />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="payment-reference">
          Référence de transaction
        </label>
        <div className="input-group">
          <span className="input-group-text" aria-hidden="true">
            <i className="bi bi-hash" />
          </span>
          <input
            id="payment-reference"
            type="text"
            className={errors.transactionReference ? 'form-control is-invalid' : 'form-control'}
            value={values.transactionReference}
            onChange={(event) => setField('transactionReference', event.target.value)}
            placeholder="Ex. VIR-12345"
            aria-invalid={errors.transactionReference ? true : undefined}
            aria-describedby={errors.transactionReference ? 'payment-reference-error' : undefined}
          />
        </div>
        <FieldError id="payment-reference-error" error={errors.transactionReference} />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="payment-date">
          Date de paiement
        </label>
        <input
          id="payment-date"
          type="date"
          className={errors.paymentDate ? 'form-control is-invalid' : 'form-control'}
          value={values.paymentDate}
          onChange={(event) => setField('paymentDate', event.target.value)}
          aria-invalid={errors.paymentDate ? true : undefined}
          aria-describedby={errors.paymentDate ? 'payment-date-error' : undefined}
        />
        <FieldError id="payment-date-error" error={errors.paymentDate} />
      </div>
    </div>
  );
};

const getCurrencyLabel = (value) => CURRENCIES[value]?.label ?? value;

export default PaymentSimulationForm;
