import { useZodForm } from '@/features/auth/hooks/useZodForm';
import { FormModal } from '@/components/core';
import { formatNumber } from '@/utils/format';
import { z } from 'zod';
import { FCFA_LABEL, TRANSACTION_SOURCES, TRANSACTION_SOURCE_VALUES } from '../constants/superAdminFinance.constants';

const DESTINATION_TYPES = [
  { value: 'client', label: 'Client' },
  { value: 'partner', label: 'Partenaire' },
  { value: 'platform', label: 'Plateforme' },
  { value: 'external', label: 'Externe' },
];

const transferSchema = z.object({
  destinationType: z.string().min(1, 'Le type de destination est requis.'),
  destination: z.string().trim().min(1, 'La destination est requise.').max(120, 'Destinataire trop long.'),
  amount: z.coerce
    .number()
    .positive('Le montant doit être supérieur à zéro.')
    .max(99_999_999_999, 'Montant trop élevé.'),
  sourceType: z.enum(TRANSACTION_SOURCE_VALUES).optional(),
  description: z.string().trim().min(1, 'La description est requise.').max(300, 'Description trop longue.'),
});

const transferDefaultValues = { destinationType: '', destination: '', amount: '', sourceType: '', description: '' };

const SOURCE_OPTIONS = Object.values(TRANSACTION_SOURCES).map((s) => ({ value: s.key, label: s.label }));

const SuperAdminTransferModal = ({ open, onClose, onSubmit, loading, error, availableBalance = 0 }) => {
  const form = useZodForm({
    schema: transferSchema,
    defaultValues: transferDefaultValues,
    onSubmit: async (values) => {
      const amt = Number(values.amount);
      if (amt > availableBalance) return;
      await onSubmit({
        amount: amt,
        destination: `${values.destinationType}: ${values.destination}`,
        sourceType: values.sourceType || undefined,
        description: values.description,
      });
    },
  });

  const enteredAmount = Number(form.values.amount) || 0;
  const exceedsBalance = enteredAmount > 0 && enteredAmount > availableBalance;

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Transférer des fonds"
      subtitle="Transférer des fonds vers une destination autorisée"
      icon="bi-arrow-left-right"
      size="md"
      onSubmit={form.handleSubmit}
      submitLabel="Transférer"
      submitIcon="bi-arrow-left-right"
      loading={loading}
      error={error || (exceedsBalance ? `Le montant dépasse le solde disponible (${formatNumber(availableBalance)} ${FCFA_LABEL}).` : '')}
    >
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="sa-transfer-destType">Type de destination</label>
          <select
            id="sa-transfer-destType"
            className={form.errors.destinationType ? 'form-select is-invalid' : 'form-select'}
            value={form.values.destinationType}
            onChange={(e) => form.setField('destinationType', e.target.value)}
            aria-invalid={form.errors.destinationType ? 'true' : undefined}
            aria-describedby={form.errors.destinationType ? 'sa-transfer-destType-error' : undefined}
          >
            <option value="">-- Sélectionner --</option>
            {DESTINATION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {form.errors.destinationType && (
            <div className="invalid-feedback d-block" id="sa-transfer-destType-error">{form.errors.destinationType}</div>
          )}
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="sa-transfer-destination">Destination</label>
          <input
            id="sa-transfer-destination"
            type="text"
            className={form.errors.destination ? 'form-control is-invalid' : 'form-control'}
            value={form.values.destination}
            onChange={(e) => form.setField('destination', e.target.value)}
            placeholder="Ex : CLT-ENT-002"
            aria-invalid={form.errors.destination ? 'true' : undefined}
            aria-describedby={form.errors.destination ? 'sa-transfer-destination-error' : undefined}
          />
          {form.errors.destination && (
            <div className="invalid-feedback d-block" id="sa-transfer-destination-error">{form.errors.destination}</div>
          )}
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="sa-transfer-amount">Montant (FCFA)</label>
          <input
            id="sa-transfer-amount"
            type="number"
            min="1"
            className={form.errors.amount || exceedsBalance ? 'form-control is-invalid' : 'form-control'}
            value={form.values.amount}
            onChange={(e) => form.setField('amount', e.target.value)}
            placeholder="Ex : 3000000"
            aria-invalid={form.errors.amount || exceedsBalance ? 'true' : undefined}
            aria-describedby="sa-transfer-amount-error sa-transfer-amount-hint"
          />
          <small className="form-text text-secondary" id="sa-transfer-amount-hint">
            Solde disponible : {formatNumber(availableBalance)} {FCFA_LABEL}
          </small>
          {form.errors.amount && (
            <div className="invalid-feedback d-block" id="sa-transfer-amount-error">{form.errors.amount}</div>
          )}
          {!form.errors.amount && exceedsBalance && (
            <div className="invalid-feedback d-block" id="sa-transfer-amount-error">
              Le montant ne peut pas dépasser le solde disponible.
            </div>
          )}
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="sa-transfer-sourceType">Type de source</label>
          <select
            id="sa-transfer-sourceType"
            className={form.errors.sourceType ? 'form-select is-invalid' : 'form-select'}
            value={form.values.sourceType}
            onChange={(e) => form.setField('sourceType', e.target.value)}
            aria-invalid={form.errors.sourceType ? 'true' : undefined}
          >
            <option value="">-- Sélectionner --</option>
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="sa-transfer-description">Description</label>
          <textarea
            id="sa-transfer-description"
            className={form.errors.description ? 'form-control is-invalid' : 'form-control'}
            value={form.values.description}
            onChange={(e) => form.setField('description', e.target.value)}
            rows={3}
            placeholder="Motif du transfert..."
            aria-invalid={form.errors.description ? 'true' : undefined}
            aria-describedby={form.errors.description ? 'sa-transfer-description-error' : undefined}
          />
          {form.errors.description && (
            <div className="invalid-feedback d-block" id="sa-transfer-description-error">{form.errors.description}</div>
          )}
        </div>
      </div>
    </FormModal>
  );
};

export default SuperAdminTransferModal;
