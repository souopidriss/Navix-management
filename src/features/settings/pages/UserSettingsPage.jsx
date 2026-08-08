/**
 * Navix Settings — UserSettingsPage
 * --------------------------------------------------------------------------
 * Profil et préférences personnelles de l'utilisateur (portée utilisateur).
 */
import { Card } from '@/components/ui';
import { useUserSettings } from '../hooks';
import { userSettingsSchema } from '../schemas';
import { SettingsForm, SettingsSectionInfo, FieldInput, FieldSelect } from '../components';
import { LANGUAGES, TIMEZONES, DATE_FORMATS, TIME_FORMATS, CURRENCY_DISPLAYS, LANDING_PAGES } from '../constants';

const UserSettingsPage = () => {
  const { data, meta, loading, isSaving, error, clearError, fetch, update } = useUserSettings();

  return (
    <SettingsForm
      title="Paramètres utilisateur"
      subtitle="Profil personnel et préférences d’affichage propres à votre compte."
      icon="bi-person"
      section="user"
      schema={userSettingsSchema}
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
            <Card title="Profil">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Nom complet"
                    value={values.name}
                    onChange={(value) => setField('name', value)}
                    error={errors.name}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Fonction"
                    value={values.position}
                    onChange={(value) => setField('position', value)}
                    error={errors.position}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="E-mail"
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
                <div className="col-12">
                  <FieldInput
                    label="Avatar (URL)"
                    type="url"
                    value={values.avatar}
                    onChange={(value) => setField('avatar', value)}
                    error={errors.avatar}
                    placeholder="https://…"
                  />
                </div>
              </div>
            </Card>

            <Card title="Préférences" className="mt-3">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <FieldSelect
                    label="Langue"
                    value={values.language}
                    onChange={(value) => setField('language', value)}
                    options={LANGUAGES}
                    error={errors.language}
                  />
                </div>
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
                    label="Format de date"
                    value={values.dateFormat}
                    onChange={(value) => setField('dateFormat', value)}
                    options={DATE_FORMATS}
                    error={errors.dateFormat}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldSelect
                    label="Format d’heure"
                    value={values.timeFormat}
                    onChange={(value) => setField('timeFormat', value)}
                    options={TIME_FORMATS}
                    error={errors.timeFormat}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldSelect
                    label="Affichage de la devise"
                    value={values.currencyDisplay}
                    onChange={(value) => setField('currencyDisplay', value)}
                    options={CURRENCY_DISPLAYS}
                    error={errors.currencyDisplay}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldSelect
                    label="Page d’accueil par défaut"
                    value={values.landingPage}
                    onChange={(value) => setField('landingPage', value)}
                    options={LANDING_PAGES}
                    error={errors.landingPage}
                    hint="Page affichée après connexion (navigation existante inchangée)."
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="col-lg-4">
            <SettingsSectionInfo section="user" updatedAt={meta?.updatedAt} />
          </div>
        </div>
      )}
    </SettingsForm>
  );
};

export default UserSettingsPage;
