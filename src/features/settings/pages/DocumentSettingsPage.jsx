/**
 * Navix Settings — DocumentSettingsPage
 * --------------------------------------------------------------------------
 * Types de documents pris en charge, délai d'expiration et règles de
 * téléversement (portée entreprise).
 */
import { Card } from '@/components/ui';
import { useDocumentSettings } from '../hooks';
import { documentSettingsSchema } from '../schemas';
import { SettingsForm, SettingsSectionInfo, FieldInput, FieldSelect, FieldCheckboxes, FieldSwitch, FieldSegmented } from '../components';
import { EXPIRATION_ALERT_DAYS, DOCUMENT_TYPE_OPTIONS, DOCUMENT_MIME_TYPES, DOCUMENT_VIEWS, DOCUMENT_SORTS, ITEMS_PER_PAGE_OPTIONS } from '../constants';

const DocumentSettingsPage = () => {
  const { data, meta, loading, isSaving, error, clearError, fetch, update } = useDocumentSettings();

  const mimeOptions = DOCUMENT_MIME_TYPES.map((mime) => ({ value: mime, label: mime }));

  return (
    <SettingsForm
      title="Paramètres des documents"
      subtitle="Types de fichiers pris en charge et alertes d’expiration."
      icon="bi-file-earmark-text"
      section="documents"
      schema={documentSettingsSchema}
      data={data}
      onSave={update}
      onRetry={fetch}
      isSaving={isSaving}
      loading={loading}
      error={error}
      onClearError={clearError}
      contained={false}
    >
      {({ values, errors, setField }) => (
        <div className="row g-3">
          <div className="col-lg-8">
            <Card title="Types de documents">
              <FieldCheckboxes
                label="Types pris en charge"
                selected={values.supportedTypes}
                onChange={(value) => setField('supportedTypes', value)}
                options={DOCUMENT_TYPE_OPTIONS}
                error={errors.supportedTypes}
                hint="Détermine les extensions acceptées à l’import."
              />
            </Card>

            <Card title="Expiration et téléversement" className="mt-3">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <FieldSelect
                    label="Alerte d’expiration (jours avant)"
                    value={String(values.expirationAlertDays)}
                    onChange={(value) => setField('expirationAlertDays', value)}
                    options={EXPIRATION_ALERT_DAYS.map((days) => ({
                      value: String(days),
                      label: `${days} jours`,
                    }))}
                    error={errors.expirationAlertDays}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Taille maximale par fichier (Mo)"
                    type="number"
                    min="1"
                    value={values.maxFileSizeMb}
                    onChange={(value) => setField('maxFileSizeMb', value)}
                    error={errors.maxFileSizeMb}
                  />
                </div>
                <div className="col-12">
                  <FieldCheckboxes
                    label="Types MIME autorisés"
                    selected={values.allowedMimeTypes}
                    onChange={(value) => setField('allowedMimeTypes', value)}
                    options={mimeOptions}
                    error={errors.allowedMimeTypes}
                  />
                </div>
                <div className="col-12">
                  <FieldSwitch
                    label="Autoriser le téléversement"
                    value={values.allowUpload}
                    onChange={(value) => setField('allowUpload', value)}
                  />
                </div>
                <div className="col-12">
                  <FieldSwitch
                    label="Autoriser la suppression"
                    value={values.allowDelete}
                    onChange={(value) => setField('allowDelete', value)}
                    hint="Restreint la suppression de documents aux administrateurs."
                  />
                </div>
              </div>
            </Card>

            <Card title="Affichage des documents" className="mt-3">
              <div className="row g-3">
                <div className="col-12">
                  <FieldSegmented
                    label="Vue par défaut"
                    value={values.defaultView}
                    onChange={(value) => setField('defaultView', value)}
                    options={DOCUMENT_VIEWS}
                    error={errors.defaultView}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldSelect
                    label="Tri par défaut"
                    value={values.defaultSort}
                    onChange={(value) => setField('defaultSort', value)}
                    options={DOCUMENT_SORTS}
                    error={errors.defaultSort}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldSelect
                    label="Documents par page"
                    value={String(values.itemsPerPage)}
                    onChange={(value) => setField('itemsPerPage', value)}
                    options={ITEMS_PER_PAGE_OPTIONS.map((count) => ({
                      value: String(count),
                      label: `${count} documents`,
                    }))}
                    error={errors.itemsPerPage}
                  />
                </div>
                <div className="col-12">
                  <FieldSwitch
                    label="Aperçu des documents activé"
                    value={values.previewEnabled}
                    onChange={(value) => setField('previewEnabled', value)}
                  />
                </div>
                <div className="col-12">
                  <FieldSwitch
                    label="Aperçu automatique des images"
                    value={values.autoPreviewImages}
                    onChange={(value) => setField('autoPreviewImages', value)}
                    hint="Ouvre un aperçu en plein écran à l’ouverture d’une image."
                  />
                </div>
                <div className="col-12">
                  <FieldSwitch
                    label="Demander confirmation avant suppression"
                    value={values.confirmBeforeDelete}
                    onChange={(value) => setField('confirmBeforeDelete', value)}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="col-lg-4">
            <SettingsSectionInfo section="documents" updatedAt={meta?.updatedAt} />
          </div>
        </div>
      )}
    </SettingsForm>
  );
};

export default DocumentSettingsPage;
