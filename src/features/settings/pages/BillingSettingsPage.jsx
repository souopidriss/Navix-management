/**
 * Navix Settings — BillingSettingsPage
 * --------------------------------------------------------------------------
 * Configuration de la facturation : émetteur, devise, taxe, numérotation et
 * rappels. La logique financière reste dans le module Billing — cette page
 * ne contient que la configuration (portée entreprise).
 */
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { useBillingSettings } from '../hooks';
import { billingSettingsSchema } from '../schemas';
import { SettingsForm, SettingsSectionInfo, FieldInput, FieldSelect, FieldSwitch } from '../components';
import { COUNTRIES, CURRENCY_OPTIONS, TAX_RATE_OPTIONS } from '../constants';
import { ROUTES } from '@/routes/route.constants';

const BillingSettingsPage = () => {
  const { data, meta, loading, isSaving, error, clearError, fetch, update } = useBillingSettings();

  return (
    <SettingsForm
      title="Paramètres de facturation"
      subtitle="Configuration de la facturation de l’entreprise. La gestion complète se trouve dans Facturation."
      icon="bi-receipt"
      section="billing"
      schema={billingSettingsSchema}
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
            <Card title="Émetteur des factures">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Raison sociale"
                    value={values.companyName}
                    onChange={(value) => setField('companyName', value)}
                    error={errors.companyName}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Identifiant fiscal"
                    value={values.taxId}
                    onChange={(value) => setField('taxId', value)}
                    error={errors.taxId}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="E-mail de facturation"
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

            <Card title="Conditions de paiement" className="mt-3">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <FieldSelect
                    label="Devise"
                    value={values.currency}
                    onChange={(value) => setField('currency', value)}
                    options={CURRENCY_OPTIONS}
                    error={errors.currency}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldSelect
                    label="Taxe par défaut"
                    value={String(values.taxRate)}
                    onChange={(value) => setField('taxRate', value)}
                    options={TAX_RATE_OPTIONS}
                    error={errors.taxRate}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Préfixe de facture"
                    value={values.invoicePrefix}
                    onChange={(value) => setField('invoicePrefix', value)}
                    error={errors.invoicePrefix}
                    hint="Ex. NAIVX-2026-000001"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Délai d’échéance (jours)"
                    type="number"
                    min="1"
                    value={values.paymentTermsDays}
                    onChange={(value) => setField('paymentTermsDays', value)}
                    error={errors.paymentTermsDays}
                  />
                </div>
              </div>
            </Card>

            <Card title="Rappels automatiques" className="mt-3">
              <div className="row g-3">
                <div className="col-12">
                  <FieldSwitch
                    label="Activer les relances avant échéance"
                    value={values.autoRemindersEnabled}
                    onChange={(value) => setField('autoRemindersEnabled', value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Relance J—n (jours avant l’échéance)"
                    type="number"
                    min="0"
                    value={values.autoRemindersDaysBeforeDue}
                    onChange={(value) => setField('autoRemindersDaysBeforeDue', value)}
                    error={errors.autoRemindersDaysBeforeDue}
                    disabled={!values.autoRemindersEnabled}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="col-lg-4">
            <SettingsSectionInfo section="billing" updatedAt={meta?.updatedAt} />
            <Card title="Gestion de la facturation" className="mt-3">
              <p className="small text-secondary mb-3">
                Consultez les factures, paiements et l’historique de facturation de l’entreprise.
              </p>
              <Link className="btn btn-outline-primary w-100" to={ROUTES.BILLING}>
                <i className="bi bi-receipt me-2" aria-hidden="true" />
                Ouvrir la facturation
              </Link>
            </Card>
          </div>
        </div>
      )}
    </SettingsForm>
  );
};

export default BillingSettingsPage;
