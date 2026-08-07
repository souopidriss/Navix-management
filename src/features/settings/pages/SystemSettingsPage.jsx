/**
 * Navix Settings — SystemSettingsPage
 * --------------------------------------------------------------------------
 * Version, environnement et statut du système (lecture seule), ainsi que le
 * mode maintenance et les notifications système (modifiables).
 * (Portée plateforme.)
 */
import { Badge, Card } from '@/components/ui';
import { useSystemSettings } from '../hooks';
import { systemSettingsSchema } from '../schemas';
import { SettingsForm, SettingsSectionInfo, FieldInput, FieldSwitch } from '../components';

const STATUS_META = {
  operational: { label: 'Opérationnel', variant: 'success' },
  degraded: { label: 'Dégradé', variant: 'warning' },
  maintenance: { label: 'Maintenance', variant: 'info' },
  down: { label: 'Indisponible', variant: 'danger' },
};

const formatDateTime = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

const SystemSettingsPage = () => {
  const { data, meta, loading, isSaving, error, clearError, fetch, update } = useSystemSettings();

  const status = STATUS_META[data?.systemStatus] ?? STATUS_META.operational;

  return (
    <SettingsForm
      title="Paramètres système"
      subtitle="Version, environnement et statut de la plateforme."
      icon="bi-cpu"
      section="system"
      schema={systemSettingsSchema}
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
            <Card title="Informations">
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <FieldInput label="Version de l’application" value={values.appVersion} disabled />
                </div>
                <div className="col-12 col-md-4">
                  <FieldInput label="Environnement" value={values.environment} disabled />
                </div>
                <div className="col-12 col-md-4">
                  <FieldInput label="Dernière synchronisation" value={formatDateTime(values.lastSyncAt)} disabled />
                </div>
                <div className="col-12">
                  <div className="d-flex align-items-center gap-2">
                    <span className="form-label mb-0">Statut du système</span>
                    <Badge variant={status.variant} dot>
                      {status.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Maintenance" className="mt-3">
              <div className="d-flex flex-column gap-2">
                <FieldSwitch
                  label="Mode maintenance"
                  value={values.maintenanceMode}
                  onChange={(value) => setField('maintenanceMode', value)}
                  error={errors.maintenanceMode}
                  hint="Limite l’accès pendant les opérations de maintenance."
                />
                <FieldSwitch
                  label="Notifications système"
                  value={values.systemNotifications}
                  onChange={(value) => setField('systemNotifications', value)}
                  error={errors.systemNotifications}
                  hint="Annonces et alertes d’infrastructure."
                />
              </div>
            </Card>

            <Card title="À propos" className="mt-3">
              <p className="small text-secondary mb-0">
                Navix Management v{values.appVersion} — environnement {values.environment}. Données
                simulées en attendant le backend Express.js / MySQL.
              </p>
            </Card>
          </div>

          <div className="col-lg-4">
            <SettingsSectionInfo section="system" updatedAt={meta?.updatedAt} />
          </div>
        </div>
      )}
    </SettingsForm>
  );
};

export default SystemSettingsPage;
