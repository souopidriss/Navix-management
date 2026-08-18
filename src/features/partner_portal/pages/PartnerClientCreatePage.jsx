/**
 * Navix Partner Portal — PartnerClientCreatePage (PROMPT 065 — CLIENTS PARTENAIRE · PREMIUM)
 * --------------------------------------------------------------------------
 * Page de création d'un client partenaire à partir de /partner/clients/new :
 *   HEADER « Nouveau client » + breadcrumbs (Espace Partenaire > Clients)
 *   → Formulaire complet (Zod, noValidate) : Type (Entreprise / Particulier),
 *     Nom / raison sociale, Email, Téléphone, Adresse, Ville, Pays, Contact
 *     principal et Notes.
 *   → À la création : redirection vers le détail du client créé.
 *
 * Multi-tenant : le service applique toujours companyId + partnerId du
 * partenaire — jamais depuis l'UI. RBAC : l'accès à la page est gardé par la
 * route (ROUTE_META → PARTNER_CLIENTS_CREATE) et le bouton de soumission est
 * conditionné par <Can>.
 */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button, Divider } from '@/components/ui';
import { PageContainer, PageHeader, ErrorState } from '@/components/core';
import { Can } from '@/features/rbac/components';
import { PERMISSIONS } from '@/features/rbac/constants';
import { ROUTES, partnerClientDetailPath } from '@/routes/route.constants';
import { useZodForm } from '@/features/auth';
import {
  partnerClientSchema,
  partnerClientDefaultValues,
  toPartnerClientPayload,
} from '../schemas/partnerClient.schema';
import {
  PARTNER_CLIENT_TYPES,
  PARTNER_CLIENT_TYPE_VALUES,
  PARTNER_CLIENT_CITIES,
} from '../constants/partner.constants';
import { partnerClientService } from '../services/partnerClientService';
import '../components/PartnerClients/PartnerClients.css';

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

const PartnerClientCreatePage = () => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');

  const form = useZodForm({
    schema: partnerClientSchema,
    defaultValues: partnerClientDefaultValues,
    onSubmit: async (values) => {
      setSubmitError('');
      try {
        const created = await partnerClientService.createClient(toPartnerClientPayload(values));
        toast.success('Client créé avec succès.');
        navigate(partnerClientDetailPath(created.id));
      } catch (err) {
        setSubmitError(err?.message || 'Impossible de créer le client.');
      }
    },
  });

  return (
    <PageContainer>
      <Helmet>
        <title>Nouveau client — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title="Nouveau client"
        subtitle="Ajoutez un nouveau client à votre portefeuille partenaire."
        icon="bi-person-plus"
        breadcrumbs={[
          { label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD },
          { label: 'Clients', to: ROUTES.PARTNER_CLIENTS },
          { label: 'Nouveau client' },
        ]}
        actions={
          <Button variant="outline" size="sm" icon="bi-arrow-left" onClick={() => navigate(ROUTES.PARTNER_CLIENTS)}>
            Retour
          </Button>
        }
      />

      <form onSubmit={form.handleSubmit} noValidate>
        <div className="navix-card p-4">
          {submitError && (
            <ErrorState icon="bi-exclamation-triangle" title="Échec de la création" description={submitError} />
          )}

          <datalist id="partner-client-create-cities">
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
                id="partner-client-create-type"
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
                id="partner-client-create-name"
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
                id="partner-client-create-email"
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
                id="partner-client-create-phone"
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
                id="partner-client-create-address"
                label="Adresse"
                value={form.values.address}
                onChange={(value) => form.setField('address', value)}
                placeholder="Ex. Quartier Akwa, Rue Joffre"
              />
            </div>
            <div className="col-12 col-md-6">
              <TextField
                id="partner-client-create-city"
                label="Ville"
                value={form.values.city}
                onChange={(value) => form.setField('city', value)}
                error={form.errors.city}
                list="partner-client-create-cities"
                placeholder="Ex. Douala"
              />
            </div>
            <div className="col-12 col-md-6">
              <TextField
                id="partner-client-create-country"
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
                id="partner-client-create-contact"
                label="Nom du contact principal"
                value={form.values.contactName}
                onChange={(value) => form.setField('contactName', value)}
                placeholder="Ex. Bertrand Tchoumi"
              />
            </div>
            <div className="col-12">
              <TextAreaField
                id="partner-client-create-notes"
                label="Notes"
                value={form.values.notes}
                onChange={(value) => form.setField('notes', value)}
                placeholder="Segments, contrats, informations complémentaires…"
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 border-top border-secondary-subtle mt-4 pt-3">
            <Button variant="outline" onClick={() => navigate(ROUTES.PARTNER_CLIENTS)}>
              Annuler
            </Button>
            <Can permission={PERMISSIONS.PARTNER_CLIENTS_CREATE}>
              <Button variant="primary" type="submit" icon="bi-check2-circle">
                Créer le client
              </Button>
            </Can>
          </div>
        </div>
      </form>
    </PageContainer>
  );
};

export default PartnerClientCreatePage;
