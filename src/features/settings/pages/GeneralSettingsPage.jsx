/**
 * Navix Settings — GeneralSettingsPage
 * --------------------------------------------------------------------------
 * Identité et coordonnées de l'application (paramètres généraux).
 */
import { Card } from '@/components/ui';
import { useGeneralSettings } from '../hooks';
import { generalSettingsSchema } from '../schemas';
import { SettingsForm, SettingsSectionInfo, FieldInput, FieldSelect, FieldTextarea } from '../components';
import { LANGUAGES, COUNTRIES, TIMEZONES, CURRENCY_OPTIONS } from '../constants';

const GeneralSettingsPage = () => {
  const { data, meta, loading, isSaving, error, clearError, fetch, update } = useGeneralSettings();

  return (
    <SettingsForm
      title="Paramètres généraux"
      subtitle="Identité, coordonnées et paramètres par défaut de la plateforme."
      icon="bi-sliders"
      section="general"
      schema={generalSettingsSchema}
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
            <Card title="Identité de l’application">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Nom de l’application"
                    value={values.appName}
                    onChange={(value) => setField('appName', value)}
                    error={errors.appName}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldSelect
                    label="Langue par défaut"
                    value={values.language}
                    onChange={(value) => setField('language', value)}
                    options={LANGUAGES}
                    error={errors.language}
                  />
                </div>
                <div className="col-12">
                  <FieldTextarea
                    label="Description"
                    value={values.description}
                    onChange={(value) => setField('description', value)}
                    rows={2}
                    maxLength={300}
                    error={errors.description}
                    hint={`${values.description?.length ?? 0}/300 caractères`}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Logo (URL)"
                    type="url"
                    value={values.logo}
                    onChange={(value) => setField('logo', value)}
                    error={errors.logo}
                    placeholder="https://…"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Favicon (URL)"
                    type="url"
                    value={values.favicon}
                    onChange={(value) => setField('favicon', value)}
                    error={errors.favicon}
                    placeholder="https://…"
                  />
                </div>
              </div>
            </Card>

            <Card title="Coordonnées" className="mt-3">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="E-mail de contact"
                    type="email"
                    value={values.email}
                    onChange={(value) => setField('email', value)}
                    error={errors.email}
                    autoComplete="email"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Téléphone"
                    type="tel"
                    value={values.phone}
                    onChange={(value) => setField('phone', value)}
                    error={errors.phone}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Site web"
                    type="url"
                    value={values.website}
                    onChange={(value) => setField('website', value)}
                    error={errors.website}
                    placeholder="https://…"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldSelect
                    label="Pays"
                    value={values.country}
                    onChange={(value) => setField('country', value)}
                    options={COUNTRIES}
                    error={errors.country}
                    placeholder="Sélectionner un pays…"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Ville"
                    value={values.city}
                    onChange={(value) => setField('city', value)}
                    error={errors.city}
                  />
                </div>
                <div className="col-12">
                  <FieldInput
                    label="Adresse"
                    value={values.address}
                    onChange={(value) => setField('address', value)}
                    error={errors.address}
                  />
                </div>
              </div>
            </Card>

            <Card title="Valeurs par défaut" className="mt-3">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <FieldSelect
                    label="Fuseau horaire"
                    value={values.timezone}
                    onChange={(value) => setField('timezone', value)}
                    options={TIMEZONES}
                    error={errors.timezone}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldSelect
                    label="Devise par défaut"
                    value={values.currency}
                    onChange={(value) => setField('currency', value)}
                    options={CURRENCY_OPTIONS}
                    error={errors.currency}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="col-lg-4">
            <SettingsSectionInfo section="general" updatedAt={meta?.updatedAt} />
          </div>
        </div>
      )}
    </SettingsForm>
  );
};

export default GeneralSettingsPage;
