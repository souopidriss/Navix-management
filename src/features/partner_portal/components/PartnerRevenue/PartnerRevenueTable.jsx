/**
 * Navix Partner Portal — PartnerRevenueTable (PROMPT 070 §9-28)
 * --------------------------------------------------------------------------
 * Tableau des revenus : recherche, filtres (statut, client, type, période),
 * tri (date, brut, commission, net, statut), pagination et actions.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, SearchBar, FilterBar, Pagination, EmptyState, StatusBadge } from '@/components/core';
import { formatDateTime, formatNumber } from '@/utils/format';
import { ROUTES, partnerRevenueDetailPath } from '@/routes/route.constants';
import {
  FCFA_LABEL,
  PARTNER_REVENUE_STATUSES,
  PARTNER_REVENUE_STATUS_VALUES,
  PARTNER_MISSION_TYPES,
  PARTNER_MISSION_TYPE_VALUES,
  DEFAULT_PARTNER_REVENUE_PAGE_SIZE,
  PARTNER_REVENUE_PAGE_SIZE_OPTIONS,
} from '../../constants/partner.constants';

const TYPE_OPTIONS = [
  { value: 'all', label: 'Tous les types' },
  ...PARTNER_MISSION_TYPE_VALUES.map((key) => ({ value: key, label: PARTNER_MISSION_TYPES[key]?.label || key })),
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  ...PARTNER_REVENUE_STATUS_VALUES.map((key) => ({ value: key, label: PARTNER_REVENUE_STATUSES[key]?.label || key })),
];

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Toutes les périodes' },
  { value: 'today', label: "Aujourd'hui" },
  { value: 'last7', label: '7 derniers jours' },
  { value: 'month', label: 'Ce mois' },
  { value: 'lastMonth', label: 'Mois précédent' },
  { value: 'last3', label: '3 derniers mois' },
];

const PartnerRevenueTable = ({ revenues }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'all', serviceType: 'all', period: 'all' });
  const [sort, setSort] = useState({ by: 'createdAt', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PARTNER_REVENUE_PAGE_SIZE);

  const filtered = useMemo(() => {
    let items = [...revenues];
    if (search) {
      const s = search.toLowerCase();
      items = items.filter((r) =>
        r.reference.toLowerCase().includes(s) ||
        r.missionReference.toLowerCase().includes(s) ||
        r.clientName.toLowerCase().includes(s) ||
        r.serviceLabel.toLowerCase().includes(s)
      );
    }
    if (filters.status !== 'all') items = items.filter((r) => r.status === filters.status);
    if (filters.serviceType !== 'all') items = items.filter((r) => r.serviceType === filters.serviceType);
    if (filters.period !== 'all') {
      const now = Date.now();
      const periodMap = { today: 1, last7: 7, month: 30, lastMonth: 60, last3: 90 };
      const days = periodMap[filters.period];
      if (days) {
        const from = now - days * 86_400_000;
        items = items.filter((r) => new Date(r.createdAt).getTime() >= from);
      }
    }
    return items;
  }, [revenues, search, filters]);

  const sorted = useMemo(() => {
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const aVal = a[sort.by];
      const bVal = b[sort.by];
      if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
      if (typeof aVal === 'string') return aVal.localeCompare(bVal) * dir;
      return 0;
    });
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const columns = [
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (row) => <span className="text-nowrap">{formatDateTime(row.createdAt)}</span>,
    },
    {
      key: 'reference',
      label: 'Référence',
      sortable: true,
      render: (row) => (
        <button
          type="button"
          className="btn btn-link p-0 font-monospace fw-semibold text-decoration-none"
          onClick={() => navigate(partnerRevenueDetailPath(row.id))}
        >
          {row.reference}
        </button>
      ),
    },
    {
      key: 'missionReference',
      label: 'Mission',
      render: (row) => <span className="font-monospace">{row.missionReference}</span>,
    },
    {
      key: 'clientName',
      label: 'Client',
      sortable: true,
      render: (row) => <span className="text-truncate d-inline-block" style={{ maxWidth: '160px' }}>{row.clientName}</span>,
    },
    {
      key: 'serviceType',
      label: 'Prestation',
      render: (row) => (
        <span className="text-capitalize">{row.serviceLabel}</span>
      ),
    },
    {
      key: 'grossAmount',
      label: 'Brut',
      sortable: true,
      render: (row) => <span className="navix-client-finance__amount">{formatNumber(row.grossAmount)} {FCFA_LABEL}</span>,
    },
    {
      key: 'commissionAmount',
      label: 'Commission',
      sortable: true,
      render: (row) => <span className="navix-client-finance__amount navix-client-finance__amount--out">{formatNumber(row.commissionAmount)} {FCFA_LABEL}</span>,
    },
    {
      key: 'netAmount',
      label: 'Net',
      sortable: true,
      render: (row) => <span className="navix-client-finance__amount navix-client-finance__amount--in fw-bold">{formatNumber(row.netAmount)} {FCFA_LABEL}</span>,
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (row) => {
        const cfg = PARTNER_REVENUE_STATUSES[row.status] || {};
        return <StatusBadge variant={cfg.variant} label={cfg.label} icon={cfg.icon} size="sm" />;
      },
    },
  ];

  const handleSort = (columnKey) => {
    setSort((prev) => ({
      by: columnKey,
      direction: prev.by === columnKey && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <DataTable
      columns={columns}
      rows={pageItems}
      sort={sort}
      onSortChange={handleSort}
      header={
        <div className="navix-ops-toolbar">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Rechercher un revenu, une mission ou un client..."
          />
          <FilterBar
            filters={[
              { key: 'status', label: 'Statut', options: STATUS_OPTIONS, value: filters.status },
              { key: 'serviceType', label: 'Type', options: TYPE_OPTIONS, value: filters.serviceType },
              { key: 'period', label: 'Période', options: PERIOD_OPTIONS, value: filters.period },
            ]}
            onChange={handleFilterChange}
          />
        </div>
      }
      footer={
        <Pagination
          page={safePage}
          pageSize={pageSize}
          totalItems={sorted.length}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          pageSizeOptions={PARTNER_REVENUE_PAGE_SIZE_OPTIONS}
        />
      }
      actions={[
        {
          label: 'Voir le détail',
          icon: 'bi-eye',
          onClick: (row) => navigate(partnerRevenueDetailPath(row.id)),
        },
      ]}
      empty={
        <EmptyState
          icon="bi-cash-stack"
          title="Aucun revenu trouvé"
          description="Aucun revenu ne correspond à vos critères de recherche."
          compact
        />
      }
    />
  );
};

export default PartnerRevenueTable;
