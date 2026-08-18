import { useRef, useState } from 'react';
import { FormModal } from '@/components/core';
import { getResourceCategories } from '@/features/documents/constants';
import { getVehiclesCache } from '../../services/clientVehicleService';
import { getDriversCache } from '../../services/clientOperationsData';
import './ClientDocuments.css';

const TextField = ({ id, label, value, onChange, error, hint, placeholder, type = 'text' }) => (
  <div>
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <input
      id={id}
      type={type}
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

const SelectField = ({ id, label, value, onChange, options, placeholder = 'Sélectionner…', disabled, hint }) => (
  <div>
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <select
      id={id}
      className="form-select"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
    >
      {placeholder && (
        <option value="" disabled hidden>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
    {hint && (
      <small className="form-text text-secondary">{hint}</small>
    )}
  </div>
);

/**
 * Modale de téléversement simulé d'un document (flotte Client). Le fichier
 * est validé côté service (taille, extension, doublon) puis enregistré dans
 * le cache. Répartition par ressource : véhicules, chauffeurs, entreprise.
 */
const ClientDocumentUploadModal = ({ open, onClose, onSubmit, loading, error }) => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const [associationType, setAssociationType] = useState('vehicle');
  const [associationId, setAssociationId] = useState('');
  const [category, setCategory] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const vehicles = getVehiclesCache();
  const drivers = getDriversCache();

  const associationOptions =
    associationType === 'vehicle'
      ? vehicles.map((vehicle) => ({
          value: vehicle.id,
          label: `${vehicle.brand} ${vehicle.model} · ${vehicle.registrationNumber}`,
        }))
      : associationType === 'driver'
        ? drivers.map((driver) => ({
            value: driver.id,
            label: driver.fullName || `${driver.firstName || ''} ${driver.lastName || ''}`.trim(),
          }))
        : [{ value: 'company', label: 'Entreprise (Transports Express Cameroun)' }];

  const categoryOptions = getResourceCategories(associationType).map((item) => ({
    value: item.value,
    label: item.label,
  }));

  const reset = () => {
    setFileName('');
    setFileError('');
    setAssociationType('vehicle');
    setAssociationId('');
    setCategory('');
    setExpiryDate('');
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileError('');
  };

  const handleSubmit = async () => {
    if (!fileName) {
      setFileError('Veuillez sélectionner un fichier.');
      return;
    }
    const file = { name: fileName, size: Math.floor(Math.random() * 2000000) + 400000 };
    await onSubmit({
      file,
      name: fileName,
      associationType,
      associationId,
      directory: associationType === 'company' ? 'entreprise' : `${associationType}s`,
      category,
      expiryDate,
      visibility: 'private',
    });
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Téléverser un document"
      subtitle="Ajoutez un fichier à votre espace documentaire."
      icon="bi-cloud-arrow-up"
      size="lg"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
      loading={loading}
      error={error}
      submitLabel="Téléverser le document"
    >
      <div className="row g-3">
        <div className="col-12">
          <div
            className="navix-client-doc-dropzone"
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') fileInputRef.current?.click();
            }}
          >
            <i className="bi bi-cloud-arrow-up fs-2 d-block mb-2" aria-hidden="true" />
            <p className="mb-1 fw-semibold">Cliquez pour sélectionner un fichier</p>
            <p className="small text-secondary mb-0">PDF, PNG, JPG, DOCX — 50 Mo maximum.</p>
            <input ref={fileInputRef} type="file" onChange={handleFileChange} aria-label="Sélectionner un fichier" />
          </div>
          {fileName && (
            <div className="d-flex align-items-center gap-2 mt-2">
              <i className="bi bi-file-earmark-check text-success" aria-hidden="true" />
              <span className="small">{fileName}</span>
            </div>
          )}
          {fileError && (
            <div className="invalid-feedback d-block">{fileError}</div>
          )}
        </div>

        <div className="col-12 col-md-6">
          <SelectField
            id="client-doc-association-type"
            label="Ressource"
            value={associationType}
            onChange={(value) => {
              setAssociationType(value);
              setAssociationId('');
              setCategory('');
            }}
            options={[
              { value: 'vehicle', label: 'Véhicule' },
              { value: 'driver', label: 'Chauffeur' },
              { value: 'company', label: 'Entreprise' },
            ]}
          />
        </div>
        <div className="col-12 col-md-6">
          <SelectField
            id="client-doc-association"
            label="Élément lié"
            value={associationId}
            onChange={setAssociationId}
            options={associationOptions}
            placeholder="Sélectionner…"
          />
        </div>
        <div className="col-12 col-md-6">
          <SelectField
            id="client-doc-category"
            label="Catégorie"
            value={category}
            onChange={setCategory}
            options={categoryOptions}
            placeholder="Sélectionner une catégorie…"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-doc-expiry"
            label="Date d’expiration"
            type="date"
            value={expiryDate}
            onChange={setExpiryDate}
            hint="Renseignée pour les documents à échéance (carte grise, assurance…)."
          />
        </div>
      </div>
    </FormModal>
  );
};

export default ClientDocumentUploadModal;
