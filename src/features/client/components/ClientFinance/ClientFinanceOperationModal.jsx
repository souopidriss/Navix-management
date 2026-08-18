/**
 * Navix Client Finance — ClientFinanceOperationModal
 * --------------------------------------------------------------------------
 * Modale de saisie d'une opération financière (FCFA) : dépôt (entrée) ou
 * retrait / transfert / transaction sortante (sortie). Réutilise le catalogue
 * PAYMENT_METHODS du module Billing et valide via les schémas Zod. La
 * référence est générée côté service et affichée en lecture seule.
 */
import { FormModal } from '@/components/core';
import { Divider } from '@/components/ui';
import { useZodForm } from '@/features/auth';
import { PAYMENT_METHODS, PAYMENT_METHOD_VALUES } from '@/features/billing/constants';
import { formatNumber } from '@/utils/format';
import {
  depositSchema,
  depositDefaultValues,
  outgoingSchema,
  outgoingDefaultValues,
} from '../../schemas/clientFinance.schemas';
import { FCFA_LABEL } from '../../constants/client.constants';

const META = {
  deposit: {
    title: 'Ajouter des fonds',
    subtitle: 'Créditez votre portefeuille (FCFA).',
    icon: 'bi-plus-circle',
    submitLabel: 'Vérifier le dépôt',
  },
  withdrawal: {
    title: 'Retirer des fonds',
    subtitle: 'Sortie d’argent vers une caisse ou un tiers.',
    icon: 'bi-arrow-up-circle',
    submitLabel: 'Vérifier le retrait',
  },
  transfer: {
    title: 'Transférer des fonds',
    subtitle: 'Transférez de la trésorerie vers une agence.',
    icon: 'bi-arrow-left-right',
    submitLabel: 'Vérifier le transfert',
  },
  payment: {
    title: 'Effectuer une transaction',
    subtitle: 'Réglez une facture ou effectuez un paiement.',
    icon: 'bi-cash-coin',
    submitLabel: 'Vérifier la transaction',
  },
};

const TextField = ({ id, label, value, onChange, error, hint, placeholder, type = 'text', inputMode }) => (
  <div>
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <input
      id={id}
      type={type}
      inputMode={inputMode}
      className={error ? 'form-control is-invalid' : 'form-control'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
    />
    {error ? (
      <div className="invalid-feedback d-block" id={`${id}-error`}>
        {error}
      </div>
    ) : hint ? (
      <small className="form-text text-secondary" id={`${id}-hint`}>
        {hint}
      </small>
    ) : null}
  </div>
);

const SelectField = ({ id, label, value, onChange, options, hint }) => (
  <div>
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <select id={id} className="form-select" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {hint && <small className="form-text text-secondary">{hint}</small>}
  </div>
);

const TextAreaField = ({ id, label, value, onChange, error, rows = 3, placeholder }) => (
  <div>
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <textarea
      id={id}
      className={error ? 'form-control is-invalid' : 'form-control'}
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-invalid={error ? true : undefined}
    />
    {error && (
      <div className="invalid-feedback d-block" id={`${id}-error`}>
        {error}
      </div>
    )}
  </div>
);

const ClientFinanceOperationModal = ({
  open,
  onClose,
  mode = 'deposit',
  availableBalance = 0,
  reference = '',
  onSubmit,
  loading = false,
  error = '',
}) => {
  const isDeposit = mode === 'deposit';
  const meta = META[mode] || META.deposit;

  const form = useZodForm({
    schema: isDeposit ? depositSchema : outgoingSchema,
    defaultValues: isDeposit
      ? depositDefaultValues
      : { ...outgoingDefaultValues, type: mode },
    onSubmit: (values) => {
      if (isDeposit) {
        onSubmit({ amount: Number(values.amount), method: values.method, source: values.source || '', description: values.description });
      } else {
        onSubmit({ type: mode, amount: Number(values.amount), method: values.method, recipient: values.recipient, description: values.description });
      }
    },
  });

  const methodOptions = PAYMENT_METHOD_VALUES.map((value) => ({
    value,
    label: PAYMENT_METHODS[value].label,
  }));

  return (
    <FormModal
      key={`${mode}-${open}`}
      open={open}
      onClose={onClose}
      title={meta.title}
      subtitle={meta.subtitle}
      icon={meta.icon}
      size="lg"
      onSubmit={form.handleSubmit}
      loading={loading}
      error={error}
      submitLabel={meta.submitLabel}
    >
      <div className="row g-3">
        <div className="col-12">
          <Divider>{isDeposit ? 'Entrée de fonds' : 'Sortie de fonds'}</Divider>
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-finance-amount"
            label="Montant"
            type="number"
            inputMode="numeric"
            value={form.values.amount}
            onChange={(value) => form.setField('amount', value)}
            error={form.errors.amount}
            hint={`Montant en ${FCFA_LABEL}`}
            placeholder="0"
          />
        </div>
        <div className="col-12 col-md-6">
          <SelectField
            id="client-finance-method"
            label="Moyen de paiement"
            value={form.values.method}
            onChange={(value) => form.setField('method', value)}
            options={methodOptions}
            hint={isDeposit ? 'Simulé — aucune opération bancaire réelle.' : 'Simulé — aucune opération bancaire réelle.'}
          />
        </div>

        {isDeposit ? (
          <div className="col-12">
            <TextField
              id="client-finance-source"
              label="Source des fonds"
              value={form.values.source}
              onChange={(value) => form.setField('source', value)}
              error={form.errors.source}
              placeholder="Ex. Banque Atlantique Cameroun — Douala"
            />
          </div>
        ) : (
          <div className="col-12">
            <TextField
              id="client-finance-recipient"
              label="Destinataire"
              value={form.values.recipient}
              onChange={(value) => form.setField('recipient', value)}
              error={form.errors.recipient}
              placeholder={mode === 'transfer' ? 'Ex. Agence Yaoundé' : 'Ex. Caisse flotte — Douala'}
            />
          </div>
        )}

        <div className="col-12">
          <TextAreaField
            id="client-finance-description"
            label="Description"
            value={form.values.description}
            onChange={(value) => form.setField('description', value)}
            error={form.errors.description}
            rows={2}
            placeholder="Motif de l’opération…"
          />
        </div>

        <div className="col-12">
          <Divider>Informations</Divider>
        </div>
        {!isDeposit && (
          <div className="col-12">
            <small className="text-secondary d-flex align-items-center gap-2">
              <i className="bi bi-wallet2" aria-hidden="true" />
              Solde disponible : <strong className="tabular-nums">{formatNumber(availableBalance)} {FCFA_LABEL}</strong>
            </small>
          </div>
        )}
        {reference && (
          <div className="col-12">
            <small className="text-secondary d-flex align-items-center gap-2">
              <i className="bi bi-upc-scan" aria-hidden="true" />
              Référence (auto) : <strong className="font-monospace">{reference}</strong>
            </small>
          </div>
        )}
      </div>
    </FormModal>
  );
};

export default ClientFinanceOperationModal;
