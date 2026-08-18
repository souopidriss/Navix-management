/**
 * Navix Super Admin — SuperAdminTransactionsTable
 * --------------------------------------------------------------------------
 * Tableau des transactions financières plateforme : recherche, filtres
 * (Type / Direction / Statut / Période / Dates), tri, pagination et
 * actions (voir détail, annuler). Vue du Super Admin global.
 */
import { useState, useEffect, useMemo } from 'react';
import { DataTable, SearchBar, FilterBar, Pagination, EmptyState, StatusBadge } from '@/components/core';
import { formatDateTime, formatNumber } from '@/utils/format';
import {
  SA_TRANSACTION_TYPES,
  SA_TRANSACTION_STATUS_VALUES,
  SA_PERIOD_FILTER_OPTIONS,
  SA_TYPE_FILTER_OPTIONS,
  SA_DIRECTION_FILTER_OPTIONS,
  SA_STATUS_FILTER_OPTIONS,
  FCFA_LABEL,
  getSaTransactionType,
  getTransactionStatus,
  transactionDirectionOf,
  DEFAULT_SA_TRANSACTION_PAGE_SIZE,
  SA_TRANSACTION_PAGE_SIZE_OPTIONS,
} from '../constants/superAdminFinance.constants';

const SORTABLE_KEYS = {
  createdAt: (item) => item.createdAt ?? '',
  reference: (item) => String(item.reference || '').toLowerCase(),
  amount: (item) => Number(item.amount) || 0,
  type: (item) => String(item.type || '').toLowerCase(),
  status: (item) => String(item.status || '').toLowerCase(),
};

const resolvePeriodRange = (period) => {
  const now = new Date();
  if (period === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { from: start.getTime(), to: null };
  }
  if (period === '7d') {
    const from = new Date(now);
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);
    return { from: from.getTime(), to: null };
  }
  if (period === 'month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: from.getTime(), to: null };
  }
  if (period === 'prev_month') {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { from: from.getTime(), to: to.getTime() };
  }
  if (period === '3m') {
    const from = new Date(now);
    from.setMonth(from.getMonth() - 3);
    from.setHours(0, 0, 0, 0);
    return { from: from.getTime(), to: null };
  }
  if (period === '6m') {
    const from = new Date(now);
    from.setMonth(from.getMonth() - 6);
    from.setHours(0, 0, 0, 0);
    return { from: from.getTime(), to: null };
  }
  if (period === '12m') {
    const from = new Date(now);
    from.setFullYear(from.getFullYear() - 1);
    from.setHours(0, 0, 0, 0);
    return { from: from.getTime(), to: null };
  }
  return { from: null, to: null };
};

