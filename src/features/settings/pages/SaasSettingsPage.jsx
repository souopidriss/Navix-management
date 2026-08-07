/**
 * Navix Settings — SaasSettingsPage
 * --------------------------------------------------------------------------
 * Vue en lecture seule du plan SaaS : statut, période et consommation par
 * rapport aux limites. La gestion complète se trouve dans Abonnements.
 * (Portée plateforme / entreprise.)
 */
import { Link } from 'react-router-dom';
import { Badge, Card } from '@/components/ui';
import { useSaasSettings } from '../hooks';
import { saasSettingsSchema } from '../schemas';
import { SettingsForm, SettingsSectionInfo } from '../components';
import { ROUTES } from '@/routes/route.constants';

const STATUS_VARIANTS = {
  active: 'success',
  trial: 'info',
  overdue: 'danger',
  suspended: 'warning',
};

const UsageRow = ({ label, used, limit, unit }) => {
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between small mb-1">
        <span className="fw-semibold">{label}</span>
        <span className="text-secondary">
          {used} / {limit} {unit}
        </span>
      </div>
      <div className="progress" role="progressbar" aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100" aria-label={`${label} : ${percent} % utilisé`}>
        <div
          className={`progress-bar ${percent >= 90 ? 'bg-danger' : percent >= 75 ? 'bg-warning' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const formatDate = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
};

const SaasSettingsPage = () => {
  const { data, meta, loading, isSaving, error, clearError, fetch } = useSaasSettings();

  const status = data?.status ?? 'active';

  return (
    <SettingsForm
      title="Paramètres SaaS"
      subtitle="Plan, période et consommation de votre abonnement (lecture seule)."
      icon="bi-box-seam"
      section="saas"
      schema={saasSettingsSchema}
      data={data}
      onSave={async () => ({ success: true })}
      onRetry={fetch}
      isSaving={isSaving}
      loading={loading}
      error={error}
      onClearError={clearError}
      showSave={false}
      contained={false}
    >
      {({ values }) => (
        <div className="row g-3">
          <div className="col-lg-8">
            <Card title="Abonnement en cours">
              <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                <div>
                  <div className="h4 mb-0">{values.planLabel}</div>
                  <div className="text-secondary small">
                    <code>{values.plan}</code>
                  </div>
                </div>
                <Badge variant={STATUS_VARIANTS[status] ?? 'secondary'}>{status}</Badge>
              </div>
              <dl className="row mb-0">
                <dt className="col-6 col-md-4 text-secondary small">Début</dt>
                <dd className="col-6 col-md-8">{formatDate(values.startDate)}</dd>
                <dt className="col-6 col-md-4 text-secondary small">Renouvellement</dt>
                <dd className="col-6 col-md-8">{formatDate(values.renewalDate)}</dd>
                <dt className="col-6 col-md-4 text-secondary small">Expiration</dt>
                <dd className="col-6 col-md-8">{formatDate(values.expirationDate)}</dd>
                <dt className="col-6 col-md-4 text-secondary small">Période d’essai</dt>
                <dd className="col-6 col-md-8">
                  {values.isTrial ? `Jusqu’au ${formatDate(values.trialEndsAt)}` : 'Non'}
                </dd>
              </dl>
            </Card>

            <Card title="Consommation" className="mt-3">
              <UsageRow label="Véhicules" used={values.usage.vehicles} limit={values.limits.vehicles} unit="" />
              <UsageRow label="Conducteurs" used={values.usage.drivers} limit={values.limits.drivers} unit="" />
              <UsageRow label="Stockage" used={values.usage.storageGb} limit={values.limits.storageGb} unit="Go" />
              <UsageRow label="Utilisateurs" used={values.usage.seats} limit={values.limits.seats} unit="" />
            </Card>
          </div>

          <div className="col-lg-4">
            <SettingsSectionInfo section="saas" updatedAt={meta?.updatedAt} />
            <Card title="Gestion de l’abonnement" className="mt-3">
              <p className="small text-secondary mb-3">
                Consultez les plans, l’utilisation détaillée et l’historique de votre abonnement.
              </p>
              <Link className="btn btn-outline-primary w-100" to={ROUTES.SUBSCRIPTIONS}>
                <i className="bi bi-box-seam me-2" aria-hidden="true" />
                Ouvrir les abonnements
              </Link>
            </Card>
          </div>
        </div>
      )}
    </SettingsForm>
  );
};

export default SaasSettingsPage;
