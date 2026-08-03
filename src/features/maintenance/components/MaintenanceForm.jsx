/**
 * Navix Maintenance — MaintenanceForm
 * --------------------------------------------------------------------------
 * Grille de champs métier d'un entretien, embarquée dans le FormModal
 * générique de la bibliothèque core (qui fournit l'enveloppe <form>, le
 * pied Annuler / Enregistrer et l'alerte d'erreur globale). L'état du
 * formulaire (valeurs, erreurs Zod, setField, handleSubmit) est piloté par
 * useZodForm depuis la page — le composant reste 100 % déclaratif.
 *
 * Props :
 *   values     : valeurs contrôlées du formulaire
 *   errors     : { champ: message } — erreurs de validation Zod
 *   setField   : (name: string, value: any) => void
 *   companies  : liste des entreprises (détermine les véhicules proposés)
 *   vehicles   : liste des véhicules (filtrés par entreprise)
 */
import { Divider } from '@/components/ui';
import {
  MAINTENANCE_TYPES,
  MAINTENANCE_TYPE_VALUES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_PRIORITY_VALUES,
  MAINTENANCE_STATUSES,
  MAINTENANCE_STATUS_VALUES,
  DEFAULT_CURRENCY,
} from '../constants';
import './MaintenanceForm.css';

const toLabelOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const FieldError = ({ id, error }) =>
  error ? (
    <div className="invalid-feedback d-block" id={id}>
      {error}
    </div>
  ) : null;

