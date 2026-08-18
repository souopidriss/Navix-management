import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import { PageContainer, PageHeader, ConfirmDialog } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { useClientData } from '../hooks/useClientData';
import { useClientNotifications } from '../hooks/useClientNotifications';
import ClientNotificationCenter from '../components/ClientNotifications/ClientNotificationCenter';
import '../components/ClientNotifications/ClientNotifications.css';

const ClientNotificationsPage = () => {
  const { currentClient, isEnterprise } = useClientData();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead,
    markManyAsRead,
    markManyAsUnread,
    markAllAsRead,
    archive,
    archiveMany,
    deleteNotification,
    deleteMany,
  } = useClientNotifications();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleMarkAsRead = async (ids) => {
    try {
      const list = Array.isArray(ids) ? ids : [ids];
      if (list.length > 1) {
        await markManyAsRead(list);
      } else {
        await markAsRead(list[0]);
      }
      toast.success(list.length > 1 ? 'Notifications marquées comme lues.' : 'Notification marquée comme lue.');
      refetch();
    } catch (err) {
      toast.error(err?.message || 'Impossible de mettre à jour la notification.');
    }
  };

  const handleMarkAsUnread = async (ids) => {
    try {
      const list = Array.isArray(ids) ? ids : [ids];
      await markManyAsUnread(list);
      toast.success(list.length > 1 ? 'Notifications marquées comme non lues.' : 'Notification marquée comme non lue.');
      refetch();
    } catch (err) {
      toast.error(err?.message || 'Impossible de mettre à jour la notification.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllAsRead();
      toast.success(result?.count > 0 ? `${result.count} notification(s) marquée(s) comme lue(s).` : 'Aucune notification non lue.');
      refetch();
    } catch (err) {
      toast.error(err?.message || 'Impossible de marquer les notifications comme lues.');
    }
  };

  const handleArchive = async (ids) => {
    try {
      const list = Array.isArray(ids) ? ids : [ids];
      if (list.length > 1) {
        await archiveMany(list);
      } else {
        await archive(list[0]);
      }
      toast.success(list.length > 1 ? 'Notifications archivées.' : 'Notification archivée.');
      refetch();
    } catch (err) {
      toast.error(err?.message || 'Impossible d’archiver la notification.');
    }
  };

  const handleDeleteRequest = (ids) => {
    setDeleteTarget(Array.isArray(ids) ? ids : [ids]);
    setDeleteError('');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      if (deleteTarget.length > 1) {
        await deleteMany(deleteTarget);
      } else {
        await deleteNotification(deleteTarget[0]);
      }
      toast.success(deleteTarget.length > 1 ? 'Notifications supprimées.' : 'Notification supprimée.');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      setDeleteError(err?.message || 'Impossible de supprimer la notification.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer>
      <Helmet>
        <title>Notifications — Navix Client</title>
      </Helmet>

      <PageHeader
        title="Notifications"
        subtitle={
          isEnterprise
            ? `Alertes et événements de la flotte de ${currentClient?.companyName || 'votre entreprise'} au Cameroun 🇨🇲.`
            : 'Les notifications ne sont pas disponibles pour un client particulier.'
        }
        icon="bi-bell"
        breadcrumbs={[{ label: 'Espace Client', to: ROUTES.CLIENT_DASHBOARD }, { label: 'Notifications' }]}
        actions={
          <div className="d-flex align-items-center gap-2">
            <span className="badge text-bg-primary">
              <i className="bi bi-envelope-open me-1" aria-hidden="true" />
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </span>
            <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={refetch} aria-label="Actualiser">
              <span className="visually-hidden">Actualiser</span>
            </Button>
          </div>
        }
      />

      {!isEnterprise ? (
        <div className="text-center py-5 text-secondary">
          <i className="bi bi-bell fs-1 d-block mb-3" aria-hidden="true" />
          <p className="mb-0">Les notifications ne sont pas disponibles pour un client particulier.</p>
        </div>
      ) : (
        <ClientNotificationCenter
          notifications={notifications}
          loading={isLoading}
          error={error}
          onRetry={refetch}
          onMarkAsRead={handleMarkAsRead}
          onMarkAsUnread={handleMarkAsUnread}
          onMarkAllAsRead={handleMarkAllAsRead}
          onArchive={handleArchive}
          onDelete={handleDeleteRequest}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={deleteTarget?.length > 1 ? 'Supprimer ces notifications' : 'Supprimer cette notification'}
        icon="bi-trash3"
        confirmLabel={deleteTarget?.length > 1 ? 'Supprimer' : 'Supprimer la notification'}
        confirmVariant="danger"
        loading={isDeleting}
        error={deleteError}
        onConfirm={handleDelete}
        message={
          deleteTarget ? (
            <p className="mb-0">
              {deleteTarget.length > 1
                ? `Vous êtes sur le point de supprimer ${deleteTarget.length} notifications. Cette action est irréversible.`
                : 'Vous êtes sur le point de supprimer cette notification. Cette action est irréversible.'}
            </p>
          ) : null
        }
      />
    </PageContainer>
  );
};

export default ClientNotificationsPage;