const SuperAdminTransactionsTable = ({
  transactions = [],
  loading = false,
  onView,
  onReverse,
  canReverse = false,
}) => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    direction: '',
    period: '',
    fromDate: '',
    toDate: '',
  });
  const [sort, setSort] = useState({ by: 'createdAt', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_SA_TRANSACTION_PAGE_SIZE);

  const hasActiveFilters = Boolean(
    search.trim() ||
      filters.status ||
      filters.type ||
      filters.direction ||
      filters.period ||
      filters.fromDate ||
      filters.toDate,
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const periodRange = (() => {
      if (filters.period) {
        return resolvePeriodRange(filters.period);
      }
      const fromDate = filters.fromDate ? new Date(`${filters.fromDate}T00:00:00`).getTime() : null;
      const toDate = filters.toDate ? new Date(`${filters.toDate}T23:59:59.999`).getTime() : null;
      return { from: fromDate, to: toDate };
    })();

    return transactions.filter((item) => {
      if (filters.status && item.status !== filters.status) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.direction && transactionDirectionOf(item) !== filters.direction) return false;

      if (periodRange.from || periodRange.to) {
        const ts = new Date(item.createdAt).getTime();
        if (Number.isNaN(ts)) return false;
        if (periodRange.from && ts < periodRange.from) return false;
        if (periodRange.to && ts > periodRange.to) return false;
      }

      if (!query) return true;
      const type = getSaTransactionType(item.type);
      const haystack = [
        item.reference,
        item.id,
        item.description,
        item.destination,
        item.source,
        item.sourceType,
        type.label,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [transactions, search, filters]);

  const sorted = useMemo(() => {
    const accessor = SORTABLE_KEYS[sort.by] || SORTABLE_KEYS.createdAt;
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const left = accessor(a);
      const right = accessor(b);
      if (left < right) return -1 * dir;
      if (left > right) return 1 * dir;
      return 0;
    });
  }, [filtered, sort]);

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageItems = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ status: '', type: '', direction: '', period: '', fromDate: '', toDate: '' });
  };

  const columns = [
    {
      key: 'reference',
      label: 'Référence',
      sortable: true,
      render: (item) => (
        <button
          type="button"
          className="btn btn-link p-0 text-decoration-none font-monospace fw-semibold"
          onClick={() => onView?.(item)}
          title={`Voir ${item.reference}`}
        >
          {item.reference}
        </button>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (item) => <span className="text-nowrap">{formatDateTime(item.createdAt)}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (item) => {
        const type = getSaTransactionType(item.type);
        return (
          <span className="small">
            <i className={`bi ${type.icon} me-1`} aria-hidden="true" />
            {type.label}
          </span>
        );
      },
    },
    {
      key: 'direction',
      label: 'Sens',
      render: (item) => {
        const dir = transactionDirectionOf(item);
        const isIn = dir === 'in';
        return (
          <span className={`badge bg-${isIn ? 'success' : 'danger'}-subtle text-${isIn ? 'success' : 'danger'} d-inline-flex align-items-center gap-1`}>
            <i className={`bi ${isIn ? 'bi-arrow-down' : 'bi-arrow-up'}`} aria-hidden="true" />
            {isIn ? 'Entrée' : 'Sortie'}
          </span>
        );
      },
    },
    {
      key: 'source',
      label: 'Source / Destination',
      render: (item) => {
        const dir = transactionDirectionOf(item);
        const value = dir === 'in' ? item.source : item.destination;
        return value ? (
          <span className="small text-truncate d-block" style={{ maxWidth: 200 }} title={value}>
            {value}
          </span>
        ) : (
          <span className="text-secondary">—</span>
        );
      },
    },
    {
      key: 'description',
      label: 'Description',
      render: (item) => (
        <span className="small d-block text-truncate" style={{ maxWidth: 260 }} title={item.description}>
          {item.description || '—'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Montant',
      align: 'end',
      sortable: true,
      render: (item) => {
        const dir = transactionDirectionOf(item);
        const isIn = dir === 'in';
        return (
          <span className={`fw-semibold ${isIn ? 'text-success' : 'text-danger'}`}>
            {isIn ? '+' : '−'} {formatNumber(item.amount)} {FCFA_LABEL}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (item) => {
        const status = getTransactionStatus(item.status);
        return <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />;
      },
    },
    {
      key: 'balanceAfter',
      label: 'Solde après',
      align: 'end',
      render: (item) => (
        <span className="small text-secondary">
          {item.balanceAfter != null ? `${formatNumber(item.balanceAfter)} ${FCFA_LABEL}` : '—'}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={pageItems}
      loading={loading}
      sort={sort}
      onSortChange={(by, direction) => setSort({ by, direction })}
      ariaLabel="Transactions financières de la plateforme"
      empty={
        <EmptyState
          compact
          icon="bi-arrow-repeat"
          title={hasActiveFilters ? 'Aucune transaction ne correspond' : 'Aucune transaction'}
          description={
            hasActiveFilters
              ? 'Modifiez vos critères de recherche ou réinitialisez les filtres.'
              : 'Les transactions financières de la plateforme apparaîtront ici.'
          }
          action={
            hasActiveFilters ? { label: 'Réinitialiser les filtres', onClick: handleResetFilters } : null
          }
        />
      }
      header={
        <div className="navix-ops-toolbar">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Rechercher (référence, description, source…)"
            resultCount={totalItems}
            aria-label="Rechercher parmi les transactions"
          />
          <FilterBar
            fields={[
              {
                key: 'type',
                type: 'select',
                label: 'Type',
                options: SA_TYPE_FILTER_OPTIONS,
                allLabel: 'Tous les types',
              },
              {
                key: 'direction',
                type: 'select',
                label: 'Sens',
                options: SA_DIRECTION_FILTER_OPTIONS,
                allLabel: 'Entrée & sortie',
              },
              {
                key: 'status',
                type: 'select',
                label: 'Statut',
                options: SA_STATUS_FILTER_OPTIONS,
                allLabel: 'Tous les statuts',
              },
              {
                key: 'period',
                type: 'select',
                label: 'Période',
                options: SA_PERIOD_FILTER_OPTIONS,
                allLabel: 'Toutes les périodes',
              },
              {
                key: 'fromDate',
                type: 'date',
                label: 'Du',
              },
              {
                key: 'toDate',
                type: 'date',
                label: 'Au',
              },
            ]}
            values={filters}
            onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
            onReset={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      }
      footer={
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={SA_TRANSACTION_PAGE_SIZE_OPTIONS}
        />
      }
      actions={[
        {
          key: 'view',
          label: (item) => `Voir ${item.reference}`,
          title: 'Voir le détail',
          icon: 'bi-eye',
          onClick: (item) => onView?.(item),
        },
        {
          key: 'reverse',
          label: (item) => `Annuler ${item.reference}`,
          title: 'Annuler / rembourser',
          icon: 'bi-arrow-counterclockwise',
          danger: true,
          show: (item) => canReverse && item.status === 'success' && !item.reversedRef,
          onClick: (item) => onReverse?.(item),
        },
      ]}
    />
  );
};

export default SuperAdminTransactionsTable;
