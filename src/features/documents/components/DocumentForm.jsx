/**
 * Navix Documents — DocumentForm
 * --------------------------------------------------------------------------
 * Grille de champs métier d'un document, embarquée dans le FormModal
 * générique de la bibliothèque core (qui fournit l'enveloppe <form>, le
 * pied Annuler / Téléverser et l'alerte d'erreur globale). L'état du
 * formulaire (valeurs, erreurs Zod, setField, handleSubmit) est piloté par
 * useZodForm depuis la page — le composant reste 100 % déclaratif.
 *
 * Sections : Rattachement (entreprise, type de fichier, visibilité),
 * Association (ressource + catégorie documentaire), Fichiers (upload local
 * validé par le type choisi) et Description. En mode édition, la section
 * Fichiers est remplacée par une note d'information.
 *
 * Props :
 *   values              : valeurs contrôlées du formulaire
 *   errors              : { champ: message } — erreurs de validation Zod
 *   setField            : (name, value) => void
 *   companies           : liste des entreprises
 *   fileTypes           : liste des types de fichiers
 *   vehicles, drivers   : références véhicules / chauffeurs
 *   maintenanceRecords  : références entretiens
 *   trips, fuelRecords  : références trajets / pleins
 *   editMode            : booléen — désactive l'upload de fichiers
 */
import { Divider } from '@/components/ui';
import {
  ASSOCIATION_TYPE_VALUES,
  ASSOCIATION_TYPES,
  DOCUMENT_VISIBILITY_VALUES,
  DOCUMENT_VISIBILITIES,
  getResourceCategories,
} from '../constants';
import DocumentUploader from './DocumentUploader';
import './DocumentForm.css';

const toLabelOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const FieldError = ({ id, error }) =>
  error ? (
    <div className="invalid-feedback d-block" id={id}>
      {error}
    </div>
  ) : null;

