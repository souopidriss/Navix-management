/**
 * Navix Partner Portal — PartnerMissionCreatePage (PROMPT 064 — MISSIONS &
 * PRESTATIONS PARTENAIRE · PREMIUM)
 * --------------------------------------------------------------------------
 * Page de création d'une mission partenaire à partir de /partner/missions/new :
 *   HEADER « Nouvelle mission » + breadcrumbs (Espace Partenaire > Missions)
 *   → Formulaire complet (Zod, noValidate) : Titre, Type de prestation,
 *     Client (nom/contact/téléphone), Véhicule (marque/modèle/immatriculation),
 *     Chauffeur, Trajet (départ/destination/distance), Dates (début/fin),
 *     Montant FCFA et notes.
 *   → À la création : redirection vers le détail de la mission créée.
 *
 * Multi-tenant : le service applique toujours companyId = cmp_partner_navix —
 * jamais depuis l'UI. RBAC : l'accès à la page est gardé par la route
 * (ROUTE_META → PARTNER_MISSIONS_CREATE) et le bouton de soumission est
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
import { ROUTES, partnerMissionDetailPath } from '@/routes/route.constants';
import { useZodForm } from '@/features/auth';
import {
  partnerMissionSchema,
  partnerMissionDefaultValues,
  toPartnerMissionPayload,
} from '../schemas/partnerMission.schema';
import {
  PARTNER_MISSION_TYPES,
  PARTNER_MISSION_TYPE_VALUES,
  getPartnerMissionStatus,
} from '../constants/partner.constants';
import { partnerMissionService } from '../services/partnerMissionService';
import '../components/PartnerMissions/PartnerMissions.css';

const toLabelOptions = (values, meta) => values.map((value) => ({ value, label: meta[value]?.label ?? value }));

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

const PartnerMissionCreatePage = () => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');

  const form = useZodForm({
    schema: partnerMissionSchema,
    defaultValues: partnerMissionDefaultValues,
    onSubmit: async (values) => {
      setSubmitError('');
      try {
        const created = await partnerMissionService.createMission(toPartnerMissionPayload(values));
        toast.success('Mission créée avec succès.');
        navigate(partnerMissionDetailPath(created.id));
      } catch (err) {
        setSubmitError(err?.message || 'Impossible de créer la mission.');
      }
    },
  });

  const statusMeta = getPartnerMissionStatus(form.values.status);

  return (
    <PageContainer>
      <Helmet>
        <title>Nouvelle mission — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title="Nouvelle mission"
        subtitle="Planifiez une nouvelle prestation partenaire et affectez les ressources nécessaires."
        icon="bi-signpost-split"
        breadcrumbs={[
          { label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD },
          { label: 'Missions', to: ROUTES.PARTNER_MISSIONS },
          { label: 'Nouvelle mission' },
        ]}
        actions={
          <Button variant="outline" size="sm" icon="bi-arrow-left" onClick={() => navigate(ROUTES.PARTNER_MISSIONS)}>
            Retour
          </Button>
        }
      />

      <form onSubmit={form.handleSubmit} noValidate>
        <div className="navix-card p-4">
          {submitError && (
            <ErrorState
              icon="bi-exclamation-triangle"
              title="Échec de la création"
              description={submitError}
            />
          )}

          <div className="row g-3">
            <div className="col-12">
              <Divider>Identification</Divider>
            </div>
            <div className="col-12 col-md-8">
              <TextField
                id="partner-mission-title"
                label="Titre de la mission"
                value={form.values.title}
                onChange={(value) => form.setField('title', value)}
                error={form.errors.title}
                placeholder="Ex. Transport logistique Douala → Yaoundé"
              />
            </div>
            <div className="col-12 col-md-4">
              <SelectField
                id="partner-mission-type"
                label="Type de prestation"
                value={form.values.type}
                onChange={(value) => form.setField('type', value)}
                options={toLabelOptions(PARTNER_MISSION_TYPE_VALUES, PARTNER_MISSION_TYPES)}
                placeholder="Sélectionner…"
                error={form.errors.type}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="partner-mission-status">
                Statut
              </label>
              <input id="partner-mission-status" className="form-control" value={statusMeta.label} disabled />
            </div>

            <div className="col-12">
              <Divider>Client</Divider>
            </div>
            <div className="col-12 col-md-4">
              <TextField
                id="partner-mission-client"
                label="Client"
                value={form.values.client}
                onChange={(value) => form.setField('client', value)}
                error={form.errors.client}
                placeholder="Ex. TEC Cameroun SARL"
              />
            </div>
            <div className="col-12 col-md-4">
              <TextField
                id="partner-mission-client-contact"
                label="Contact client"
                value={form.values.clientContact}
                onChange={(value) => form.setField('clientContact', value)}
                placeholder="Ex. Bertrand Tchoumi"
              />
            </div>
            <div className="col-12 col-md-4">
              <TextField
                id="partner-mission-client-phone"
                label="Téléphone client"
                value={form.values.clientPhone}
                onChange={(value) => form.setField('clientPhone', value)}
                placeholder="Ex. +237 6 90 11 22 33"
              />
            </div>

            <div className="col-12">
              <Divider>Véhicule &amp; Chauffeur</Divider>
            </div>
            <div className="col-12 col-md-4">
              <TextField
                id="partner-mission-vehicle-brand"
                label="Marque du véhicule"
                value={form.values.vehicleBrand}
                onChange={(value) => form.setField('vehicleBrand', value)}
                error={form.errors.vehicleBrand}
                placeholder="Ex. Toyota"
              />
            </div>
            <div className="col-12 col-md-4">
              <TextField
                id="partner-mission-vehicle-model"
                label="Modèle du véhicule"
                value={form.values.vehicleModel}
                onChange={(value) => form.setField('vehicleModel', value)}
                error={form.errors.vehicleModel}
                placeholder="Ex. Hilux"
              />
            </div>
            <div className="col-12 col-md-4">
              <TextField
                id="partner-mission-registration"
                label="Immatriculation"
                value={form.values.registrationNumber}
                onChange={(value) => form.setField('registrationNumber', value)}
                placeholder="Ex. LT 2456 CM"
              />
            </div>
            <div className="col-12 col-md-4">
              <TextField
                id="partner-mission-driver"
                label="Chauffeur"
                value={form.values.driver}
                onChange={(value) => form.setField('driver', value)}
                error={form.errors.driver}
                placeholder="Ex. Jean Dupont"
              />
            </div>

            <div className="col-12">
              <Divider>Trajet</Divider>
            </div>
            <div className="col-12 col-md-4">
              <TextField
                id="partner-mission-departure"
                label="Départ"
                value={form.values.departure}
                onChange={(value) => form.setField('departure', value)}
                error={form.errors.departure}
                placeholder="Ex. Douala"
              />
            </div>
            <div className="col-12 col-md-4">
              <TextField
                id="partner-mission-destination"
                label="Destination"
                value={form.values.destination}
                onChange={(value) => form.setField('destination', value)}
                error={form.errors.destination}
                placeholder="Ex. Yaoundé"
              />
            </div>
            <div className="col-12 col-md-4">
              <TextField
                id="partner-mission-distance"
                label="Distance (km)"
                type="number"
                inputMode="numeric"
                value={form.values.distanceKm}
                onChange={(value) => form.setField('distanceKm', value)}
                error={form.errors.distanceKm}
                placeholder="0"
              />
            </div>

            <div className="col-12">
              <Divider>Planification &amp; Facturation</Divider>
            </div>
            <div className="col-12 col-md-4">
              <TextField
                id="partner-mission-start-date"
                label="Date de début"
                type="date"
                value={form.values.startDate}
                onChange={(value) => form.setField('startDate', value)}
                error={form.errors.startDate}
              />
            </div>
            <div className="col-12 col-md-4">
              <TextField
                id="partner-mission-end-date"
                label="Date de fin"
                type="date"
                value={form.values.endDate}
                onChange={(value) => form.setField('endDate', value)}
                error={form.errors.endDate}
              />
            </div>
            <div className="col-12 col-md-4">
              <TextField
                id="partner-mission-amount"
                label="Montant (FCFA)"
                type="number"
                inputMode="numeric"
                value={form.values.amount}
                onChange={(value) => form.setField('amount', value)}
                error={form.errors.amount}
                hint="Montant exclusivement en FCFA."
                placeholder="0"
              />
            </div>
            <div className="col-12">
              <TextAreaField
                id="partner-mission-notes"
                label="Notes"
                value={form.values.notes}
                onChange={(value) => form.setField('notes', value)}
                placeholder="Consignes, références, informations complémentaires…"
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 border-top border-secondary-subtle mt-4 pt-3">
            <Button variant="outline" onClick={() => navigate(ROUTES.PARTNER_MISSIONS)}>
              Annuler
            </Button>
            <Can permission={PERMISSIONS.PARTNER_MISSIONS_CREATE}>
              <Button variant="primary" type="submit" icon="bi-check2-circle">
                Créer la mission
              </Button>
            </Can>
          </div>
        </div>
      </form>
    </PageContainer>
  );
};

export default PartnerMissionCreatePage;
