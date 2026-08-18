/**
 * Navix Driver — DriverNotificationsPage
 * --------------------------------------------------------------------------
 * Notifications du chauffeur : statistiques, filtres, liste regroupée par
 * date et actions locales (marquer comme lue, archiver, tout marquer lu).
 */
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { formatNumber } from '@/utils/format';
import { Button } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  StatsCards,
  FilterBar,
  LoadingState,
  ErrorState,
  EmptyState,
} from '@/components/core';
import { NotificationList } from '@/features/notifications/components';
import { NOTIFICATION_TYPES } from '@/features/notifications';
import { useDriverNotifications } from '../hooks/useDriverNotifications';

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'unread', label: 'Non lues' },
  { value: 'read', label: 'Lues' },
  { value: 'archived', label: 'Archivées' },
];

const TYPE_OPTIONS = Object.entries(NOTIFICATION_TYPES).map(([value, meta]) => ({ value, label: meta.label }));

const DriverNotificationsPage = () => {
  const { notifications, unreadCount, isLoading, error, refetch, busyId, markAsRead, archive, markAllAsRead } =
    useDriverNotifications();

  const [filters, setFilters] = useState({ status: '', type: '' });

  const filtered = useMemo(
    () =>
      notifications.filter((notification) => {
        if (filters.status && notification.status !== filters.status) return false;
        if (filters.type && notification.type !== filters.type) return false;
        return true;
      }),
    [notifications, filters],
  );

  const hasActiveFilters = Boolean(filters.status || filters.type);
  const resetFilters = () => setFilters({ status: '', type: '' });

  const readCount = notifications.filter((notification) => notification.status === 'read').length;
  const archivedCount = notifications.filter((notification) => notification.status === 'archived').length;

  const stats = useMemo(
    () => [
      {
        key: 'unread',
        label: 'Non lues',
        value: formatNumber(unreadCount),
        icon: 'bi-envelope-exclamation',
        variant: 'primary',
      },
      {
        key: 'read',
        label: 'Lues',
        value: formatNumber(readCount),
        icon: 'bi-envelope-open',
        variant: 'success',
      },
      {
        key: 'archived',
        label: 'Archivées',
        value: formatNumber(archivedCount),
        icon: 'bi-archive',
        variant: 'secondary',
      },
      {
        key: 'total',
        label: 'Au total',
        value: formatNumber(notifications.length),
        icon: 'bi-bell',
        variant: 'warning',
      },
    ],
    [unreadCount, readCount, archivedCount, notifications.length],
  );

  const breadcrumbs = [{ label: 'Espace Chauffeur' }, { label: 'Notifications' }];

  if (isLoading && !notifications.length) {
    return (
      <PageContainer>
        <LoadingState variant="list" rows={6} label="Chargement de vos notifications…" />
      </PageContainer>
    );
  }

  if (error && !notifications.length) {
    return (
      <PageContainer>
        <ErrorState
          title="Notifications indisponibles"
          description="Impossible de charger vos notifications pour le moment."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Mes notifications — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Mes notifications"
        subtitle="Restez informé des alertes liées à vos trajets, votre véhicule et vos documents."
        icon="bi-bell"
        breadcrumbs={breadcrumbs}
        actions={
          <>
            <Button variant="outline" size="sm" icon="bi-arrow-clockwise" onClick={refetch}>
              Actualiser
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon="bi-check2-all"
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || isLoading}
            >
              Tout marquer comme lu
            </Button>
          </>
        }
      />

      <StatsCards stats={stats} loading={isLoading && !notifications.length} columns={4} />

      <div className="my-3">
        <FilterBar
          fields={[
            { key: 'status', type: 'select', label: 'Statut', options: STATUS_OPTIONS },
            { key: 'type', type: 'select', label: 'Type', options: TYPE_OPTIONS },
          ]}
          values={filters}
          onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="bi-bell-slash"
          title="Aucune notification"
          description="Aucune notification ne correspond à vos critères."
          action={
            hasActiveFilters ? (
              <Button variant="outline" size="sm" icon="bi-arrow-counterclockwise" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="card">
          <div className="card-body">
            <NotificationList
              notifications={filtered}
              actions={{ onMarkAsRead: markAsRead, onArchive: archive }}
              loading={Boolean(busyId)}
              emptyTitle="Aucune notification"
              emptyText="Aucune notification pour le moment."
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default DriverNotificationsPage;
