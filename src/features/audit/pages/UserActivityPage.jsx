/**
 * Navix Audit — UserActivityPage
 * --------------------------------------------------------------------------
 * Activité d'un utilisateur : profil (nom, rôle, e-mail, entreprise),
 * indicateurs (total, succès, échecs, critiques, dernière activité) et
 * chronologie de ses actions dans le journal. L'e-mail est réservé aux
 * profils disposant de `audit.viewSensitive`. Portée multi-tenant simulée.
 */
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, StatsCards, EmptyState } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { useAuditPermissions, useUserActivity } from '../hooks';
import { AuditTimeline } from '../components';
import { AUDIT_ICON, formatAuditDateTime, getUserEmail } from '../constants';
import './UserActivityPage.css';

const MASK = '••••••••';

const UserActivityPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { canViewSensitive } = useAuditPermissions();
  const { user, logs, summary } = useUserActivity(userId);

  const email = getUserEmail(userId);

  const stats = [
    {
      key: 'total',
      label: 'Actions',
      value: summary.total,
      hint: 'Dans le journal',
      variant: 'primary',
      icon: 'bi-journal-text',
    },
    {
      key: 'success',
      label: 'Succès',
      value: summary.byStatus.success,
      variant: 'success',
      icon: 'bi-check-circle',
    },
    {
      key: 'failed',
      label: 'Échecs',
      value: summary.byStatus.failed,
      variant: 'danger',
      icon: 'bi-x-octagon',
    },
    {
      key: 'critical',
      label: 'Critiques',
      value: summary.bySeverity.critical,
      variant: 'danger',
      icon: 'bi-shield-exclamation',
    },
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>{`Activité de ${user.name} — Navix Management`}</title>
      </Helmet>

      <PageHeader
        title={user.name}
        subtitle={`Activité de l'utilisateur dans le journal des actions.`}
        icon={AUDIT_ICON}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Journal des actions', to: ROUTES.AUDIT_LOGS },
          { label: user.name },
        ]}
        actions={
          <Button variant="outline" size="sm" icon="bi-arrow-left" onClick={() => navigate(ROUTES.AUDIT_LOGS)}>
            Retour au journal
          </Button>
        }
      />

      <Card className="navix-audit-user__profile" padding="lg">
        <div className="navix-audit-user__identity">
          <div className="navix-audit-user__avatar" aria-hidden="true">
            <i className="bi bi-person-fill" />
          </div>
          <div>
            <h2 className="navix-audit-user__name mb-1">{user.name}</h2>
            <p className="navix-audit-user__role mb-0">
              {user.role ?? '—'}
              {canViewSensitive && email ? ` · ${email}` : ''}
              {!canViewSensitive && email ? ' · e-mail masqué' : ''}
            </p>
          </div>
        </div>
        <dl className="navix-audit-user__facts">
          <div>
            <dt>Identifiant</dt>
            <dd>
              <code className="navix-audit-user__code">{userId}</code>
            </dd>
          </div>
          <div>
            <dt>Dernière activité</dt>
            <dd>{summary.lastActive ? formatAuditDateTime(summary.lastActive) : '—'}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>
              {canViewSensitive ? (
                email || '—'
              ) : (
                <span aria-label="Adresse e-mail masquée">{MASK}</span>
              )}
            </dd>
          </div>
        </dl>
      </Card>

      <StatsCards stats={stats} columns={4} className="navix-audit-user__stats" />

      <div className="navix-audit-user__activity">
        <h2 className="navix-audit-user__section-title">
          <i className="bi bi-clock-history me-2" aria-hidden="true" />
          Chronologie des actions
        </h2>
        {summary.total === 0 ? (
          <EmptyState
            icon="bi-journal-x"
            title="Aucune action"
            description="Cet utilisateur n'a aucune entrée dans le journal."
          />
        ) : (
          <AuditTimeline logs={logs} />
        )}
      </div>
    </PageContainer>
  );
};

export default UserActivityPage;
