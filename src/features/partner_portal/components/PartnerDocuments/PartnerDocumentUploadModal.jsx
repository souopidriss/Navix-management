/**
 * Navix Partner Portal — PartnerDocumentUploadModal (PROMPT 066)
 * --------------------------------------------------------------------------
 * Modale de téléversement / édition d'un document partenaire. Champs :
 * Fichier (obligatoire en création), Type de document (obligatoire), Entité
 * liée (obligatoire selon le type), Description, Référence, Date d'émission,
 * Date d'expiration. Validation Zod exclusive : extension et taille
 * respectent `DOCUMENT_TYPES` (pdf/png/jpg/jpeg/webp/doc/docx/xls/xlsx/csv/
 * txt/zip), aucune dépendance ajoutée — FileUploader core réutilisé.
 * Le `companyId` / `partnerId` ne sont jamais des champs de formulaire.
 */
import { Divider } from '@/components/ui';
import { FormModal, FileUploader } from '@/components/core';
import { useZodForm } from '@/features/auth';
import {
  DOCUMENT_TYPES,
  formatDocumentSize,
  MAX_DEFAULT_UPLOAD_SIZE,
} from '@/features/documents/constants';
import {
  partnerDocumentCreateSchema,
  partnerDocumentUpdateSchema,
  partnerDocumentDefaultValues,
  toPartnerDocumentFormValues,
  toPartnerDocumentPayload,
  toPartnerDocumentUpdatePayload,
} from '../../schemas/partnerDocument.schema';
import {
  PARTNER_DOCUMENT_CATEGORIES,
  PARTNER_DOCUMENT_CATEGORY_VALUES,
  PARTNER_DOCUMENT_ENTITY_TYPES,
  PARTNER_DOCUMENT_ENTITY_VALUES,
} from '../../constants/partner.constants';

const toLabelOptions = (values, meta) => values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const ACCEPT = Object.values(DOCUMENT_TYPES)
  .flatMap((meta) => meta.extensions)
  .join(',');

const ENTITY_REF_PLACEHOLDERS = {
  vehicle: 'Ex. LT 2456 CM',
  client: 'Ex. Transports Express Cameroun',
  mission: 'Ex. MIS-2026-0801',
  company: 'Document de l’entreprise',
};

const TextField = ({ id, label, value, onChange, error, hint, placeholder, type = 'text', disabled }) => (
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
      disabled={disabled}
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

const PartnerDocumentUploadModal = ({ open, onClose, document, onSubmit, loading, error }) => {
  const isEditing = Boolean(document);

  const defaults = isEditing ? toPartnerDocumentFormValues(document) : { ...partnerDocumentDefaultValues };

  const form = useZodForm({
    schema: isEditing ? partnerDocumentUpdateSchema : partnerDocumentCreateSchema,
    defaultValues: defaults,
    onSubmit: async (values) => {
      const fileInfo = values.file
        ? { name: values.file.name, size: values.file.size, type: values.file.type || '' }
        : null;
      const payload = isEditing
        ? toPartnerDocumentUpdatePayload(values)
        : toPartnerDocumentPayload(values, fileInfo);
      await onSubmit(payload);
    },
  });

  const handleFileChange = (files) => {
    form.setField('file', files[0] ?? null);
  };

  const isCompanyEntity = form.values.entityType === 'company';

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier le document' : 'Ajouter un document'}
      subtitle={
        isEditing
          ? document?.reference || 'Mise à jour de la fiche documentaire'
          : 'Téléversez un justificatif lié à votre activité (PDF, image, DOC, XLSX…).'
      }
      icon="bi-file-earmark-plus"
      size="lg"
      onSubmit={form.handleSubmit}
      loading={loading}
      error={error}
      submitLabel={isEditing ? 'Enregistrer les modifications' : 'Ajouter le document'}
      submitIcon={isEditing ? 'bi-check-lg' : 'bi-cloud-arrow-up'}
    >
      <div className="row g-3">
        <div className="col-12">
          <Divider>Fichier</Divider>
        </div>
        <div className="col-12">
          {isEditing && document?.name ? (
            <div className="navix-pdoc-current-file">
              <i className={`bi ${document.fileType ? 'bi-file-earmark' : 'bi-file-earmark'}`} aria-hidden="true" />
              <span className="fw-medium text-truncate">{document.name}</span>
              <span className="text-secondary small text-nowrap">{formatDocumentSize(document.size)}</span>
            </div>
          ) : (
            <FileUploader
              name="partner-document-file"
              label="Glissez-déposez votre fichier ici"
              hint={`Formats acceptés : PDF, PNG, JPG, JPEG, WEBP, DOC, DOCX, XLS, XLSX, CSV, TXT, ZIP — ${formatDocumentSize(MAX_DEFAULT_UPLOAD_SIZE)} max.`}
              accept={ACCEPT}
              multiple={false}
              maxSize={MAX_DEFAULT_UPLOAD_SIZE}
              value={form.values.file ? [form.values.file] : []}
              onChange={handleFileChange}
              error={form.errors.file}
            />
          )}
        </div>

        <div className="col-12">
          <Divider>Identification</Divider>
        </div>
        <div className="col-12 col-md-6">
          <SelectField
            id="partner-document-category"
            label="Type de document"
            value={form.values.category}
            onChange={(value) => form.setField('category', value)}
            options={toLabelOptions(PARTNER_DOCUMENT_CATEGORY_VALUES, PARTNER_DOCUMENT_CATEGORIES)}
            placeholder="Sélectionner…"
            error={form.errors.category}
          />
        </div>
        <div className="col-12 col-md-6">
          <SelectField
            id="partner-document-entity-type"
            label="Entité liée"
            value={form.values.entityType}
            onChange={(value) => form.setField('entityType', value)}
            options={toLabelOptions(PARTNER_DOCUMENT_ENTITY_VALUES, PARTNER_DOCUMENT_ENTITY_TYPES)}
            placeholder="Sélectionner…"
            error={form.errors.entityType}
          />
        </div>
        {!isCompanyEntity && (
          <div className="col-12">
            <TextField
              id="partner-document-entity-ref"
              label="Référence de l’entité liée"
              value={form.values.entityRef}
              onChange={(value) => form.setField('entityRef', value)}
              error={form.errors.entityRef}
              placeholder={ENTITY_REF_PLACEHOLDERS[form.values.entityType] || "Référence de l'entité liée"}
            />
          </div>
        )}
        <div className="col-12 col-md-6">
          <TextField
            id="partner-document-reference"
            label="Référence du document"
            value={form.values.reference}
            onChange={(value) => form.setField('reference', value)}
            hint="Optionnel — ex. REF-CG-2026-118"
            placeholder="Ex. REF-CG-2026-118"
          />
        </div>
        <div className="col-12">
          <TextAreaField
            id="partner-document-description"
            label="Description"
            value={form.values.description}
            onChange={(value) => form.setField('description', value)}
            rows={2}
            placeholder="Objet, remarques… (optionnel)"
          />
        </div>

        <div className="col-12">
          <Divider>Validité</Divider>
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="partner-document-issued-at"
            label="Date d’émission"
            type="date"
            value={form.values.issuedAt}
            onChange={(value) => form.setField('issuedAt', value)}
            error={form.errors.issuedAt}
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="partner-document-expires-at"
            label="Date d’expiration"
            type="date"
            value={form.values.expiresAt}
            onChange={(value) => form.setField('expiresAt', value)}
            error={form.errors.expiresAt}
            hint="Optionnelle — absente pour un document sans échéance."
          />
        </div>
      </div>
    </FormModal>
  );
};

export default PartnerDocumentUploadModal;