const DocumentForm = ({
  values,
  errors = {},
  setField,
  companies = [],
  fileTypes = [],
  vehicles = [],
  drivers = [],
  maintenanceRecords = [],
  trips = [],
  fuelRecords = [],
  editMode = false,
}) => {
  const associationOptions = (() => {
    switch (values.associationType) {
      case 'company':
        return companies.map((company) => ({ value: company.id, label: company.name }));
      case 'vehicle':
        return vehicles
          .filter((vehicle) => !values.companyId || vehicle.companyId === values.companyId)
          .map((vehicle) => ({
            value: vehicle.id,
            label: vehicle.registrationNumber || `${vehicle.brand} ${vehicle.model}`.trim(),
          }));
      case 'driver':
        return drivers.map((driver) => ({ value: driver.id, label: driver.fullName }));
      case 'maintenance':
        return maintenanceRecords
          .filter((record) => !values.companyId || record.companyId === values.companyId)
          .map((record) => ({ value: record.id, label: record.maintenanceNumber }));
      case 'trip':
        return trips
          .filter((trip) => !values.companyId || trip.companyId === values.companyId)
          .map((trip) => ({ value: trip.id, label: trip.tripNumber }));
      case 'fuel':
        return fuelRecords
          .filter((record) => !values.companyId || record.companyId === values.companyId)
          .map((record) => ({ value: record.id, label: record.fuelNumber }));
      default:
        return [];
    }
  })();

  const categories = getResourceCategories(values.associationType);
  const showAssociationSelect = Boolean(values.associationType);
  const showCategorySelect = Boolean(values.associationType) && categories.length > 0;

  const handleCompanyChange = (value) => {
    setField('companyId', value);
    setField('associationId', '');
    setField('category', '');
  };

  const handleAssociationTypeChange = (value) => {
    setField('associationType', value);
    setField('associationId', '');
    setField('category', '');
  };

  const handleFileTypeChange = (value) => {
    setField('fileTypeId', value);
    setField('files', []);
  };

  const selectedFileType = fileTypes.find((fileType) => fileType.id === values.fileTypeId) || null;

  return (
    <div className="row g-3 navix-doc-form">
      <div className="col-12">
        <Divider>Rattachement</Divider>
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="doc-company">
          Entreprise
        </label>
        <select
          id="doc-company"
          className={errors.companyId ? 'form-select is-invalid' : 'form-select'}
          value={values.companyId}
          onChange={(event) => handleCompanyChange(event.target.value)}
          aria-invalid={errors.companyId ? true : undefined}
          aria-describedby={errors.companyId ? 'doc-company-error' : undefined}
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
        <FieldError id="doc-company-error" error={errors.companyId} />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="doc-file-type">
          Type de fichier
        </label>
        <select
          id="doc-file-type"
          className={errors.fileTypeId ? 'form-select is-invalid' : 'form-select'}
          value={values.fileTypeId}
          onChange={(event) => handleFileTypeChange(event.target.value)}
          aria-invalid={errors.fileTypeId ? true : undefined}
          aria-describedby={errors.fileTypeId ? 'doc-file-type-error' : undefined}
        >
          <option value="" disabled hidden>
            Sélectionner un type…
          </option>
          {fileTypes.map((fileType) => (
            <option key={fileType.id} value={fileType.id}>
              {fileType.title}
            </option>
          ))}
        </select>
        <FieldError id="doc-file-type-error" error={errors.fileTypeId} />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="doc-visibility">
          Visibilité
        </label>
        <select
          id="doc-visibility"
          className="form-select"
          value={values.visibility}
          onChange={(event) => setField('visibility', event.target.value)}
        >
          {toLabelOptions(DOCUMENT_VISIBILITY_VALUES, DOCUMENT_VISIBILITIES).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="col-12">
        <Divider>Association</Divider>
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="doc-association-type">
          Ressource associée
        </label>
        <select
          id="doc-association-type"
          className="form-select"
          value={values.associationType}
          onChange={(event) => handleAssociationTypeChange(event.target.value)}
        >
          <option value="">Aucune ressource</option>
          {toLabelOptions(ASSOCIATION_TYPE_VALUES, ASSOCIATION_TYPES).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {showAssociationSelect && (
        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="doc-association-id">
            {ASSOCIATION_TYPES[values.associationType]?.label || 'Ressource'}
          </label>
          <select
            id="doc-association-id"
            className={errors.associationId ? 'form-select is-invalid' : 'form-select'}
            value={values.associationId}
            onChange={(event) => setField('associationId', event.target.value)}
            disabled={associationOptions.length === 0}
            aria-invalid={errors.associationId ? true : undefined}
            aria-describedby={errors.associationId ? 'doc-association-id-error' : undefined}
          >
            <option value="" disabled hidden>
              {associationOptions.length === 0
                ? 'Aucune ressource disponible'
                : 'Sélectionner une ressource…'}
            </option>
            {associationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError id="doc-association-id-error" error={errors.associationId} />
        </div>
      )}

      {showCategorySelect && (
        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="doc-category">
            Catégorie documentaire
          </label>
          <select
            id="doc-category"
            className="form-select"
            value={values.category}
            onChange={(event) => setField('category', event.target.value)}
          >
            <option value="">Sélectionner une catégorie…</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="col-12">
        <Divider>Fichier</Divider>
      </div>

      {editMode ? (
        <div className="col-12">
          <div className="alert alert-info navix-doc-form__edit-note" role="note">
            <i className="bi bi-info-circle me-1" aria-hidden="true" />
            Le fichier physique d’un document existant ne peut pas être remplacé depuis cette
            page : seules les métadonnées sont modifiables.
          </div>
        </div>
      ) : (
        <div className="col-12">
          <DocumentUploader
            files={values.files}
            onChange={(files) => setField('files', files)}
            fileType={selectedFileType}
            error={errors.files}
          />
        </div>
      )}

      <div className="col-12">
        <label className="form-label" htmlFor="doc-description">
          Description
        </label>
        <textarea
          id="doc-description"
          className="form-control"
          rows={3}
          value={values.description}
          onChange={(event) => setField('description', event.target.value)}
          placeholder="Objet du document, contexte, échéance…"
        />
      </div>
    </div>
  );
};

export default DocumentForm;
