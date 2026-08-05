/**
 * Navix Notifications — NotificationsPage
 * --------------------------------------------------------------------------
 * Centre de notifications : indicateurs, bannière d'urgence, recherche
 * instantanée, filtres, tri, pagination, états chargement / erreur / vide et
 * actions (détail, marquer lu / non lu, archiver, ignorer, supprimer,
 * générer des alertes simulées). Responsive : tableau sur desktop, cartes sur
 * tablette / mobile.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Button, Alert } from '@/components/ui';
import { PageContainer, PageHeader, Pagination, LoadingState, DeleteModal } from '@/components/core';
import { ROUTES, notificationDetailPath } from '@/routes/route.constants';
import { useMediaQuery } from '@/hooks';
import { useCompaniesStore } from '@/features/companies';
import { useNotificationsStore } from '../store';
import { useNotificationListData, useNotificationActions, useAlerts } from '../hooks';
import {
  NotificationStats,
  AlertBanner,
  NotificationSearchBar,
  NotificationFilters,
  NotificationTable,
  NotificationCard,
  NotificationEmptyState,
} from '../components';
import { NOTIFICATION_ICON, SEVERITY_ORDER } from '../constants';

const NotificationsPage = () => {
  const navigate = useNavigate();

  const notifications = useNotificationsStore((state) => state.notifications);
  const stats = useNotificationsStore((state) => state.stats);
  const search = useNotificationsStore((state) => state.search);
  const filters = useNotificationsStore((state) => state.filters);
  const sort = useNotificationsStore((state) => state.sort);
  const pageSize = useNotificationsStore((state) => state.pagination.pageSize);
  const isLoading = useNotificationsStore((state) => state.isLoading);
  const isSaving = useNotificationsStore((state) => state.isSaving);
  const error = useNotificationsStore((state) => state.error);
  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications);
  const fetchStatistics = useNotificationsStore((state) => state.fetchStatistics);
  const setSearch = useNotificationsStore((state) => state.setSearch);
  const setFilter = useNotificationsStore((state) => state.setFilter);
  const resetFilters = useNotificationsStore((state) => state.resetFilters);
  const setSort = useNotificationsStore((state) => state.setSort);
  const setPage = useNotificationsStore((state) => state.setPage);
  const setPageSize = useNotificationsStore((state) => state.setPageSize);
  const clearError = useNotificationsStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const { actions, isSaving: isActionSaving } = useNotificationActions();
  const { isGenerating, generateAlerts } = useAlerts();

  const [deleteTarget, setDeleteTarget] = useState(null);

  const isCompact = useMediaQuery('(max-width: 991.98px)');

  const companyById = useMemo(
    () => Object.fromEntries(companies.map((company) => [company.id, company])),
    [companies],
  );

  const { items, totalItems, totalPages, page } = useNotificationListData(companyById);

  useEffect(() => {
    fetchNotifications();
    fetchStatistics();
    fetchCompanies();
  }, [fetchNotifications, fetchStatistics, fetchCompanies]);

  const urgentNotification = useMemo(() => {
    const urgent = notifications
      .filter(
        (notification) =>
          notification.status === 'unread' &&
          ['high', 'critical'].includes(notification.severity),
      )
      .sort(
        (a, b) =>
          SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity) ||
          (b.createdAt || '').localeCompare(a.createdAt || ''),
      );
    return urgent[0] ?? null;
  }, [notifications]);

  const hasActiveFilters = Boolean(
    search.trim() ||
      filters.status ||
      filters.type ||
      filters.category ||
      filters.severity ||
      filters.resourceType ||
      filters.companyId ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.showUnread,
  );

  const handleGenerateAlerts = async () => {
    const result = await generateAlerts();
    if (result.success) {
      toast.success(
        result.count > 0
          ? `${result.count} alerte${result.count > 1 ? 's' : ''} automatique${result.count > 1 ? 's' : ''} générée${result.count > 1 ? 's' : ''} (simulation).`
          : 'Aucune nouvelle alerte automatique détectée.',
      );
    } else {
      toast.error(result.error || 'Impossible de générer les alertes.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await actions.remove(deleteTarget.id);
    if (ok) setDeleteTarget(null);
  };

  const activeCountLabel = `${totalItems} notification${totalItems > 1 ? 's' : ''}`;

  return (
    <PageContainer>
      <Helmet>
        <title>Notifications — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Notifications"
        subtitle="Centre d'alertes et de notifications — architecture prête pour le temps réel."
        icon={NOTIFICATION_ICON}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Notifications' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon="bi-magic"
            loading={isGenerating}
            onClick={handleGenerateAlerts}
          >
            Générer des alertes (simulation)
          </Button>
        }
      />

      <NotificationStats stats={stats} loading={isLoading} />

      <AlertBanner
        notification={urgentNotification}
        onView={(notification) => navigate(notificationDetailPath(notification.id))}
        onDismiss={actions.dismiss}
      />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <NotificationSearchBar value={search} onChange={setSearch} resultCount={totalItems} />

      <NotificationFilters
        filters={filters}
        companies={companies}
        sort={sort}
        onChange={setFilter}
        onSortChange={(by, direction) => setSort(by, direction)}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isLoading && notifications.length === 0 ? (
        <LoadingState variant="table" rows={6} cols={6} label="Chargement des notifications…" />
      ) : items.length === 0 ? (
        <NotificationEmptyState hasQuery={hasActiveFilters} onReset={hasActiveFilters ? resetFilters : undefined} />
      ) : (
        <>
          <div className="navix-notif-list__count text-muted mb-2">{activeCountLabel}</div>
          {isCompact ? (
            <div className="row g-3">
              {items.map((notification) => (
                <div key={notification.id} className="col-12 col-sm-6 col-xl-4">
                  <NotificationCard
                    notification={notification}
                    company={companyById[notification.companyId]}
                    onView={(item) => navigate(notificationDetailPath(item.id))}
                  />
                </div>
              ))}
            </div>
          ) : (
            <NotificationTable
              notifications={items}
              companyById={companyById}
              sort={sort}
              onSortChange={(by, direction) => setSort(by, direction)}
              onView={(notification) => navigate(notificationDetailPath(notification.id))}
              onMarkAsRead={actions.markAsRead}
              onMarkAsUnread={actions.markAsUnread}
              onArchive={actions.archive}
              onDismiss={actions.dismiss}
              onDelete={setDeleteTarget}
            />
          )}

          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      <DeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        entityName={deleteTarget ? `« ${deleteTarget.title} »` : undefined}
        title="Supprimer la notification"
        loading={isSaving || isActionSaving}
        error={error}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
};

export default NotificationsPage;
