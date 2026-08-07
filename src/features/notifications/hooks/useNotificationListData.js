/**
 * Navix Notifications — Logique de liste (filtre, tri, pagination)
 * --------------------------------------------------------------------------
 * Fonctions pures (`filterNotifications`, `sortNotifications`) testables puis
 * hook `useNotificationListData` qui combine l'état du store
 * (search, filters, sort, pagination) et la carte des sociétés (companyById)
 * pour produire la liste visible : items, totalItems, totalPages, page,
 * startIndex.
 */
import { useMemo } from 'react';
import {
  getNotificationStatus,
  getNotificationType,
  getNotificationSeverity,
  getNotificationCategory,
  getNotificationKind,
  SEVERITY_ORDER,
  resolveDatePreset,
} from '../constants';
import { useNotificationsStore } from '../store';

const toQuery = (value) => String(value ?? '').trim().toLowerCase();

const companyName = (notification, companyById) =>
  companyById[notification.companyId]?.name ?? '';

const matchesSearch = (notification, query, companyById) => {
  if (!query) return true;

  return [
    companyName(notification, companyById),
    notification.title,
    notification.message,
    getNotificationKind(notification.kind).label,
    getNotificationType(notification.type).label,
    getNotificationCategory(notification.category).label,
    getNotificationSeverity(notification.severity).label,
    getNotificationStatus(notification.status).label,
    notification.resourceType,
  ].some((field) => toQuery(field).includes(query));
};

const matchesFilters = (notification, filters = {}) => {
  const inRange = (value, from, to) => {
    const ts = new Date(value).getTime();
    if (from && new Date(from).getTime() > ts) return false;
    if (to) {
      const endOfDay = new Date(to).getTime() + 86_399_999;
      if (endOfDay < ts) return false;
    }
    return true;
  };

  return (
    (!filters.status || notification.status === filters.status) &&
    (!filters.type || notification.type === filters.type) &&
    (!filters.category || notification.category === filters.category) &&
    (!filters.severity || notification.severity === filters.severity) &&
    (!filters.resourceType || notification.resourceType === filters.resourceType) &&
    (!filters.companyId || notification.companyId === filters.companyId) &&
    inRange(notification.createdAt, filters.dateFrom, filters.dateTo) &&
    (!filters.showUnread || notification.status === 'unread')
  );
};

export const filterNotifications = (
  notifications = [],
  { search = '', filters = {}, companyById = {} } = {},
) => {
  const query = toQuery(search);

  return notifications.filter(
    (notification) =>
      matchesSearch(notification, query, companyById) &&
      matchesFilters(notification, filters),
  );
};

const severityRank = (value) => {
  const index = SEVERITY_ORDER.indexOf(value);
  return index === -1 ? SEVERITY_ORDER.length : index;
};

export const sortNotifications = (
  notifications = [],
  { by = 'createdAt', direction = 'desc', companyById = {} } = {},
) => {
  const factor = direction === 'desc' ? -1 : 1;
  const fallback = '1970-01-01T00:00:00.000Z';

  return [...notifications].sort((a, b) => {
    let result = 0;

    switch (by) {
      case 'companyName':
        result = toQuery(companyName(a, companyById)).localeCompare(
          toQuery(companyName(b, companyById)),
          'fr',
        );
        break;
      case 'severity':
        result = severityRank(a.severity) - severityRank(b.severity);
        break;
      case 'type':
        result = getNotificationType(a.type).label.localeCompare(
          getNotificationType(b.type).label,
          'fr',
        );
        break;
      case 'status':
        result = getNotificationStatus(a.status).label.localeCompare(
          getNotificationStatus(b.status).label,
          'fr',
        );
        break;
      case 'createdAt':
      default:
        result = (a.createdAt || fallback).localeCompare(b.createdAt || fallback);
    }

    return result * factor;
  });
};

const paginate = (items, { page, pageSize }) => {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    totalItems,
    totalPages,
    page: currentPage,
    startIndex,
  };
};

/**
 * Hook de liste visible des notifications.
 * @param {object} companyById — carte id → entreprise
 */
export const useNotificationListData = (companyById = {}) => {
  const notifications = useNotificationsStore((state) => state.notifications);
  const search = useNotificationsStore((state) => state.search);
  const filters = useNotificationsStore((state) => state.filters);
  const sort = useNotificationsStore((state) => state.sort);
  const page = useNotificationsStore((state) => state.pagination.page);
  const pageSize = useNotificationsStore((state) => state.pagination.pageSize);

  return useMemo(() => {
    const preset = resolveDatePreset(filters.period);
    const effectiveFilters = {
      ...filters,
      dateFrom: filters.dateFrom || preset.from,
      dateTo: filters.dateTo || preset.to,
    };
    const filtered = sortNotifications(
      filterNotifications(notifications, { search, filters: effectiveFilters, companyById }),
      { ...sort, companyById },
    );
    return paginate(filtered, { page, pageSize });
  }, [notifications, search, filters, sort, page, pageSize, companyById]);
};
