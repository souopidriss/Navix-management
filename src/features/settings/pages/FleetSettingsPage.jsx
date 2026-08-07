/**
 * Navix Settings — FleetSettingsPage
 * --------------------------------------------------------------------------
 * Unités de mesure et seuils d'alerte du suivi de flotte (portée entreprise).
 */
import { Card } from '@/components/ui';
import { useFleetSettings } from '../hooks';
import { fleetSettingsSchema } from '../schemas';
import { SettingsForm, SettingsSectionInfo, FieldInput, FieldSelect, FieldSwitch } from '../components';
import { DISTANCE_UNITS, CONSUMPTION_UNITS, FUEL_UNITS } from '../constants';

const FleetSettingsPage = () => {
  const { data, meta, loading, isSaving, error, clearError, fetch, update } = useFleetSettings();

  return (
    <SettingsForm
      title="Paramètres de la flotte"
      subtitle="Unités de mesure, seuils d’alerte et fonctionnalités de suivi."
      icon="bi-truck"
      section="fleet"
      schema={fleetSettingsSchema}
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
            <Card title="Unités de mesure">
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <FieldSelect
                    label="Unité de distance"
                    value={values.distanceUnit}
                    onChange={(value) => setField('distanceUnit', value)}
                    options={DISTANCE_UNITS}
                    error={errors.distanceUnit}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <FieldSelect
                    label="Consommation"
                    value={values.consumptionUnit}
                    onChange={(value) => setField('consumptionUnit', value)}
                    options={CONSUMPTION_UNITS}
                    error={errors.consumptionUnit}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <FieldSelect
                    label="Unité de carburant"
                    value={values.fuelUnit}
                    onChange={(value) => setField('fuelUnit', value)}
                    options={FUEL_UNITS}
                    error={errors.fuelUnit}
                  />
                </div>
              </div>
            </Card>

            <Card title="Seuils d’alerte" className="mt-3">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Alerte kilométrage (km)"
                    type="number"
                    min="0"
                    value={values.mileageAlertThreshold}
                    onChange={(value) => setField('mileageAlertThreshold', value)}
                    error={errors.mileageAlertThreshold}
                    hint="Avertit avant l’entretien périodique."
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Alerte maintenance (jours)"
                    type="number"
                    min="0"
                    value={values.maintenanceAlertThreshold}
                    onChange={(value) => setField('maintenanceAlertThreshold', value)}
                    error={errors.maintenanceAlertThreshold}
                    hint="Jours avant l’échéance d’entretien."
                  />
                </div>
              </div>
            </Card>

            <Card title="Suivi" className="mt-3">
              <div className="d-flex flex-column gap-2">
                <FieldSwitch
                  label="Autoriser les véhicules inactifs"
                  value={values.allowInactiveVehicles}
                  onChange={(value) => setField('allowInactiveVehicles', value)}
                  hint="Conserve les véhicules hors service dans la flotte."
                />
                <FieldSwitch
                  label="Activer le suivi kilométrique"
                  value={values.enableMileageTracking}
                  onChange={(value) => setField('enableMileageTracking', value)}
                  hint="Enregistrement du kilométrage par véhicule."
                />
                <FieldSwitch
                  label="Activer le suivi de carburant"
                  value={values.enableFuelTracking}
                  onChange={(value) => setField('enableFuelTracking', value)}
                  hint="Saisie des consommations et plein de carburant."
                />
              </div>
            </Card>
          </div>

          <div className="col-lg-4">
            <SettingsSectionInfo section="fleet" updatedAt={meta?.updatedAt} />
          </div>
        </div>
      )}
    </SettingsForm>
  );
};

export default FleetSettingsPage;
