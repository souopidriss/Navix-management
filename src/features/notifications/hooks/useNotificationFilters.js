/**
 * Navix Notifications — Filtres, recherche, tri et pagination
 * --------------------------------------------------------------------------
 * Facade pour piloter la liste : recherche, filtres (dont preset de période),
 * tri, pagination et la page visible (via useNotificationListData).
 */
import { useCallback, useMemo } from 'react';
import { useNotificationsStore } from '../store';
import { useNotificationListData } from './useNotificationListData';
import { NOTIFICATION_DATE_PRESETS } from '../constants';

export const useNotificationFilters = (companyById = {}) => {
  const search = useNotificationsStore((state) => state.search);
  const filters = useNotificationsStore((state) => state.filters);
  const sort = useNotificationsStore((state) => state.sort);
  const pagination = useNotificationsStore((state) => state.pagination);

  const setSearch = useNotificationsStore((state) => state.setSearch);
  const setFilter = useNotificationsStore((state) => state.setFilter);
  const resetFilters = useNotificationsStore((state) => state.resetFilters);
  const setSort = useNotificationsStore((state) => state.setSort);
  const setPage = useNotificationsStore((state) => state.setPage);
  const setPageSize = useNotificationsStore((state) => state.setPageSize);

  const listData = useNotificationListData(companyById);

  const setPeriod = useCallback(
    (period) => setFilter('period', period),
    [setFilter],
  );

  return useMemo(
    () => ({
      search,
      filters,
      sort,
      pagination,
      listData,
      datePresets: NOTIFICATION_DATE_PRESETS,
      setSearch,
      setFilter,
      setPeriod,
      resetFilters,
      setSort,
      setPage,
      setPageSize,
    }),
    [
      search,
      filters,
      sort,
      pagination,
      listData,
      setSearch,
      setFilter,
      setPeriod,
      resetFilters,
      setSort,
      setPage,
      setPageSize,
    ],
  );
};
