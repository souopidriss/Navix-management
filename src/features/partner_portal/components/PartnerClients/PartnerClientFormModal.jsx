/**
 * Navix Partner Portal — PartnerClientFormModal (PROMPT 065)
 * --------------------------------------------------------------------------
 * Modale de création / édition d'un client partenaire. Champs : Type
 * (Entreprise / Particulier), Nom / raison sociale, Email, Téléphone, Adresse,
 * Ville, Pays, Contact principal et Notes. Le statut n'est pas modifiable ici :
 * il évolue via l'archivage (désactivation douce) et la réactivation métier.
 * Le `companyId` / `partnerId` ne sont jamais des champs de formulaire :
 * ils sont toujours appliqués côté service (isolation multi-tenant).
 */
import { Divider } from '@/components/ui';
import { FormModal } from '@/components/core';
import { useZodForm } from '@/features/auth';
import {
  partnerClientSchema,
  partnerClientDefaultValues,
  toPartnerClientFormValues,
  toPartnerClientPayload,
} from '../../schemas/partnerClient.schema';
import {
  PARTNER_CLIENT_TYPES,
  PARTNER_CLIENT_TYPE_VALUES,
  PARTNER_CLIENT_CITIES,
} from '../../constants/partner.constants';

const toLabelOptions = (values, meta) => values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const TextField = ({ id, label, value, onChange, error, hint, placeholder, type = 'text', inputMode, list }) => (
  <div>
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <input
      id={id}
      type={type}
      inputMode={inputMode}
      list={list}
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

const SelectField = ({ id, label, value, onChange, options, placeholder = 'Sélectionner…', error }) => (
  <div>
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <select
      id={id}
      className={error ? 'form-select is-invalid' : 'form-select'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-invalid={error ? true : undefined}
    >
      {placeholder && (
        <option value="" disabled hidden>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <div className="invalid-feedback d-block" id={`${id}-error`}>
        {error}
      </div>
    )}
  </div>
);

const TextAreaField = ({ id, label, value, onChange, rows = 3, placeholder }) => (
  <div>
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <textarea
      id={id}
      className="form-control"
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  </div>
);

const PartnerClientFormModal = ({ open, onClose, client, onSubmit, loading, error }) => {
  const isEditing = Boolean(client);

  const defaults = isEditing ? toPartnerClientFormValues(client) : partnerClientDefaultValues;

  const form = useZodForm({
    schema: partnerClientSchema,
    defaultValues: defaults,
    onSubmit: async (values) => {
      await onSubmit(toPartnerClientPayload(values));
    },
  });

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier le client' : 'Nouveau client'}
      subtitle={isEditing ? client?.reference : 'Ajoutez un nouveau client à votre portefeuille.'}
      icon="bi-people"
      size="lg"
      onSubmit={form.handleSubmit}
      loading={loading}
      error={error}
      submitLabel={isEditing ? 'Enregistrer les modifications' : 'Créer le client'}
    >
      <datalist id="partner-client-cities-list">
        {PARTNER_CLIENT_CITIES.map((city) => (
          <option key={city} value={city} />
        ))}
      </datalist>

      <div className="row g-3">
        <div className="col-12">
          <Divider>Identification</Divider>
        </div>
        <div className="col-12 col-md-4">
          <SelectField
            id="partner-client-type"
            label="Type de client"
            value={form.values.type}
            onChange={(value) => form.setField('type', value)}
            options={toLabelOptions(PARTNER_CLIENT_TYPE_VALUES, PARTNER_CLIENT_TYPES)}
            placeholder="Sélectionner…"
            error={form.errors.type}
          />
        </div>
        <div className="col-12 col-md-8">
          <TextField
            id="partner-client-name"
            label="Nom / raison sociale"
            value={form.values.name}
            onChange={(value) => form.setField('name', value)}
            error={form.errors.name}
            placeholder="Ex. Transports Express Cameroun"
          />
        </div>

        <div className="col-12">
          <Divider>Coordonnées</Divider>
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="partner-client-email"
            label="Email"
            type="email"
            value={form.values.email}
            onChange={(value) => form.setField('email', value)}
            error={form.errors.email}
            placeholder="Ex. contact@entreprise.cm"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="partner-client-phone"
            label="Téléphone"
            type="tel"
            value={form.values.phone}
            onChange={(value) => form.setField('phone', value)}
            error={form.errors.phone}
            placeholder="Ex. +237 6 90 11 22 33"
          />
        </div>
        <div className="col-12">
          <TextField
            id="partner-client-address"
            label="Adresse"
            value={form.values.address}
            onChange={(value) => form.setField('address', value)}
            placeholder="Ex. Quartier Akwa, Rue Joffre"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="partner-client-city"
            label="Ville"
            value={form.values.city}
            onChange={(value) => form.setField('city', value)}
            error={form.errors.city}
            list="partner-client-cities-list"
            placeholder="Ex. Douala"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="partner-client-country"
            label="Pays"
            value={form.values.country}
            onChange={(value) => form.setField('country', value)}
            placeholder="Cameroun"
          />
        </div>

        <div className="col-12">
          <Divider>Contact principal</Divider>
        </div>
        <div className="col-12">
          <TextField
            id="partner-client-contact"
            label="Nom du contact principal"
            value={form.values.contactName}
            onChange={(value) => form.setField('contactName', value)}
            placeholder="Ex. Bertrand Tchoumi"
          />
        </div>
        <div className="col-12">
          <TextAreaField
            id="partner-client-notes"
            label="Notes"
            value={form.values.notes}
            onChange={(value) => form.setField('notes', value)}
            placeholder="Segments, contrats, informations complémentaires…"
          />
        </div>
      </div>
    </FormModal>
  );
};

export default PartnerClientFormModal;
