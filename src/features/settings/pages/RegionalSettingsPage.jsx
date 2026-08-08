/**
 * Navix Settings — RegionalSettingsPage
 * --------------------------------------------------------------------------
 * Langue, fuseau horaire et formats régionaux par défaut de l'entreprise.
 */
import { Card } from '@/components/ui';
import { formatDate, formatTime, formatCurrency, formatNumber } from '@/utils/format';
import { useRegionalSettings } from '../hooks';
import { regionalSettingsSchema } from '../schemas';
import { SettingsForm, SettingsSectionInfo, FieldSelect } from '../components';
import {
  LANGUAGES,
  COUNTRIES,
  TIMEZONES,
  CURRENCY_OPTIONS,
  CURRENCIES,
  DATE_FORMATS,
  TIME_FORMATS,
  FIRST_DAYS_OF_WEEK,
  NUMBER_LOCALES,
  DECIMAL_SEPARATORS,
  THOUSAND_SEPARATORS,
} from '../constants';

const RegionalSettingsPage = () => {
  const { data, meta, loading, isSaving, error, clearError, fetch, update } = useRegionalSettings();

  const preview = (values) => {
    const now = new Date();
    return [
      { label: 'Date', value: formatDate(now, values.dateFormat) },
      { label: 'Heure', value: formatTime(now, values.timeFormat) },
      { label: 'Nombre', value: formatNumber(1234567.89, { locale: values.numberFormat }) },
      {
        label: 'Montant',
        value: formatCurrency(1250, values.currency, {
          display: 'code',
          locale: values.numberFormat,
          meta: CURRENCIES[values.currency],
        }),
      },
    ];
  };

  return (
    <SettingsForm
      title="Paramètres régionaux"
      subtitle="Langue, fuseau horaire, devise et formats utilisés par défaut."
      icon="bi-globe2"
      section="regional"
      schema={regionalSettingsSchema}
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
            <Card title="Langue et localisation">
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
                    label="Pays"
                    value={values.country}
                    onChange={(value) => setField('country', value)}
                    options={COUNTRIES}
                    error={errors.country}
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
                    label="Devise"
                    value={values.currency}
                    onChange={(value) => setField('currency', value)}
                    options={CURRENCY_OPTIONS}
                    error={errors.currency}
                  />
                </div>
              </div>
            </Card>

            <Card title="Formats" className="mt-3">
              <div className="row g-3">
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
                    label="Premier jour de la semaine"
                    value={values.firstDayOfWeek}
                    onChange={(value) => setField('firstDayOfWeek', value)}
                    options={FIRST_DAYS_OF_WEEK}
                    error={errors.firstDayOfWeek}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldSelect
                    label="Format numérique"
                    value={values.numberFormat}
                    onChange={(value) => setField('numberFormat', value)}
                    options={NUMBER_LOCALES}
                    error={errors.numberFormat}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldSelect
                    label="Séparateur décimal"
                    value={values.decimalSeparator}
                    onChange={(value) => setField('decimalSeparator', value)}
                    options={DECIMAL_SEPARATORS}
                    error={errors.decimalSeparator}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldSelect
                    label="Séparateur de milliers"
                    value={values.thousandsSeparator}
                    onChange={(value) => setField('thousandsSeparator', value)}
                    options={THOUSAND_SEPARATORS}
                    error={errors.thousandsSeparator}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="col-lg-4">
            <Card title="Aperçu du formatage">
              <dl className="mb-0">
                {preview(values).map((row) => (
                  <div className="d-flex justify-content-between align-items-center py-1" key={row.label}>
                    <dt className="mb-0 text-secondary small">{row.label}</dt>
                    <dd className="mb-0">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <div className="mt-3">
              <SettingsSectionInfo section="regional" updatedAt={meta?.updatedAt} />
            </div>
          </div>
        </div>
      )}
    </SettingsForm>
  );
};

export default RegionalSettingsPage;
