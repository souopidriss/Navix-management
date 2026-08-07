/**
 * Navix Settings — FuelSettingsPage
 * --------------------------------------------------------------------------
 * Devise, prix moyen et seuils de consommation de carburant (portée entreprise).
 */
import { Card } from '@/components/ui';
import { useFuelSettings } from '../hooks';
import { fuelSettingsSchema } from '../schemas';
import { SettingsForm, SettingsSectionInfo, FieldInput, FieldSelect, FieldSwitch } from '../components';
import { FUEL_UNITS, CURRENCY_OPTIONS } from '../constants';

const FuelSettingsPage = () => {
  const { data, meta, loading, isSaving, error, clearError, fetch, update } = useFuelSettings();

  return (
    <SettingsForm
      title="Paramètres carburant"
      subtitle="Devise, prix moyen et seuils de consommation de la flotte."
      icon="bi-fuel-pump"
      section="fuel"
      schema={fuelSettingsSchema}
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
            <Card title="Références">
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <FieldSelect
                    label="Devise"
                    value={values.currency}
                    onChange={(value) => setField('currency', value)}
                    options={CURRENCY_OPTIONS}
                    error={errors.currency}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <FieldSelect
                    label="Unité"
                    value={values.unit}
                    onChange={(value) => setField('unit', value)}
                    options={FUEL_UNITS}
                    error={errors.unit}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <FieldInput
                    label="Prix moyen au litre"
                    type="number"
                    min="0"
                    step="0.01"
                    value={values.averagePrice}
                    onChange={(value) => setField('averagePrice', value)}
                    error={errors.averagePrice}
                    hint="Référence pour le coût estimé des trajets."
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Seuil de consommation anormale (%)"
                    type="number"
                    min="0"
                    value={values.abnormalConsumptionThreshold}
                    onChange={(value) => setField('abnormalConsumptionThreshold', value)}
                    error={errors.abnormalConsumptionThreshold}
                    hint="Écart au-delà duquel la consommation est signalée."
                  />
                </div>
              </div>
            </Card>

            <Card title="Saisie" className="mt-3">
              <div className="d-flex flex-column gap-2">
                <FieldSwitch
                  label="Alerte de consommation anormale"
                  value={values.consumptionAlert}
                  onChange={(value) => setField('consumptionAlert', value)}
                />
                <FieldSwitch
                  label="Autoriser la modification du prix"
                  value={values.allowPriceEdit}
                  onChange={(value) => setField('allowPriceEdit', value)}
                  hint="Les conducteurs peuvent corriger le prix lors de la saisie."
                />
                <FieldSwitch
                  label="Autoriser la saisie manuelle"
                  value={values.allowManualEntry}
                  onChange={(value) => setField('allowManualEntry', value)}
                  hint="Saisie des pleins de carburant hors trajet."
                />
              </div>
            </Card>
          </div>

          <div className="col-lg-4">
            <SettingsSectionInfo section="fuel" updatedAt={meta?.updatedAt} />
          </div>
        </div>
      )}
    </SettingsForm>
  );
};

export default FuelSettingsPage;
