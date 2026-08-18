/**
 * Navix Partner Portal — PartnerContractFormModal (PROMPT 073)
 * --------------------------------------------------------------------------
 * Modale de création / modification d'un contrat partenaire.
 * Suit le pattern PartnerClientFormModal : FormModal + useZodForm + champs inline.
 */
import { Divider } from '@/components/ui';
import { FormModal } from '@/components/core';
import { useZodForm } from '@/features/auth';
import {
  partnerContractSchema,
} from '../../schemas/partnerContract.schema';
import {
  PARTNER_CONTRACT_TYPE_KEYS,
  PARTNER_CONTRACT_TYPES,
  PARTNER_CONTRACT_CATEGORIES,
  PARTNER_BILLING_FREQUENCY_KEYS,
  PARTNER_BILLING_FREQUENCIES,
} from '../../constants/partner.constants';
import { MOCK_PARTNER_CLIENTS } from '../../mocks/partner.mock';

const toLabelOptions = (keys, meta) => keys.map((k) => ({ value: k, label: meta[k]?.label || k }));

const clientOptions = (MOCK_PARTNER_CLIENTS || []).map((c) => ({ value: c.id, label: c.name }));

const TextField = ({ id, label, value, onChange, error, hint, placeholder, type = 'text', min, required }) => (
  <div>
    <label className="form-label" htmlFor={id}>
      {label} {required && <span className="text-danger">*</span>}
    </label>
    <input
      id={id}
      type={type}
      className={`form-control ${error ? 'is-invalid' : ''}`}
      value={value ?? ''}
      onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      placeholder={placeholder}
      min={min}
    />
    {hint && <div className="form-text">{hint}</div>}
    {error && <div className="invalid-feedback">{error}</div>}
  </div>
);

const SelectField = ({ id, label, value, onChange, error, options, placeholder, required }) => (
  <div>
    <label className="form-label" htmlFor={id}>
      {label} {required && <span className="text-danger">*</span>}
    </label>
    <select
      id={id}
      className={`form-select ${error ? 'is-invalid' : ''}`}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <div className="invalid-feedback">{error}</div>}
  </div>
);

const CheckboxField = ({ id, label, checked, onChange }) => (
  <div className="form-check">
    <input
      id={id}
      type="checkbox"
      className="form-check-input"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <label className="form-check-label" htmlFor={id}>{label}</label>
  </div>
);

const defaultValues = {
  clientId: '',
  type: 'transport',
  category: 'transport',
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  value: 0,
  billingFrequency: 'monthly',
  renewalType: 'manual',
  autoRenew: false,
};

const PartnerContractFormModal = ({
  open,
  onClose,
  contract = null,
  onSubmit,
  loading = false,
  error = null,
}) => {
  const isEdit = Boolean(contract?.id);

  const defaults = isEdit
    ? {
        clientId: contract.clientId || '',
        type: contract.type || 'transport',
        category: contract.category || 'transport',
        title: contract.title || '',
        description: contract.description || '',
        startDate: contract.startDate || '',
        endDate: contract.endDate || '',
        value: contract.value || 0,
        billingFrequency: contract.billingFrequency || 'monthly',
        renewalType: contract.renewalType || 'manual',
        autoRenew: contract.autoRenew ?? false,
      }
    : defaultValues;

  const form = useZodForm({
    schema: partnerContractSchema,
    defaultValues: defaults,
    onSubmit: async (values) => {
      const client = (MOCK_PARTNER_CLIENTS || []).find((c) => c.id === values.clientId);
      await onSubmit({ ...values, clientName: client?.name || '' });
    },
  });

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEdit ? `Modifier — ${contract.reference}` : 'Nouveau contrat'}
      subtitle={isEdit ? 'Modifier les informations du contrat.' : 'Créez un nouveau contrat de prestation.'}
      icon="bi-file-earmark-text"
      size="lg"
      onSubmit={form.handleSubmit}
      loading={loading}
      error={error}
      submitLabel={isEdit ? 'Enregistrer' : 'Créer le contrat'}
    >
      <div className="row g-3">
        <div className="col-12">
          <Divider>Identification</Divider>
        </div>
        <div className="col-12 col-md-6">
          <SelectField
            id="ctr-clientId"
            label="Client"
            value={form.values.clientId}
            onChange={(v) => form.setField('clientId', v)}
            options={clientOptions}
            placeholder="Sélectionner un client…"
            error={form.errors.clientId}
            required
          />
        </div>
        <div className="col-12 col-md-6">
          <SelectField
            id="ctr-type"
            label="Type"
            value={form.values.type}
            onChange={(v) => form.setField('type', v)}
            options={toLabelOptions(PARTNER_CONTRACT_TYPE_KEYS, PARTNER_CONTRACT_TYPES)}
            error={form.errors.type}
            required
          />
        </div>
        <div className="col-12">
          <TextField
            id="ctr-title"
            label="Titre"
            value={form.values.title}
            onChange={(v) => form.setField('title', v)}
            error={form.errors.title}
            placeholder="Ex : Contrat transport — Client XYZ"
            required
          />
        </div>
        <div className="col-12">
          <TextField
            id="ctr-description"
            label="Description"
            value={form.values.description}
            onChange={(v) => form.setField('description', v)}
            placeholder="Description du contrat…"
          />
        </div>

        <div className="col-12">
          <Divider>Dates & Valeur</Divider>
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="ctr-startDate"
            label="Date de début"
            type="date"
            value={form.values.startDate}
            onChange={(v) => form.setField('startDate', v)}
            error={form.errors.startDate}
            required
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="ctr-endDate"
            label="Date de fin"
            type="date"
            value={form.values.endDate}
            onChange={(v) => form.setField('endDate', v)}
            error={form.errors.endDate}
            required
          />
        </div>
        <div className="col-12 col-md-4">
          <TextField
            id="ctr-value"
            label="Valeur totale (FCFA)"
            type="number"
            min={0}
            value={form.values.value}
            onChange={(v) => form.setField('value', v)}
            error={form.errors.value}
            required
          />
        </div>
        <div className="col-12 col-md-4">
          <SelectField
            id="ctr-billingFrequency"
            label="Fréquence facturation"
            value={form.values.billingFrequency}
            onChange={(v) => form.setField('billingFrequency', v)}
            options={toLabelOptions(PARTNER_BILLING_FREQUENCY_KEYS, PARTNER_BILLING_FREQUENCIES)}
            error={form.errors.billingFrequency}
            required
          />
        </div>
        <div className="col-12 col-md-4">
          <SelectField
            id="ctr-renewalType"
            label="Renouvellement"
            value={form.values.renewalType}
            onChange={(v) => form.setField('renewalType', v)}
            options={[
              { value: 'automatic', label: 'Automatique' },
              { value: 'manual', label: 'Manuel' },
            ]}
            error={form.errors.renewalType}
            required
          />
        </div>

        <div className="col-12 mt-2">
          <CheckboxField
            id="ctr-autoRenew"
            label="Renouvellement automatique"
            checked={form.values.autoRenew}
            onChange={(v) => form.setField('autoRenew', v)}
          />
        </div>
      </div>
    </FormModal>
  );
};

export default PartnerContractFormModal;