const MaintenanceForm = ({ values, errors = {}, setField, companies = [], vehicles = [] }) => {
  const vehicleOptions = vehicles.filter(
    (vehicle) => !values.companyId || vehicle.companyId === values.companyId,
  );

  const handleCompanyChange = (value) => {
    setField('companyId', value);
    setField('vehicleId', '');
  };

  const handlePartsChange = (event) => {
    const parts = event.target.value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    setField('replacedParts', parts);
  };

  return (
    <div className="row g-3 navix-maint-form">
      <div className="col-12">
        <Divider>Rattachement</Divider>
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <label className="form-label" htmlFor="maint-company">
          Entreprise
        </label>
        <select
          id="maint-company"
          className={errors.companyId ? 'form-select is-invalid' : 'form-select'}
          value={values.companyId}
          onChange={(event) => handleCompanyChange(event.target.value)}
          aria-invalid={errors.companyId ? true : undefined}
          aria-describedby={errors.companyId ? 'maint-company-error' : undefined}
        >
          <option value="" disabled hidden>
            Sélectionner une entreprise…
          </option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
        <FieldError id="maint-company-error" error={errors.companyId} />
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <label className="form-label" htmlFor="maint-vehicle">
          Véhicule
        </label>
        <select
          id="maint-vehicle"
          className={errors.vehicleId ? 'form-select is-invalid' : 'form-select'}
          value={values.vehicleId}
          onChange={(event) => setField('vehicleId', event.target.value)}
          disabled={!values.companyId}
          aria-invalid={errors.vehicleId ? true : undefined}
          aria-describedby={errors.vehicleId ? 'maint-vehicle-error' : undefined}
        >
          <option value="" disabled hidden>
            {values.companyId ? 'Sélectionner un véhicule…' : 'Choisir d’abord une entreprise'}
          </option>
          {vehicleOptions.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.registrationNumber || `${vehicle.brand} ${vehicle.model}`.trim()}
            </option>
          ))}
        </select>
        <FieldError id="maint-vehicle-error" error={errors.vehicleId} />
      </div>

      <div className="col-12">
        <Divider>Entretien</Divider>
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <label className="form-label" htmlFor="maint-type">
          Type d’entretien
        </label>
        <select
          id="maint-type"
          className={errors.maintenanceType ? 'form-select is-invalid' : 'form-select'}
          value={values.maintenanceType}
          onChange={(event) => setField('maintenanceType', event.target.value)}
          aria-invalid={errors.maintenanceType ? true : undefined}
          aria-describedby={errors.maintenanceType ? 'maint-type-error' : undefined}
        >
          <option value="" disabled hidden>
            Sélectionner un type…
          </option>
          {toLabelOptions(MAINTENANCE_TYPE_VALUES, MAINTENANCE_TYPES).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError id="maint-type-error" error={errors.maintenanceType} />
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <label className="form-label" htmlFor="maint-priority">
          Priorité
        </label>
        <select
          id="maint-priority"
          className="form-select"
          value={values.priority}
          onChange={(event) => setField('priority', event.target.value)}
        >
          {toLabelOptions(MAINTENANCE_PRIORITY_VALUES, MAINTENANCE_PRIORITIES).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <label className="form-label" htmlFor="maint-status">
          Statut
        </label>
        <select
          id="maint-status"
          className={errors.status ? 'form-select is-invalid' : 'form-select'}
          value={values.status}
          onChange={(event) => setField('status', event.target.value)}
          aria-invalid={errors.status ? true : undefined}
          aria-describedby={errors.status ? 'maint-status-error' : undefined}
        >
          {toLabelOptions(MAINTENANCE_STATUS_VALUES, MAINTENANCE_STATUSES).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError id="maint-status-error" error={errors.status} />
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <label className="form-label" htmlFor="maint-scheduled-date">
          Date prévue
        </label>
        <input
          id="maint-scheduled-date"
          type="date"
          className={errors.scheduledDate ? 'form-control is-invalid' : 'form-control'}
          value={values.scheduledDate}
          onChange={(event) => setField('scheduledDate', event.target.value)}
          aria-invalid={errors.scheduledDate ? true : undefined}
          aria-describedby={errors.scheduledDate ? 'maint-scheduled-date-error' : undefined}
        />
        <FieldError id="maint-scheduled-date-error" error={errors.scheduledDate} />
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <label className="form-label" htmlFor="maint-next-date">
          Prochain entretien (date)
        </label>
        <input
          id="maint-next-date"
          type="date"
          className="form-control"
          value={values.nextMaintenanceDate}
          onChange={(event) => setField('nextMaintenanceDate', event.target.value)}
        />
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <label className="form-label" htmlFor="maint-workshop">
          Atelier
        </label>
        <input
          id="maint-workshop"
          type="text"
          className="form-control"
          value={values.workshop}
          onChange={(event) => setField('workshop', event.target.value)}
          placeholder="Ex. Garage Navix"
        />
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <label className="form-label" htmlFor="maint-mechanic">
          Mécanicien
        </label>
        <input
          id="maint-mechanic"
          type="text"
          className="form-control"
          value={values.mechanic}
          onChange={(event) => setField('mechanic', event.target.value)}
          placeholder="Ex. Kouassi Yapi"
        />
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <label className="form-label" htmlFor="maint-supplier">
          Fournisseur
        </label>
        <input
          id="maint-supplier"
          type="text"
          className="form-control"
          value={values.supplier}
          onChange={(event) => setField('supplier', event.target.value)}
          placeholder="Ex. Fournitures Auto CI"
        />
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <label className="form-label" htmlFor="maint-description">
          Description
        </label>
        <input
          id="maint-description"
          type="text"
          className={errors.description ? 'form-control is-invalid' : 'form-control'}
          value={values.description}
          onChange={(event) => setField('description', event.target.value)}
          placeholder="Ex. Vidange moteur + filtre à huile"
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={errors.description ? 'maint-description-error' : undefined}
        />
        <FieldError id="maint-description-error" error={errors.description} />
      </div>

      <div className="col-12">
        <Divider>Planification, coûts & pièces</Divider>
      </div>

      <div className="col-6 col-md-4 col-lg-2">
        <label className="form-label" htmlFor="maint-mileage">
          Kilométrage
        </label>
        <input
          id="maint-mileage"
          type="number"
          inputMode="numeric"
          min="0"
          className="form-control"
          value={values.mileage}
          onChange={(event) => setField('mileage', event.target.value)}
          placeholder="0"
        />
      </div>

      <div className="col-6 col-md-4 col-lg-2">
        <label className="form-label" htmlFor="maint-next-mileage">
          Prochain km
        </label>
        <input
          id="maint-next-mileage"
          type="number"
          inputMode="numeric"
          min="0"
          className="form-control"
          value={values.nextMileage}
          onChange={(event) => setField('nextMileage', event.target.value)}
          placeholder="0"
        />
      </div>

      <div className="col-6 col-md-4 col-lg-2">
        <label className="form-label" htmlFor="maint-estimated-cost">
          Coût estimé
        </label>
        <input
          id="maint-estimated-cost"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          className="form-control"
          value={values.estimatedCost}
          onChange={(event) => setField('estimatedCost', event.target.value)}
          placeholder="0"
        />
      </div>

      <div className="col-6 col-md-4 col-lg-2">
        <label className="form-label" htmlFor="maint-actual-cost">
          Coût réel
        </label>
        <input
          id="maint-actual-cost"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          className="form-control"
          value={values.actualCost}
          onChange={(event) => setField('actualCost', event.target.value)}
          placeholder="0"
        />
      </div>

      <div className="col-6 col-md-4 col-lg-2">
        <label className="form-label" htmlFor="maint-currency">
          Devise
        </label>
        <select
          id="maint-currency"
          className="form-select"
          value={values.currency}
          onChange={(event) => setField('currency', event.target.value)}
        >
          <option value={DEFAULT_CURRENCY}>XOF</option>
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
        </select>
      </div>

      <div className="col-12">
        <label className="form-label" htmlFor="maint-parts">
          Pièces remplacées (séparées par des virgules)
        </label>
        <input
          id="maint-parts"
          type="text"
          className="form-control"
          value={(values.replacedParts || []).join(', ')}
          onChange={handlePartsChange}
          placeholder="Ex. Filtre à huile, Huile 5W-30 (5L)"
        />
      </div>

      <div className="col-12">
        <Divider>Diagnostic & intervention</Divider>
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="maint-diagnostic">
          Diagnostic
        </label>
        <textarea
          id="maint-diagnostic"
          className="form-control"
          rows={3}
          value={values.diagnostic}
          onChange={(event) => setField('diagnostic', event.target.value)}
          placeholder="Constats, causes identifiées…"
        />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="maint-performed-work">
          Travaux effectués
        </label>
        <textarea
          id="maint-performed-work"
          className="form-control"
          rows={3}
          value={values.performedWork}
          onChange={(event) => setField('performedWork', event.target.value)}
          placeholder="Interventions réalisées…"
        />
      </div>

      <div className="col-12">
        <label className="form-label" htmlFor="maint-notes">
          Notes
        </label>
        <textarea
          id="maint-notes"
          className="form-control"
          rows={2}
          value={values.notes}
          onChange={(event) => setField('notes', event.target.value)}
          placeholder="Observations, contraintes, prochaine échéance…"
        />
      </div>
    </div>
  );
};

export default MaintenanceForm;
