/**
 * Navix Client Finance — ClientFinanceTransactionsTable
 * --------------------------------------------------------------------------
 * Tableau d'historique des transactions (FCFA) : recherche instantanée
 * (référence, description, destinataire, source, type), filtres Type / Statut /
 * Sens / Période (Aujourd'hui, 7/30/90 j, Personnalisée), tri, pagination et
 * actions (voir le détail, annuler une transaction réussie).
 */
import { useState, useEffect, useMemo } from 'react';
import { DataTable, SearchBar, FilterBar, Pagination, EmptyState, StatusBadge } from '@/components/core';
import { formatDateTime, formatNumber } from '@/utils/format';
import {
  TRANSACTION_TYPE_VALUES,
  TRANSACTION_STATUS_VALUES,
  TRANSACTION_PERIODS,
  TRANSACTION_DIRECTION_VALUES,
  FCFA_LABEL,
  getTransactionType,
  getTransactionStatus,
  getTransactionDirection,
  transactionDirectionOf,
  DEFAULT_TRANSACTION_PAGE_SIZE,
  TRANSACTION_PAGE_SIZE_OPTIONS,
} from '../../constants/client.constants';
import './ClientFinance.css';

const TYPE_OPTIONS = TRANSACTION_TYPE_VALUES.map((value) => ({
  value,
  label: getTransactionType(value).label,
}));

const STATUS_OPTIONS = TRANSACTION_STATUS_VALUES.map((value) => ({
  value,
  label: getTransactionStatus(value).label,
}));

const DIRECTION_OPTIONS = TRANSACTION_DIRECTION_VALUES.map((value) => ({
  value,
  label: getTransactionDirection(value).label,
}));

const PERIOD_OPTIONS = TRANSACTION_PERIODS.map((period) => ({ value: period.value, label: period.label }));

const SORTABLE_KEYS = {
  createdAt: (item) => item.createdAt ?? '',
  reference: (item) => String(item.reference || '').toLowerCase(),
  amount: (item) => Number(item.amount) || 0,
};

const ClientFinanceTransactionsTable = ({
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
  const [pageSize, setPageSize] = useState(DEFAULT_TRANSACTION_PAGE_SIZE);

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
      const preset = TRANSACTION_PERIODS.find((period) => period.value === filters.period);
      if (preset && preset.value !== 'custom') {
        const from = new Date();
        from.setDate(from.getDate() - (preset.days - 1));
        from.setHours(0, 0, 0, 0);
        return { from: from.getTime(), to: null };
      }
      const fromDate = filters.fromDate ? new Date(`${filters.fromDate}T00:00:00`).getTime() : null;
      const toDate = filters.toDate ? new Date(`${filters.toDate}T23:59:59.999`).getTime() : null;
      return { from: fromDate, to: toDate };
    })();

    return transactions.filter((item) => {
      if (filters.status && item.status !== filters.status) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.direction && transactionDirectionOf(item) !== filters.direction) return false;

      if (filters.period || filters.fromDate || filters.toDate) {
        const ts = new Date(item.createdAt).getTime();
        if (Number.isNaN(ts)) return false;
        if (periodRange.from && ts < periodRange.from) return false;
        if (periodRange.to && ts > periodRange.to) return false;
      }

      if (!query) return true;
      const type = getTransactionType(item.type);
      const haystack = [
        item.reference,
        item.label,
        item.description,
        item.destination,
        item.source,
        item.counterparty,
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
    const direction = sort.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const left = accessor(a);
      const right = accessor(b);
      if (left < right) return -1 * direction;
      if (left > right) return 1 * direction;
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
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (item) => <span className="text-nowrap">{formatDateTime(item.createdAt)}</span>,
    },
    {
      key: 'reference',
      label: 'Référence',
      sortable: true,
      render: (item) => (
        <button type="button" className="navix-fleet-vehbtn" onClick={() => onView?.(item)} title={`Voir ${item.reference}`}>
          <span className="font-monospace fw-semibold text-start">{item.reference}</span>
        </button>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (item) => {
        const type = getTransactionType(item.type);
        return (
          <span className="small">
            <i className={`bi ${type.icon} me-1 text-${type.variant}`} aria-hidden="true" />
            {type.label}
          </span>
        );
      },
    },
    {
      key: 'description',
      label: 'Description',
      render: (item) => (
        <span className="small d-block text-truncate" style={{ maxWidth: 260 }} title={item.description}>
          {item.description}
        </span>
      ),
    },
    {
      key: 'counterparty',
      label: 'Destinataire · Source',
      render: (item) => {
        const isIn = transactionDirectionOf(item) === 'in';
        const value = isIn ? item.source : item.destination;
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
      key: 'amount',
      label: 'Montant',
      align: 'end',
      sortable: true,
      render: (item) => {
        const isIn = transactionDirectionOf(item) === 'in';
        return (
          <span className={`navix-client-finance__amount ${isIn ? 'navix-client-finance__amount--in' : 'navix-client-finance__amount--out'}`}>
            {isIn ? '+' : '−'} {formatNumber(item.amount)} {FCFA_LABEL}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Statut',
      render: (item) => {
        const status = getTransactionStatus(item.status);
        return <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />;
      },
    },
  ];

  return (
    <DataTable
      className="navix-client-finance-table"
      columns={columns}
      rows={pageItems}
      loading={loading}
      sort={sort}
      onSortChange={(by, direction) => setSort({ by, direction })}
      ariaLabel="Historique de mes transactions financières"
      empty={
        <EmptyState
          compact
          icon="bi-arrow-repeat"
          title={hasActiveFilters ? 'Aucune transaction ne correspond' : 'Aucune transaction'}
          description={
            hasActiveFilters
              ? 'Modifiez vos critères de recherche ou réinitialisez les filtres.'
              : 'Vos opérations financières (dépôts, retraits, transferts, paiements) apparaîtront ici.'
          }
        />
      }
      header={
        <div className="navix-ops-toolbar">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Rechercher (référence, description, destinataire…)"
            resultCount={totalItems}
            aria-label="Rechercher parmi mes transactions"
          />
          <FilterBar
            fields={[
              {
                key: 'status',
                type: 'select',
                label: 'Statut',
                options: STATUS_OPTIONS,
                allLabel: 'Tous les statuts',
              },
              {
                key: 'type',
                type: 'select',
                label: 'Type',
                options: TYPE_OPTIONS,
                allLabel: 'Tous les types',
              },
              {
                key: 'direction',
                type: 'select',
                label: 'Sens',
                options: DIRECTION_OPTIONS,
                allLabel: 'Entrée & sortie',
              },
              {
                key: 'period',
                type: 'select',
                label: 'Période',
                options: PERIOD_OPTIONS,
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
          pageSizeOptions={TRANSACTION_PAGE_SIZE_OPTIONS}
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

export default ClientFinanceTransactionsTable;
