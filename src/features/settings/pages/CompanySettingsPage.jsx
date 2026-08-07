/**
 * Navix Settings — CompanySettingsPage
 * --------------------------------------------------------------------------
 * Informations légales et coordonnées de l'entreprise (portée entreprise).
 * Section sensible : chaque sauvegarde génère une entrée d'audit simulée.
 */
import { Card } from '@/components/ui';
import { useCompanySettings } from '../hooks';
import { companySettingsSchema } from '../schemas';
import { SettingsForm, SettingsSectionInfo, FieldInput, FieldSelect, FieldTextarea } from '../components';
import { COUNTRIES } from '../constants';

const CompanySettingsPage = () => {
  const { data, meta, loading, isSaving, error, clearError, fetch, update } = useCompanySettings();

  return (
    <SettingsForm
      title="Paramètres de l’entreprise"
      subtitle="Informations légales, coordonnées et présentation de l’entreprise."
      icon="bi-buildings"
      section="company"
      schema={companySettingsSchema}
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
            <Card title="Identification">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Raison sociale"
                    value={values.legalName}
                    onChange={(value) => setField('legalName', value)}
                    error={errors.legalName}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Nom commercial"
                    value={values.tradingName}
                    onChange={(value) => setField('tradingName', value)}
                    error={errors.tradingName}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Identifiant fiscal"
                    value={values.taxNumber}
                    onChange={(value) => setField('taxNumber', value)}
                    error={errors.taxNumber}
                    hint="Numéro de contribuable"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Registre de commerce"
                    value={values.tradeRegister}
                    onChange={(value) => setField('tradeRegister', value)}
                    error={errors.tradeRegister}
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
                    label="Site web"
                    type="url"
                    value={values.website}
                    onChange={(value) => setField('website', value)}
                    error={errors.website}
                    placeholder="https://…"
                  />
                </div>
                <div className="col-12">
                  <FieldTextarea
                    label="Description"
                    value={values.description}
                    onChange={(value) => setField('description', value)}
                    rows={2}
                    maxLength={500}
                    error={errors.description}
                    hint={`${values.description?.length ?? 0}/500 caractères`}
                  />
                </div>
              </div>
            </Card>

            <Card title="Coordonnées" className="mt-3">
              <div className="row g-3">
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
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Région"
                    value={values.region}
                    onChange={(value) => setField('region', value)}
                    error={errors.region}
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
          </div>

          <div className="col-lg-4">
            <SettingsSectionInfo section="company" updatedAt={meta?.updatedAt} />
          </div>
        </div>
      )}
    </SettingsForm>
  );
};

export default CompanySettingsPage;
