/**
 * Navix Notifications — NotificationTable
 * --------------------------------------------------------------------------
 * Tableau des notifications (affichage desktop) construit sur le DataTable
 * générique : notification (icône + titre), entreprise, type, sévérité,
 * statut, date et menu d'actions contextuel (ActionDropdown).
 *
 * Props :
 *   notifications : liste filtrée / triée / paginée
 *   companyById   : carte { id → { name } }
 *   sort          : { by, direction } — tri contrôlé
 *   onSortChange  : (by, direction) => void
 *   selectable    : active la colonne de sélection (bulk)
 *   selectedIds   : ids sélectionnés
 *   onToggleSelect: (id: string) => void
 *   onToggleSelectAll: (ids: string[]) => void
 *   onView        : (notification) => void
 *   onMarkAsRead  : (id: string) => void
 *   onMarkAsUnread: (id: string) => void
 *   onArchive     : (id: string) => void
 *   onDismiss     : (id: string) => void
 *   onDelete      : (id: string) => void
 */
import { DataTable, ActionDropdown } from '@/components/core';
import { getNotificationKind, getNotificationType, formatNotificationRelative, formatNotificationDateTime } from '../constants';
import NotificationIcon from './NotificationIcon';
import NotificationTypeBadge from './NotificationTypeBadge';
import NotificationSeverityBadge from './NotificationSeverityBadge';
import NotificationStatusBadge from './NotificationStatusBadge';
import './NotificationTable.css';

const NotificationTable = ({
  notifications = [],
  companyById = {},
  sort,
  onSortChange,
  selectable = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onView,
  onMarkAsRead,
  onMarkAsUnread,
  onArchive,
  onDismiss,
  onDelete,
}) => {
  const isAllSelected =
    notifications.length > 0 && notifications.every((notification) => selectedIds.includes(notification.id));

  const columns = [
    ...(selectable
      ? [
          {
            key: 'selection',
            label: '',
            width: '3rem',
            headerClassName: 'navix-notif-table__select-head',
            renderHeader: () => (
              <input
                type="checkbox"
                className="form-check-input navix-notif-table__checkbox"
                checked={isAllSelected}
                aria-label="Tout sélectionner sur cette page"
                onChange={() => onToggleSelectAll(notifications.map((notification) => notification.id))}
              />
            ),
            render: (notification) => (
              <input
                type="checkbox"
                className="form-check-input navix-notif-table__checkbox"
                checked={selectedIds.includes(notification.id)}
                aria-label={`Sélectionner ${notification.title}`}
                onClick={(event) => event.stopPropagation()}
                onChange={() => onToggleSelect(notification.id)}
              />
            ),
          },
        ]
      : []),
    {
      key: 'title',
      label: 'Notification',
      sortable: true,
      width: '26rem',
      render: (notification) => {
        const kind = getNotificationKind(notification.kind);
        return (
          <div className="navix-notif-table__item">
            <NotificationIcon variant={getNotificationType(notification.type).variant} icon={kind.icon} size="sm" />
            <div className="navix-notif-table__item-body">
              <span className={`navix-notif-table__title ${notification.status === 'unread' ? 'is-unread' : ''}`}>
                {notification.title}
              </span>
              <span className="navix-notif-table__kind">{kind.label}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'companyName',
      label: 'Entreprise',
      sortable: true,
      width: '12rem',
      render: (notification) => companyById[notification.companyId]?.name ?? '—',
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (notification) => <NotificationTypeBadge type={notification.type} size="sm" />,
    },
    {
      key: 'severity',
      label: 'Sévérité',
      sortable: true,
      render: (notification) => <NotificationSeverityBadge severity={notification.severity} size="sm" />,
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (notification) => <NotificationStatusBadge status={notification.status} size="sm" />,
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      width: '9rem',
      render: (notification) => (
        <time
          className="navix-notif-table__date"
          dateTime={notification.createdAt}
          title={formatNotificationDateTime(notification.createdAt)}
        >
          {formatNotificationRelative(notification.createdAt)}
        </time>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'end',
      className: 'text-end',
      render: (notification) => (
        <ActionDropdown
          align="end"
          triggerLabel="Actions de la notification"
          items={[
            {
              key: 'view',
              label: 'Voir le détail',
              icon: 'bi-eye',
              onClick: () => onView(notification),
            },
            {
              key: 'read',
              label: 'Marquer comme lue',
              icon: 'bi-envelope-open',
              show: notification.status === 'unread',
              onClick: () => onMarkAsRead(notification.id),
            },
            {
              key: 'unread',
              label: 'Marquer comme non lue',
              icon: 'bi-envelope',
              show: notification.status === 'read',
              onClick: () => onMarkAsUnread(notification.id),
            },
            {
              key: 'archive',
              label: 'Archiver',
              icon: 'bi-archive',
              show: notification.status !== 'archived',
              onClick: () => onArchive(notification.id),
            },
            {
              key: 'dismiss',
              label: 'Ignorer',
              icon: 'bi-eye-slash',
              show: notification.status !== 'dismissed',
              onClick: () => onDismiss(notification.id),
            },
            { key: 'separator', separator: true },
            {
              key: 'delete',
              label: 'Supprimer',
              icon: 'bi-trash3',
              danger: true,
              onClick: () => onDelete(notification),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <DataTable
      className="navix-notif-table"
      columns={columns}
      rows={notifications}
      sort={sort}
      onSortChange={onSortChange}
      onRowClick={onView}
      ariaLabel="Tableau des notifications"
    />
  );
};

export default NotificationTable;
