/**
 * Navix Settings — NotificationSettingsPage
 * --------------------------------------------------------------------------
 * Canaux et préférences de notification de l'application (portée entreprise).
 */
import { Card } from '@/components/ui';
import { useNotificationSettings } from '../hooks';
import { notificationSettingsSchema } from '../schemas';
import { SettingsForm, SettingsSectionInfo, FieldSwitch } from '../components';

const ALERTS = [
  { key: 'maintenance', label: 'Maintenance', hint: 'Rappels et alertes d’entretien' },
  { key: 'fuel', label: 'Carburant', hint: 'Consommations et prix' },
  { key: 'documents', label: 'Documents', hint: 'Expiration et dépôt de fichiers' },
  { key: 'billing', label: 'Facturation', hint: 'Factures et paiements' },
  { key: 'subscription', label: 'Abonnement', hint: 'Plan, renouvellement et limites' },
  { key: 'audit', label: 'Journal d’audit', hint: 'Actions sensibles de l’équipe' },
];

const NotificationSettingsPage = () => {
  const { data, meta, loading, isSaving, error, clearError, fetch, update } = useNotificationSettings();

  return (
    <SettingsForm
      title="Paramètres des notifications"
      subtitle="Activez ou désactivez les canaux et les types de notifications."
      icon="bi-bell"
      section="notifications"
      schema={notificationSettingsSchema}
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
            <Card title="Canaux">
              <div className="d-flex flex-column gap-2">
                <FieldSwitch
                  label="Notifications activées"
                  value={values.enabled}
                  onChange={(value) => setField('enabled', value)}
                  hint="Interrupteur général de toutes les notifications."
                  error={errors.enabled}
                />
                <FieldSwitch
                  label="Notifications par e-mail"
                  value={values.email}
                  onChange={(value) => setField('email', value)}
                  disabled={!values.enabled}
                />
                <FieldSwitch
                  label="Notifications dans l’application"
                  value={values.system}
                  onChange={(value) => setField('system', value)}
                  disabled={!values.enabled}
                />
              </div>
            </Card>

            <Card title="Types d’événements" className="mt-3">
              <div className="d-flex flex-column gap-2">
                {ALERTS.map((alert) => (
                  <FieldSwitch
                    key={alert.key}
                    label={alert.label}
                    hint={alert.hint}
                    value={values[alert.key]}
                    onChange={(value) => setField(alert.key, value)}
                    disabled={!values.enabled}
                  />
                ))}
                <FieldSwitch
                  label="Alertes critiques"
                  value={values.critical}
                  onChange={(value) => setField('critical', value)}
                  disabled={!values.enabled}
                  hint="Toujours notifier les incidents critiques même si tout est désactivé."
                />
              </div>
            </Card>
          </div>

          <div className="col-lg-4">
            <SettingsSectionInfo section="notifications" updatedAt={meta?.updatedAt} />
          </div>
        </div>
      )}
    </SettingsForm>
  );
};

export default NotificationSettingsPage;
