/**
 * Navix Partner Portal — PartnerNotificationsPage (PROMPT 067)
 * --------------------------------------------------------------------------
 * Centre de notifications et d'activités Premium pour le rôle PARTENAIRE.
 *
 *   HEADER « Notifications » + badge non lues + « Tout marquer lu »
 *   → 4 KPI premium (Notifications / Non lues / Importantes / Aujourd'hui)
 *   → Onglets Notifications / Activités
 *   → Recherche + filtres (Statut / Type / Priorité / Période)
 *   → Cartes notifications (sélection, actions, pagination)
 *   → Timeline activités récentes
 *   → Suppression confirmée
 *
 * Multi-tenant : le service filtre par companyId + userId partenaire.
 * RBAC : les actions de marquage sont accessibles au partenaire.
 */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState, ErrorState, ConfirmDialog } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { usePartnerContext } from '../hooks/usePartnerContext';
import usePartnerNotifications from '../hooks/usePartnerNotifications';
import PartnerNotificationStats from '../components/PartnerNotifications/PartnerNotificationStats';
import PartnerNotificationFilters from '../components/PartnerNotifications/PartnerNotificationFilters';
import PartnerNotificationCard from '../components/PartnerNotifications/PartnerNotificationCard';
import PartnerActivityTimeline from '../components/PartnerNotifications/PartnerActivityTimeline';
import { NotificationEmptyState, ErrorNotificationState } from '../components/PartnerNotifications/PartnerNotificationEmptyState';
import '../components/PartnerNotifications/PartnerNotifications.css';

const TABS = [
  { key: 'notifications', label: 'Notifications', icon: 'bi-bell' },
  { key: 'activities', label: 'Activités', icon: 'bi-activity' },
];

