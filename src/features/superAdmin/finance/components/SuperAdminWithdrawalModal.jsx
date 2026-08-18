import { useZodForm } from '@/features/auth/hooks/useZodForm';
import { FormModal } from '@/components/core';
import { formatNumber } from '@/utils/format';
import { z } from 'zod';
import { FCFA_LABEL } from '../constants/superAdminFinance.constants';

const withdrawalSchema = z.object({
  amount: z.coerce
    .number()
    .positive('Le montant doit être supérieur à zéro.')
    .max(99_999_999_999, 'Montant trop élevé.'),
  destination: z.string().trim().min(1, 'La destination est requise.').max(120, 'Destinataire trop long.'),
  description: z.string().trim().min(1, 'La description est requise.').max(300, 'Description trop longue.'),
});

const withdrawalDefaultValues = { amount: '', destination: '', description: '' };

const SuperAdminWithdrawalModal = ({ open, onClose, onSubmit, loading, error, availableBalance = 0 }) => {
  const form = useZodForm({
    schema: withdrawalSchema,
    defaultValues: withdrawalDefaultValues,
    onSubmit: async (values) => {
      const amt = Number(values.amount);
      if (amt > availableBalance) {
        return;
      }
      await onSubmit({
        amount: amt,
        destination: values.destination,
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
      title="Retirer des fonds"
      subtitle="Retirer des fonds du portefeuille plateforme"
      icon="bi-arrow-up-circle"
      size="md"
      onSubmit={form.handleSubmit}
      submitLabel="Retirer"
      submitIcon="bi-arrow-up-circle"
      loading={loading}
      error={error || (exceedsBalance ? `Le montant dépasse le solde disponible (${formatNumber(availableBalance)} ${FCFA_LABEL}).` : '')}
    >
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label" htmlFor="sa-withdraw-amount">Montant (FCFA)</label>
          <input
            id="sa-withdraw-amount"
            type="number"
            min="1"
            className={form.errors.amount || exceedsBalance ? 'form-control is-invalid' : 'form-control'}
            value={form.values.amount}
            onChange={(e) => form.setField('amount', e.target.value)}
            placeholder="Ex : 2000000"
            aria-invalid={form.errors.amount || exceedsBalance ? 'true' : undefined}
            aria-describedby="sa-withdraw-amount-error sa-withdraw-amount-hint"
          />
          <small className="form-text text-secondary" id="sa-withdraw-amount-hint">
            Solde disponible : {formatNumber(availableBalance)} {FCFA_LABEL}
          </small>
          {form.errors.amount && (
            <div className="invalid-feedback d-block" id="sa-withdraw-amount-error">{form.errors.amount}</div>
          )}
          {!form.errors.amount && exceedsBalance && (
            <div className="invalid-feedback d-block" id="sa-withdraw-amount-error">
              Le montant ne peut pas dépasser le solde disponible.
            </div>
          )}
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="sa-withdraw-destination">Destination</label>
          <input
            id="sa-withdraw-destination"
            type="text"
            className={form.errors.destination ? 'form-control is-invalid' : 'form-control'}
            value={form.values.destination}
            onChange={(e) => form.setField('destination', e.target.value)}
            placeholder="Ex : Banque Atlantique — Compte pro"
            aria-invalid={form.errors.destination ? 'true' : undefined}
            aria-describedby={form.errors.destination ? 'sa-withdraw-destination-error' : undefined}
          />
          {form.errors.destination && (
            <div className="invalid-feedback d-block" id="sa-withdraw-destination-error">{form.errors.destination}</div>
          )}
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="sa-withdraw-description">Description</label>
          <textarea
            id="sa-withdraw-description"
            className={form.errors.description ? 'form-control is-invalid' : 'form-control'}
            value={form.values.description}
            onChange={(e) => form.setField('description', e.target.value)}
            rows={3}
            placeholder="Motif du retrait..."
            aria-invalid={form.errors.description ? 'true' : undefined}
            aria-describedby={form.errors.description ? 'sa-withdraw-description-error' : undefined}
          />
          {form.errors.description && (
            <div className="invalid-feedback d-block" id="sa-withdraw-description-error">{form.errors.description}</div>
          )}
        </div>
      </div>
    </FormModal>
  );
};

export default SuperAdminWithdrawalModal;
