/**
 * Navix Subscriptions — Logique de liste (filtre, tri, pagination) + hook
 * --------------------------------------------------------------------------
 * Fonctions pures (`filterSubscriptions`, `sortSubscriptions`) testables, puis
 * hook `useSubscriptionListData` qui combine l'état du store et la carte des
 * sociétés (companyById) pour produire la liste visible : items, totalItems,
 * totalPages, page et startIndex.
 */
import { useMemo } from 'react';
import { MOCK_PLANS_BY_ID } from '../mocks';
import { DEFAULT_PAGE_SIZE, getPlan, getSubscriptionStatus } from '../constants';
import { useSubscriptionsStore } from '../store';

const toQuery = (value) => String(value ?? '').trim().toLowerCase();

const planLabel = (subscription) => {
  const plan = MOCK_PLANS_BY_ID[subscription.planId];
  return plan ? getPlan(plan.code).label : '';
};

export const filterSubscriptions = (
  subscriptions = [],
  { search = '', filters = {}, companyById = {} } = {},
) => {
  const query = toQuery(search);

  return subscriptions.filter((subscription) => {
    const companyName = companyById[subscription.companyId]?.name ?? '';
    const matchesSearch =
      !query ||
      [
        companyName,
        planLabel(subscription),
        getSubscriptionStatus(subscription.status).label,
        subscription.price,
        subscription.renewalDate,
        subscription.currentPeriodEnd,
      ].some((field) => toQuery(field).includes(query));
    const matchesCompany = !filters.companyId || subscription.companyId === filters.companyId;
    const matchesStatus = !filters.status || subscription.status === filters.status;
    const matchesPlan = !filters.planId || subscription.planId === filters.planId;
    const matchesInterval =
      !filters.billingInterval || subscription.billingInterval === filters.billingInterval;

    return (
      matchesSearch && matchesCompany && matchesStatus && matchesPlan && matchesInterval
    );
  });
};

export const sortSubscriptions = (
  subscriptions = [],
  { by = 'companyName', direction = 'asc', companyById = {} } = {},
) => {
  const factor = direction === 'desc' ? -1 : 1;
  const dateKey = (subscription) => subscription.currentPeriodEnd || '1970-01-01T00:00:00.000Z';

  return [...subscriptions].sort((a, b) => {
    let result = 0;

    switch (by) {
      case 'companyName':
        result = toQuery(companyById[a.companyId]?.name ?? '').localeCompare(
          toQuery(companyById[b.companyId]?.name ?? ''),
          'fr',
        );
        break;
      case 'plan':
        result =
          planLabel(a).localeCompare(planLabel(b), 'fr') ||
          toQuery(companyById[a.companyId]?.name ?? '').localeCompare(
            toQuery(companyById[b.companyId]?.name ?? ''),
            'fr',
          );
        break;
      case 'status':
        result =
          getSubscriptionStatus(a.status).label.localeCompare(
            getSubscriptionStatus(b.status).label,
            'fr',
          ) ||
          toQuery(companyById[a.companyId]?.name ?? '').localeCompare(
            toQuery(companyById[b.companyId]?.name ?? ''),
            'fr',
          );
        break;
      case 'price':
        result = Number(a.price || 0) - Number(b.price || 0);
        break;
      case 'currentPeriodEnd':
      case 'renewalDate':
        result = dateKey(a).localeCompare(dateKey(b));
        break;
      default:
        result = toQuery(companyById[a.companyId]?.name ?? '').localeCompare(
          toQuery(companyById[b.companyId]?.name ?? ''),
          'fr',
        );
    }

    return result * factor;
  });
};

/**
 * Hook de liste visible des abonnements. La carte des sociétés
 * (id → objet) est utilisée pour la recherche et le tri.
 */
export const useSubscriptionListData = (companyById = {}) => {
  const subscriptions = useSubscriptionsStore((state) => state.subscriptions);
  const search = useSubscriptionsStore((state) => state.search);
  const filters = useSubscriptionsStore((state) => state.filters);
  const sort = useSubscriptionsStore((state) => state.sort);
  const page = useSubscriptionsStore((state) => state.pagination.page);
  const pageSize = useSubscriptionsStore((state) => state.pagination.pageSize);

  return useMemo(() => {
    const filtered = sortSubscriptions(
      filterSubscriptions(subscriptions, { search, filters, companyById }),
      { ...sort, companyById },
    );
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const startIndex = (currentPage - 1) * pageSize;

    return {
      items: filtered.slice(startIndex, startIndex + pageSize),
      totalItems,
      totalPages,
      page: currentPage,
      startIndex,
    };
  }, [subscriptions, search, filters, sort, page, pageSize, companyById]);
};
