/**
 * Navix Settings — SecuritySettingsPage
 * --------------------------------------------------------------------------
 * Sécurité du compte : double authentification, délai de session, appareils
 * et historique de connexion. Les listes sont simulées et en lecture seule ;
 * le changement de mot de passe redirigera vers le futur module dédié.
 * (Portée utilisateur.)
 */
import { Badge, Card } from '@/components/ui';
import { useSecuritySettings } from '../hooks';
import { securitySettingsSchema } from '../schemas';
import { SettingsForm, SettingsSectionInfo, FieldInput, FieldSwitch } from '../components';

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
  }).format(date);
};

const SessionRow = ({ session }) => (
  <li className="d-flex justify-content-between align-items-center py-2 border-bottom">
    <div className="d-flex align-items-center gap-2">
      <i className="bi bi-display text-secondary" aria-hidden="true" />
      <div>
        <div className="fw-semibold small">
          {session.device}
          {session.current && <Badge variant="success" size="sm" className="ms-2">Session actuelle</Badge>}
        </div>
        <div className="text-secondary small">
          {session.location} · {session.ipAddress} · actif {formatDateTime(session.lastActiveAt)}
        </div>
      </div>
    </div>
  </li>
);

const DeviceRow = ({ device }) => (
  <li className="d-flex justify-content-between align-items-center py-2 border-bottom">
    <div className="d-flex align-items-center gap-2">
      <i className="bi bi-shield-check text-secondary" aria-hidden="true" />
      <div>
        <div className="fw-semibold small">{device.label}</div>
        <div className="text-secondary small">Vu pour la dernière fois le {formatDateTime(device.lastSeenAt)}</div>
      </div>
    </div>
  </li>
);

const LoginRow = ({ entry }) => (
  <li className="d-flex justify-content-between align-items-center py-2 border-bottom">
    <div className="d-flex align-items-center gap-2">
      <i className="bi bi-shield-lock text-secondary" aria-hidden="true" />
      <div>
        <div className="fw-semibold small">{entry.device}</div>
        <div className="text-secondary small">{entry.ipAddress} · {formatDateTime(entry.at)}</div>
      </div>
    </div>
    <Badge variant={entry.status === 'success' ? 'success' : 'warning'} size="sm">
      {entry.status === 'success' ? 'Réussi' : 'Attention'}
    </Badge>
  </li>
);

const SecuritySettingsPage = () => {
  const { data, meta, loading, isSaving, error, clearError, fetch, update } = useSecuritySettings();

  return (
    <SettingsForm
      title="Paramètres de sécurité"
      subtitle="Sécurisez votre compte et suivez les connexions récentes."
      icon="bi-shield-lock"
      section="security"
      schema={securitySettingsSchema}
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
            <Card title="Protection du compte">
              <div className="row g-3">
                <div className="col-12">
                  <FieldSwitch
                    label="Authentification à deux facteurs (2FA)"
                    value={values.twoFactorEnabled}
                    onChange={(value) => setField('twoFactorEnabled', value)}
                    hint="Exige un code supplémentaire lors de la connexion."
                    error={errors.twoFactorEnabled}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Expiration de session (minutes)"
                    type="number"
                    min="5"
                    value={values.sessionTimeoutMinutes}
                    onChange={(value) => setField('sessionTimeoutMinutes', value)}
                    error={errors.sessionTimeoutMinutes}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldInput
                    label="Dernier changement de mot de passe"
                    value={values.passwordLastChanged ? formatDateTime(values.passwordLastChanged) : '—'}
                    disabled
                  />
                </div>
              </div>
            </Card>

            <Card title="Sessions actives" className="mt-3">
              <ul className="list-unstyled mb-0">
                {(values.sessions ?? []).map((session) => (
                  <SessionRow key={session.id} session={session} />
                ))}
                {(values.sessions ?? []).length === 0 && (
                  <li className="text-secondary small">Aucune session active.</li>
                )}
              </ul>
            </Card>

            <Card title="Appareils de confiance" className="mt-3">
              <ul className="list-unstyled mb-0">
                {(values.trustedDevices ?? []).map((device) => (
                  <DeviceRow key={device.id} device={device} />
                ))}
                {(values.trustedDevices ?? []).length === 0 && (
                  <li className="text-secondary small">Aucun appareil de confiance.</li>
                )}
              </ul>
            </Card>

            <Card title="Historique de connexion" className="mt-3">
              <ul className="list-unstyled mb-0">
                {(values.loginHistory ?? []).map((entry) => (
                  <LoginRow key={entry.id} entry={entry} />
                ))}
                {(values.loginHistory ?? []).length === 0 && (
                  <li className="text-secondary small">Aucune connexion enregistrée.</li>
                )}
              </ul>
            </Card>
          </div>

          <div className="col-lg-4">
            <SettingsSectionInfo section="security" updatedAt={meta?.updatedAt} />
          </div>
        </div>
      )}
    </SettingsForm>
  );
};

export default SecuritySettingsPage;
