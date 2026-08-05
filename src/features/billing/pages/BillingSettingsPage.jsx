/**
 * Navix Billing — BillingSettingsPage
 * --------------------------------------------------------------------------
 * Paramètres de facturation de la plateforme : identification de l'émetteur
 * (lecture seule), devise par défaut, délai d'échéance, taxe par défaut,
 * paiements partiels, préfixe / numérotation et rappels automatiques.
 * Validation exclusive Zod (billingSettingsSchema) puis mise à jour via le
 * store. Aucune source de vérité financière : la validation réelle viendra
 * du backend.
 */
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button, Card, Divider } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { useZodForm } from '@/features/auth';
import { useBillingStore } from '../store';
import {
  billingSettingsSchema,
  billingSettingsDefaultValues,
  toBillingSettingsFormValues,
  toBillingSettingsPayload,
} from '../schemas';
import { CURRENCIES, CURRENCY_VALUES, TAX_RATES, TAX_RATE_VALUES, BILLING_ICON } from '../constants';
import './BillingSettingsPage.css';

const FieldError = ({ id, error }) =>
  error ? (
    <div className="invalid-feedback d-block" id={id}>
      {error}
    </div>
  ) : null;

const BillingSettingsPage = () => {
  const settings = useBillingStore((state) => state.settings);
  const isLoading = useBillingStore((state) => state.isLoading);
  const isSaving = useBillingStore((state) => state.isSaving);
  const error = useBillingStore((state) => state.error);
  const fetchSettings = useBillingStore((state) => state.fetchSettings);
  const updateSettings = useBillingStore((state) => state.updateSettings);
  const clearError = useBillingStore((state) => state.clearError);

  const [touched, setTouched] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleValidSubmit = async (values) => {
    clearError();
    const result = await updateSettings(toBillingSettingsPayload(values));
    if (result.success) {
      toast.success('Paramètres de facturation enregistrés.');
      setTouched(false);
    }
  };

  const { values, errors, setField, reset, handleSubmit } = useZodForm({
    schema: billingSettingsSchema,
    defaultValues: billingSettingsDefaultValues,
    onSubmit: handleValidSubmit,
  });

  useEffect(() => {
    if (settings) {
      reset(toBillingSettingsFormValues(settings));
      setTouched(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  if (!settings) {
    return (
      <PageContainer>
        {isLoading ? (
          <LoadingState variant="text" lines={6} label="Chargement des paramètres…" />
        ) : (
          <Alert variant="danger" closable onClose={clearError} className="mb-3">
            {error || 'Paramètres introuvables.'}
          </Alert>
        )}
      </PageContainer>
    );
  }

  const currencyOptions = CURRENCY_VALUES.map((value) => ({ value, meta: CURRENCIES[value] }));
  const taxOptions = TAX_RATE_VALUES.map((value) => ({ value, meta: TAX_RATES[value] }));

  const { companyInfo } = settings;

  return (
    <PageContainer>
      <Helmet>
        <title>Paramètres de facturation — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Paramètres de facturation"
        subtitle="Configuration de la facturation simulée de la plateforme."
        icon="bi-gear"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Facturation', to: ROUTES.BILLING },
          { label: 'Paramètres' },
        ]}
        actions={
          <Button
            type="button"
            variant="primary"
            icon="bi-check-lg"
            loading={isSaving}
            disabled={!touched}
            onClick={handleSubmit}
          >
            Enregistrer
          </Button>
        }
      />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <form noValidate>
        <div className="row g-3">
          <div className="col-lg-7">
            <Card title="Conditions de paiement">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="settings-currency">
                    Devise par défaut
                  </label>
                  <select
                    id="settings-currency"
                    className={errors.defaultCurrency ? 'form-select is-invalid' : 'form-select'}
                    value={values.defaultCurrency}
                    onChange={(event) => {
                      setField('defaultCurrency', event.target.value);
                      setTouched(true);
                    }}
                    aria-invalid={errors.defaultCurrency ? true : undefined}
                    aria-describedby={errors.defaultCurrency ? 'settings-currency-error' : undefined}
                  >
                    {currencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.meta.label}
                      </option>
                    ))}
                  </select>
                  <FieldError id="settings-currency-error" error={errors.defaultCurrency} />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="settings-terms">
                    Délai d’échéance (jours)
                  </label>
                  <input
                    id="settings-terms"
                    type="number"
                    min="1"
                    className={errors.paymentTermsDays ? 'form-control is-invalid' : 'form-control'}
                    value={values.paymentTermsDays}
                    onChange={(event) => {
                      setField('paymentTermsDays', event.target.value);
                      setTouched(true);
                    }}
                    aria-invalid={errors.paymentTermsDays ? true : undefined}
                    aria-describedby={errors.paymentTermsDays ? 'settings-terms-error' : undefined}
                  />
                  <FieldError id="settings-terms-error" error={errors.paymentTermsDays} />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="settings-tax">
                    Taxe par défaut
                  </label>
                  <select
                    id="settings-tax"
                    className={errors.defaultTaxRate ? 'form-select is-invalid' : 'form-select'}
                    value={values.defaultTaxRate}
                    onChange={(event) => {
                      setField('defaultTaxRate', event.target.value);
                      setTouched(true);
                    }}
                    aria-invalid={errors.defaultTaxRate ? true : undefined}
                    aria-describedby={errors.defaultTaxRate ? 'settings-tax-error' : undefined}
                  >
                    {taxOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.meta.label}
                      </option>
                    ))}
                  </select>
                  <FieldError id="settings-tax-error" error={errors.defaultTaxRate} />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="settings-prefix">
                    Préfixe de facture
                  </label>
                  <input
                    id="settings-prefix"
                    type="text"
                    className={errors.invoicePrefix ? 'form-control is-invalid' : 'form-control'}
                    value={values.invoicePrefix}
                    onChange={(event) => {
                      setField('invoicePrefix', event.target.value);
                      setTouched(true);
                    }}
                    aria-invalid={errors.invoicePrefix ? true : undefined}
                    aria-describedby={errors.invoicePrefix ? 'settings-prefix-error' : undefined}
                  />
                  <FieldError id="settings-prefix-error" error={errors.invoicePrefix} />
                </div>

                <div className="col-12">
                  <div className="form-check form-switch">
                    <input
                      id="settings-partial"
                      type="checkbox"
                      role="switch"
                      className="form-check-input"
                      checked={values.allowPartialPayments}
                      onChange={(event) => {
                        setField('allowPartialPayments', event.target.checked);
                        setTouched(true);
                      }}
                    />
                    <label className="form-check-label" htmlFor="settings-partial">
                      Autoriser les paiements partiels
                    </label>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Rappels automatiques" className="mt-3">
              <div className="row g-3">
                <div className="col-12">
                  <div className="form-check form-switch">
                    <input
                      id="settings-reminders"
                      type="checkbox"
                      role="switch"
                      className="form-check-input"
                      checked={values.autoRemindersEnabled}
                      onChange={(event) => {
                        setField('autoRemindersEnabled', event.target.checked);
                        setTouched(true);
                      }}
                    />
                    <label className="form-check-label" htmlFor="settings-reminders">
                      Activer les relances avant échéance
                    </label>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="settings-reminder-days">
                    Relance J — {values.autoRemindersDaysBeforeDue} jours avant l’échéance
                  </label>
                  <input
                    id="settings-reminder-days"
                    type="number"
                    min="0"
                    disabled={!values.autoRemindersEnabled}
                    className={errors.autoRemindersDaysBeforeDue ? 'form-control is-invalid' : 'form-control'}
                    value={values.autoRemindersDaysBeforeDue}
                    onChange={(event) => {
                      setField('autoRemindersDaysBeforeDue', event.target.value);
                      setTouched(true);
                    }}
                    aria-invalid={errors.autoRemindersDaysBeforeDue ? true : undefined}
                    aria-describedby={errors.autoRemindersDaysBeforeDue ? 'settings-reminder-days-error' : undefined}
                  />
                  <FieldError id="settings-reminder-days-error" error={errors.autoRemindersDaysBeforeDue} />
                </div>
              </div>
            </Card>
          </div>

          <div className="col-lg-5">
            <Card title="Émetteur des factures">
              {companyInfo ? (
                <dl className="navix-billing-settings__issuer mb-0">
                  <div>
                    <dt>Raison sociale</dt>
                    <dd>{companyInfo.legalName}</dd>
                  </div>
                  <div>
                    <dt>Identifiant fiscal</dt>
                    <dd>
                      <code>{companyInfo.taxId}</code>
                    </dd>
                  </div>
                  <div>
                    <dt>Adresse</dt>
                    <dd>{companyInfo.address}</dd>
                  </div>
                  <div>
                    <dt>E-mail</dt>
                    <dd>{companyInfo.email}</dd>
                  </div>
                  <div>
                    <dt>Téléphone</dt>
                    <dd>{companyInfo.phone}</dd>
                  </div>
                  <div>
                    <dt>Site web</dt>
                    <dd>{companyInfo.website}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-secondary mb-0">Informations de l’émetteur non configurées.</p>
              )}
            </Card>

            <Card title="Numérotation" className="mt-3">
              <dl className="navix-billing-settings__issuer mb-0">
                <div>
                  <dt>Prochaine facture</dt>
                  <dd>
                    <code>{settings.invoicePrefix}-{new Date().getFullYear()}-{String(settings.nextInvoiceNumber).padStart(6, '0')}</code>
                  </dd>
                </div>
                <div>
                  <dt>Prochain paiement</dt>
                  <dd>
                    <code>PAY-{new Date().getFullYear()}-{String(settings.nextPaymentNumber).padStart(6, '0')}</code>
                  </dd>
                </div>
              </dl>
              <Divider />
              <p className="text-secondary small mb-0">
                <i className="bi bi-shield-exclamation me-1" aria-hidden="true" />
                Facturation simulée : les montants, devises et transactions sont fictifs. La
                validation financière réelle sera assurée par le futur backend Express.js / MySQL.
              </p>
            </Card>
          </div>
        </div>
      </form>
    </PageContainer>
  );
};

export default BillingSettingsPage;