const PartnerNotificationsPage = () => {
  const { companyName } = usePartnerContext();
  const {
    filteredNotifications,
    activities,
    unreadCount,
    statistics,
    isLoading,
    error,
    refetch,
    search,
    setSearch,
    filters,
    setFilters,
    hasActiveFilters,
    resetFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    pageItems,
    markAsRead,
    markManyAsRead,
    markManyAsUnread,
    markAllAsRead,
    archive,
    archiveMany,
    deleteNotification,
    deleteMany,
  } = usePartnerNotifications();

  const [activeTab, setActiveTab] = useState('notifications');
  const [selected, setSelected] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleMarkAsRead = async (ids) => {
    try {
      const list = Array.isArray(ids) ? ids : [ids];
      if (list.length > 1) {
        await markManyAsRead(list);
      } else {
        await markAsRead(list[0]);
      }
      toast.success(list.length > 1 ? 'Notifications marquées comme lues.' : 'Notification marquée comme lue.');
      setSelected([]);
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
      setSelected([]);
      refetch();
    } catch (err) {
      toast.error(err?.message || 'Impossible de mettre à jour la notification.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllAsRead();
      toast.success(result?.updated > 0 ? `${result.updated} notification(s) marquée(s) comme lue(s).` : 'Aucune notification non lue.');
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
      setSelected([]);
      refetch();
    } catch (err) {
      toast.error(err?.message || "Impossible d'archiver la notification.");
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
      setSelected([]);
      refetch();
    } catch (err) {
      setDeleteError(err?.message || 'Impossible de supprimer la notification.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && filteredNotifications.length === 0 && activities.length === 0) {
    return (
      <PageContainer>
        <Helmet>
          <title>Notifications — Navix Partenaire</title>
        </Helmet>
        <PageHeader
          title="Notifications"
          subtitle={`Alertes et événements de ${companyName || 'votre entreprise partenaire'}.`}
          icon="bi-bell"
          breadcrumbs={[{ label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD }, { label: 'Notifications' }]}
        />
        <LoadingState message="Chargement des notifications…" />
      </PageContainer>
    );
  }

  if (error && filteredNotifications.length === 0) {
    return (
      <PageContainer>
        <Helmet>
          <title>Notifications — Navix Partenaire</title>
        </Helmet>
        <PageHeader
          title="Notifications"
          subtitle={`Alertes et événements de ${companyName || 'votre entreprise partenaire'}.`}
          icon="bi-bell"
          breadcrumbs={[{ label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD }, { label: 'Notifications' }]}
        />
        <ErrorNotificationState onRetry={refetch} />
      </PageContainer>
    );
  }

  const hasSelection = selected.length > 0;

  return (
    <PageContainer>
      <Helmet>
        <title>Notifications — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title="Notifications"
        subtitle="Restez informé des événements importants de votre activité."
        icon="bi-bell"
        breadcrumbs={[{ label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD }, { label: 'Notifications' }]}
        actions={
          <div className="d-flex align-items-center gap-2">
            {unreadCount > 0 && (
              <span className="badge text-bg-danger">
                <i className="bi bi-envelope me-1" aria-hidden="true" />
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </span>
            )}
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" icon="bi-check2-all" onClick={handleMarkAllAsRead} aria-label="Tout marquer lu">
                Tout marquer lu
              </Button>
            )}
            <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={refetch} aria-label="Actualiser">
              <span className="visually-hidden">Actualiser</span>
            </Button>
          </div>
        }
      />

      <PartnerNotificationStats stats={statistics} loading={isLoading} />

      {/* Tabs */}
      <div className="pn-tabs" role="tablist" aria-label="Notifications et activités">
        {TABS.map((tab) => {
          const count = tab.key === 'notifications' ? filteredNotifications.length : activities.length;
          return (
            <button
              key={tab.key}
              type="button"
              className={`pn-tab ${activeTab === tab.key ? 'pn-tab--active' : ''}`}
              role="tab"
              aria-selected={activeTab === tab.key}
              aria-controls={`pn-panel-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <i className={`bi ${tab.icon} me-1`} aria-hidden="true" />
              {tab.label}
              <span className="pn-tab__count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Notifications Panel */}
      {activeTab === 'notifications' && (
        <div id="pn-panel-notifications" role="tabpanel" aria-label="Notifications">
          <PartnerNotificationFilters
            search={search}
            onSearchChange={setSearch}
            filters={filters}
            onFilterChange={setFilters}
            totalItems={totalItems}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
          />

          {hasSelection && (
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              <span className="pn-bulk">
                {selected.length} sélectionnée{selected.length > 1 ? 's' : ''}
              </span>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleMarkAsRead(selected)}>
                <i className="bi bi-envelope-open me-1" aria-hidden="true" />
                Marquer lu
              </button>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => handleMarkAsUnread(selected)}>
                <i className="bi bi-envelope me-1" aria-hidden="true" />
                Non lu
              </button>
              <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => handleArchive(selected)}>
                <i className="bi bi-archive me-1" aria-hidden="true" />
                Archiver
              </button>
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteRequest(selected)}>
                <i className="bi bi-trash me-1" aria-hidden="true" />
                Supprimer
              </button>
              <button type="button" className="btn btn-sm btn-link" onClick={() => setSelected([])}>
                Annuler
              </button>
            </div>
          )}

          {filteredNotifications.length === 0 ? (
            <NotificationEmptyState hasFilters={hasActiveFilters} />
          ) : (
            <>
              <div className="d-flex align-items-center gap-2 mb-2">
                <div className="form-check">
                  <input
                    id="pn-select-all"
                    className="form-check-input"
                    type="checkbox"
                    checked={pageItems.length > 0 && pageItems.every((item) => selected.includes(item.id))}
                    onChange={() => {
                      if (pageItems.every((item) => selected.includes(item.id))) {
                        setSelected((prev) => prev.filter((id) => !pageItems.some((item) => item.id === id)));
                      } else {
                        setSelected((prev) => [...new Set([...prev, ...pageItems.map((item) => item.id)])]);
                      }
                    }}
                  />
                  <label className="form-check-label small" htmlFor="pn-select-all">
                    Tout sélectionner
                  </label>
                </div>
              </div>

              <div className="vstack gap-2">
                {pageItems.map((notification) => (
                  <PartnerNotificationCard
                    key={notification.id}
                    notification={notification}
                    isSelected={selected.includes(notification.id)}
                    onSelect={handleSelect}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAsUnread={handleMarkAsUnread}
                    onArchive={handleArchive}
                    onDelete={handleDeleteRequest}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3 pt-3 border-top border-secondary-subtle">
                  <div className="d-flex align-items-center gap-2">
                    <select
                      className="form-select form-select-sm"
                      style={{ width: 'auto' }}
                      value={pageSize}
                      onChange={(event) => setPageSize(Number(event.target.value))}
                      aria-label="Notifications par page"
                    >
                      <option value={8}>8 par page</option>
                      <option value={16}>16 par page</option>
                      <option value={32}>32 par page</option>
                    </select>
                    <span className="text-secondary small">
                      Page {page} / {totalPages}
                    </span>
                  </div>
                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <i className="bi bi-chevron-left" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      <i className="bi bi-chevron-right" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Activities Panel */}
      {activeTab === 'activities' && (
        <div id="pn-panel-activities" role="tabpanel" aria-label="Activités">
          <PartnerActivityTimeline activities={activities} loading={isLoading} />
        </div>
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

export default PartnerNotificationsPage;
