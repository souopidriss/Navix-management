/**
 * Navix Settings — MaintenanceSettingsPage
 * --------------------------------------------------------------------------
 * Rappels, seuils et alertes d'entretien de la flotte (portée entreprise).
 */
import { Card } from '@/components/ui';
import { useMaintenanceSettings } from '../hooks';
import { maintenanceSettingsSchema } from '../schemas';
import { SettingsForm, SettingsSectionInfo, FieldInput, FieldSwitch } from '../components';

const MaintenanceSettingsPage = () => {
  const { data, meta, loading, isSaving, error, clearError, fetch, update } = useMaintenanceSettings();

  return (
    <SettingsForm
      title="Paramètres de maintenance"
      subtitle="Rappels, seuils de kilométrage et alertes d’entretien."
      icon="bi-wrench-adjustable"
      section="maintenance"
      schema={maintenanceSettingsSchema}
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
            <Card title="Rappels">
              <div className="row g-3">
                <div className="col-12">
                  <FieldSwitch
                    label="Activer les rappels d’entretien"
                    value={values.reminderEnabled}
                    onChange={(value) => setField('reminderEnabled', value)}
                    hint="Rappelle les entretiens programmés aux équipes."
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Rappel J—n (jours avant)"
                    type="number"
                    min="0"
                    value={values.reminderDays}
                    onChange={(value) => setField('reminderDays', value)}
                    error={errors.reminderDays}
                    disabled={!values.reminderEnabled}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Seuil kilométrique (km)"
                    type="number"
                    min="0"
                    value={values.mileageThreshold}
                    onChange={(value) => setField('mileageThreshold', value)}
                    error={errors.mileageThreshold}
                    hint="Kilométrage avant la prochaine révision."
                  />
                </div>
              </div>
            </Card>

            <Card title="Alertes" className="mt-3">
              <div className="d-flex flex-column gap-2">
                <FieldSwitch
                  label="Planification automatique"
                  value={values.automaticMaintenance}
                  onChange={(value) => setField('automaticMaintenance', value)}
                  hint="Crée automatiquement l’entretien à l’échéance."
                />
                <FieldSwitch
                  label="Alerte d’entretien programmé"
                  value={values.maintenanceAlert}
                  onChange={(value) => setField('maintenanceAlert', value)}
                />
                <FieldSwitch
                  label="Alerte entretien en retard"
                  value={values.overdueMaintenance}
                  onChange={(value) => setField('overdueMaintenance', value)}
                />
                <FieldSwitch
                  label="Alerte entretien critique"
                  value={values.criticalMaintenance}
                  onChange={(value) => setField('criticalMaintenance', value)}
                />
              </div>
            </Card>
          </div>

          <div className="col-lg-4">
            <SettingsSectionInfo section="maintenance" updatedAt={meta?.updatedAt} />
          </div>
        </div>
      )}
    </SettingsForm>
  );
};

export default MaintenanceSettingsPage;
