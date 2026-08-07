/**
 * Navix Notifications — NotificationDetailsPage
 * --------------------------------------------------------------------------
 * Détail d'une notification : message complet, badges (type, catégorie,
 * sévérité, statut), entreprise et ressource liée (navigation générique),
 * dates et actions contextuelles (marquer lu / non lu, archiver, ignorer,
 * supprimer). Rechargée à partir du store pour rester cohérente.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState, DeleteModal } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useNotificationsStore } from '../store';
import { useNotificationActions } from '../hooks/useNotificationActions';
import {
  NotificationTypeBadge,
  NotificationCategoryBadge,
  NotificationSeverityBadge,
  NotificationStatusBadge,
  NotificationIcon,
} from '../components';
import {
  getNotificationKind,
  getNotificationType,
  getResourcePath,
  formatNotificationDate,
  formatNotificationDateTime,
  NOTIFICATION_ICON,
} from '../constants';
import './NotificationDetailsPage.css';

const InfoRow = ({ icon, label, children }) => (
  <div className="d-flex align-items-start gap-3 py-2">
    <span className="navix-notif-detail__icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <div className="min-w-0">
      <dt className="navix-notif-detail__label">{label}</dt>
      <dd className="navix-notif-detail__value mb-0">{children}</dd>
    </div>
  </div>
);

const NotificationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedNotification = useNotificationsStore((state) => state.selectedNotification);
  const isLoading = useNotificationsStore((state) => state.isLoading);
  const isSaving = useNotificationsStore((state) => state.isSaving);
  const error = useNotificationsStore((state) => state.error);
  const fetchNotification = useNotificationsStore((state) => state.fetchNotification);
  const clearError = useNotificationsStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const { actions, isSaving: isActionSaving } = useNotificationActions();

  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (id) fetchNotification(id);
    fetchCompanies();
  }, [id, fetchNotification, fetchCompanies]);

  const notification = selectedNotification?.id === id ? selectedNotification : null;

  const company = useMemo(
    () => (notification ? companies.find((item) => item.id === notification.companyId) : null),
    [companies, notification],
  );

  const runAction = async (action, successMessage) => {
    if (!id) return;
    const result = await action();
    if (result.success) {
      toast.success(successMessage);
      if (notification) fetchNotification(id);
    } else {
      toast.error(result.error || 'L’opération a échoué.');
    }
  };

  const handleMarkAsRead = () =>
    runAction(() => actions.markAsRead(id), 'Notification marquée comme lue.');

  const handleMarkAsUnread = () =>
    runAction(() => actions.markAsUnread(id), 'Notification marquée comme non lue.');

  const handleArchive = () =>
    runAction(() => actions.archive(id), 'Notification archivée.');

  const handleDismiss = () =>
    runAction(() => actions.dismiss(id), 'Notification ignorée.');

  const handleDelete = async () => {
    if (!id) return;
    const ok = await actions.remove(id);
    if (ok) navigate(ROUTES.NOTIFICATIONS);
  };

  if (!notification) {
    return (
      <PageContainer>
        <Helmet>
          <title>Notification — Navix Management</title>
        </Helmet>
        {isLoading ? (
          <LoadingState variant="text" lines={6} label="Chargement de la notification…" />
        ) : (
          <Alert variant="danger" closable onClose={clearError} className="mb-3">
            {error || 'Notification introuvable.'}
          </Alert>
        )}
      </PageContainer>
    );
  }

  const kind = getNotificationKind(notification.kind);
  const resourcePath = getResourcePath(notification.resourceType, notification.resourceId);
  const hasResource = resourcePath && resourcePath !== '/';

  const actionsNode = (
    <div className="d-flex gap-2 flex-wrap">
      {notification.status === 'unread' ? (
        <Button variant="outline" icon="bi-envelope-open" loading={isSaving || isActionSaving} onClick={handleMarkAsRead}>
          Marquer comme lue
        </Button>
      ) : (
        <Button variant="outline" icon="bi-envelope" loading={isSaving || isActionSaving} onClick={handleMarkAsUnread}>
          Marquer comme non lue
        </Button>
      )}
      {notification.status !== 'archived' && (
        <Button variant="outline" icon="bi-archive" loading={isSaving || isActionSaving} onClick={handleArchive}>
          Archiver
        </Button>
      )}
      {notification.status !== 'dismissed' && (
        <Button variant="outline" icon="bi-eye-slash" loading={isSaving || isActionSaving} onClick={handleDismiss}>
          Ignorer
        </Button>
      )}
      <Button variant="outline" icon="bi-trash3" loading={isSaving || isActionSaving} onClick={() => setDeleteOpen(true)}>
        Supprimer
      </Button>
    </div>
  );

  return (
    <PageContainer>
      <Helmet>
        <title>{`${notification.title} — Navix Management`}</title>
      </Helmet>

      <PageHeader
        title={notification.title}
        subtitle={company ? company.name : 'Notification'}
        icon={NOTIFICATION_ICON}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Notifications', to: ROUTES.NOTIFICATIONS },
          { label: notification.title },
        ]}
        actions={actionsNode}
      />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <div className="row g-3">
        <div className="col-lg-8">
          <Card title="Message">
            <div className="navix-notif-detail__hero">
              <NotificationIcon variant={getNotificationType(notification.type).variant} icon={kind.icon} size="lg" />
              <div className="navix-notif-detail__hero-body">
                <h2 className="navix-notif-detail__hero-title mb-0">{notification.title}</h2>
                <p className="navix-notif-detail__hero-message mb-0">{notification.message}</p>
              </div>
            </div>
          </Card>

          <Card title="Ressource liée" className="mt-3">
            {hasResource ? (
              <Link to={resourcePath} className="navix-notif-detail__resource">
                <span className="navix-notif-detail__resource-icon" aria-hidden="true">
                  <i className="bi bi-box-arrow-up-right" />
                </span>
                <span>
                  <span className="navix-notif-detail__resource-type">
                    {notification.resourceType}
                  </span>
                  <span className="navix-notif-detail__resource-id">
                    <code>{notification.resourceId}</code>
                  </span>
                </span>
              </Link>
            ) : (
              <p className="text-secondary mb-0">Aucune ressource liée à cette notification.</p>
            )}
          </Card>
        </div>

        <div className="col-lg-4">
          <Card title="Informations">
            <dl className="mb-0">
              <InfoRow icon="bi-tag" label="Type">
                <NotificationTypeBadge type={notification.type} />
              </InfoRow>
              <InfoRow icon="bi-diagram-3" label="Catégorie">
                <NotificationCategoryBadge category={notification.category} />
              </InfoRow>
              <InfoRow icon="bi-gauge" label="Sévérité">
                <NotificationSeverityBadge severity={notification.severity} />
              </InfoRow>
              <InfoRow icon="bi-envelope" label="Statut">
                <NotificationStatusBadge status={notification.status} />
              </InfoRow>
              <InfoRow icon="bi-buildings" label="Entreprise">
                {company ? company.name : '—'}
              </InfoRow>
              <InfoRow icon="bi-calendar-event" label="Créée le">
                {formatNotificationDateTime(notification.createdAt)}
              </InfoRow>
              <InfoRow icon="bi-check2-circle" label="Lue le">
                {notification.readAt ? formatNotificationDateTime(notification.readAt) : '—'}
              </InfoRow>
              <InfoRow icon="bi-hourglass-split" label="Expire le">
                {notification.expiresAt ? formatNotificationDate(notification.expiresAt) : '—'}
              </InfoRow>
              <InfoRow icon="bi-link-45deg" label="Identifiant">
                <code>{notification.id}</code>
              </InfoRow>
            </dl>
          </Card>
        </div>
      </div>

      <DeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        entityName={`« ${notification.title} »`}
        title="Supprimer la notification"
        loading={isSaving || isActionSaving}
        error={error}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
};

export default NotificationDetailsPage;
