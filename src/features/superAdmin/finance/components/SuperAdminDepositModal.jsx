import { useZodForm } from '@/features/auth/hooks/useZodForm';
import { FormModal } from '@/components/core';
import { TRANSACTION_SOURCES } from '../constants/superAdminFinance.constants';
import { saDepositSchema, saDepositDefaultValues } from '../schemas/superAdminFinance.schema';

const SOURCE_OPTIONS = Object.values(TRANSACTION_SOURCES).map((s) => ({ value: s.key, label: s.label }));

const SuperAdminDepositModal = ({ open, onClose, onSubmit, loading, error }) => {
  const form = useZodForm({
    schema: saDepositSchema,
    defaultValues: saDepositDefaultValues,
    onSubmit: async (values) => {
      await onSubmit({
        amount: Number(values.amount),
        source: values.source || undefined,
        sourceType: values.sourceType || undefined,
        description: values.description,
      });
    },
  });

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Alimenter les fonds"
      subtitle="Ajouter des fonds au portefeuille plateforme"
      icon="bi-arrow-down-circle"
      size="md"
      onSubmit={form.handleSubmit}
      submitLabel="Alimenter"
      submitIcon="bi-arrow-down-circle"
      loading={loading}
      error={error}
    >
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label" htmlFor="sa-deposit-amount">Montant (FCFA)</label>
          <input
            id="sa-deposit-amount"
            type="number"
            min="1"
            className={form.errors.amount ? 'form-control is-invalid' : 'form-control'}
            value={form.values.amount}
            onChange={(e) => form.setField('amount', e.target.value)}
            placeholder="Ex : 5000000"
            aria-invalid={form.errors.amount ? 'true' : undefined}
            aria-describedby={form.errors.amount ? 'sa-deposit-amount-error' : undefined}
          />
          {form.errors.amount && (
            <div className="invalid-feedback d-block" id="sa-deposit-amount-error">{form.errors.amount}</div>
          )}
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="sa-deposit-source">Source</label>
          <input
            id="sa-deposit-source"
            type="text"
            className={form.errors.source ? 'form-control is-invalid' : 'form-control'}
            value={form.values.source}
            onChange={(e) => form.setField('source', e.target.value)}
            placeholder="Ex : Banque Atlantique"
            aria-invalid={form.errors.source ? 'true' : undefined}
          />
          {form.errors.source && (
            <div className="invalid-feedback d-block">{form.errors.source}</div>
          )}
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="sa-deposit-sourceType">Type de source</label>
          <select
            id="sa-deposit-sourceType"
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
          {form.errors.sourceType && (
            <div className="invalid-feedback d-block">{form.errors.sourceType}</div>
          )}
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="sa-deposit-description">Description</label>
          <textarea
            id="sa-deposit-description"
            className={form.errors.description ? 'form-control is-invalid' : 'form-control'}
            value={form.values.description}
            onChange={(e) => form.setField('description', e.target.value)}
            rows={3}
            placeholder="Motif du dépôt..."
            aria-invalid={form.errors.description ? 'true' : undefined}
            aria-describedby={form.errors.description ? 'sa-deposit-description-error' : undefined}
          />
          {form.errors.description && (
            <div className="invalid-feedback d-block" id="sa-deposit-description-error">{form.errors.description}</div>
          )}
        </div>
      </div>
    </FormModal>
  );
};

export default SuperAdminDepositModal;
