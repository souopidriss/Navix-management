/**
 * Navix Partner Portal — PartnerRequestsTable (PROMPT 072)
 * --------------------------------------------------------------------------
 * Tableau des demandes : recherche, filtres (statut, type, priorité, client,
 * période), tri (date, référence, client, type, priorité, montant, statut),
 * pagination et actions (voir, accepter, refuser, convertir).
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, SearchBar, FilterBar, Pagination, EmptyState, StatusBadge } from '@/components/core';
import { formatDateTime, formatNumber } from '@/utils/format';
import { ROUTES, partnerRequestDetailPath } from '@/routes/route.constants';
import {
  FCFA_LABEL,
  PARTNER_REQUEST_STATUSES,
  PARTNER_REQUEST_STATUS_VALUES,
  PARTNER_REQUEST_TYPES,
  PARTNER_REQUEST_TYPE_VALUES,
  PARTNER_REQUEST_PRIORITIES,
  PARTNER_REQUEST_PRIORITY_VALUES,
  DEFAULT_PARTNER_REQUEST_PAGE_SIZE,
  PARTNER_REQUEST_PAGE_SIZE_OPTIONS,
} from '../../constants/partner.constants';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  ...PARTNER_REQUEST_STATUS_VALUES.map((key) => ({ value: key, label: PARTNER_REQUEST_STATUSES[key]?.label || key })),
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'Tous les types' },
  ...PARTNER_REQUEST_TYPE_VALUES.map((key) => ({ value: key, label: PARTNER_REQUEST_TYPES[key]?.label || key })),
];

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'Toutes les priorités' },
  ...PARTNER_REQUEST_PRIORITY_VALUES.map((key) => ({ value: key, label: PARTNER_REQUEST_PRIORITIES[key]?.label || key })),
];

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Toutes les périodes' },
  { value: 'today', label: "Aujourd'hui" },
  { value: 'last7', label: '7 derniers jours' },
  { value: 'month', label: 'Ce mois' },
  { value: 'lastMonth', label: 'Mois précédent' },
  { value: 'last3', label: '3 derniers mois' },
];

const CLIENT_OPTIONS = [
  { value: 'all', label: 'Tous les clients' },
  { value: 'Transports Express Cameroun', label: 'Transports Express Cameroun' },
  { value: 'SCL Logistique', label: 'SCL Logistique' },
  { value: 'Cameroon Agro Industries', label: 'Cameroon Agro Industries' },
  { value: 'Global Mining Cameroun', label: 'Global Mining Cameroun' },
  { value: 'DBS Transports', label: 'DBS Transports' },
];

const PartnerRequestsTable = ({ requests, onAccept, onReject, onConvert }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all',
    client: 'all',
    period: 'all',
  });
  const [sort, setSort] = useState({ by: 'createdAt', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PARTNER_REQUEST_PAGE_SIZE);

  const filtered = useMemo(() => {
    let items = [...requests];
    if (search) {
      const s = search.toLowerCase();
      items = items.filter((req) =>
        req.reference.toLowerCase().includes(s) ||
        req.clientName.toLowerCase().includes(s) ||
        (req.subject && req.subject.toLowerCase().includes(s))
      );
    }
    if (filters.status !== 'all') items = items.filter((req) => req.status === filters.status);
    if (filters.type !== 'all') items = items.filter((req) => req.type === filters.type);
    if (filters.priority !== 'all') items = items.filter((req) => req.priority === filters.priority);
    if (filters.client !== 'all') items = items.filter((req) => req.clientName === filters.client);
    if (filters.period !== 'all') {
      const now = Date.now();
      const periodMap = { today: 1, last7: 7, month: 30, lastMonth: 60, last3: 90 };
      const days = periodMap[filters.period];
      if (days) {
        const from = now - days * 86_400_000;
        items = items.filter((req) => new Date(req.createdAt).getTime() >= from);
      }
    }
    return items;
  }, [requests, search, filters]);

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
          onClick={() => navigate(partnerRequestDetailPath(row.id))}
        >
          {row.reference}
        </button>
      ),
    },
    {
      key: 'clientName',
      label: 'Client',
      sortable: true,
      render: (row) => <span className="text-truncate d-inline-block" style={{ maxWidth: '160px' }}>{row.clientName}</span>,
    },
    {
      key: 'subject',
      label: 'Objet',
      render: (row) => (
        <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
          {row.subject}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (row) => {
        const cfg = PARTNER_REQUEST_TYPES[row.type] || {};
        return <StatusBadge variant="info" label={cfg.label} icon={cfg.icon} size="sm" />;
      },
    },
    {
      key: 'priority',
      label: 'Priorité',
      sortable: true,
      render: (row) => {
        const cfg = PARTNER_REQUEST_PRIORITIES[row.priority] || {};
        return <StatusBadge variant={cfg.variant} label={cfg.label} icon={cfg.icon} size="sm" />;
      },
    },
    {
      key: 'estimatedAmount',
      label: 'Montant estimé',
      sortable: true,
      render: (row) => (
        <span className="navix-client-finance__amount fw-bold">
          {formatNumber(row.estimatedAmount)} {FCFA_LABEL}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (row) => {
        const cfg = PARTNER_REQUEST_STATUSES[row.status] || {};
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

  const actions = [
    { label: 'Voir le détail', icon: 'bi-eye', onClick: (row) => navigate(partnerRequestDetailPath(row.id)) },
  ];
  if (onAccept) actions.push({ label: 'Accepter', icon: 'bi-check-lg', variant: 'success', onClick: (row) => onAccept(row), show: (row) => row.status === 'pending' || row.status === 'reviewing' });
  if (onReject) actions.push({ label: 'Refuser', icon: 'bi-x-lg', variant: 'danger', onClick: (row) => onReject(row), show: (row) => row.status === 'pending' || row.status === 'reviewing' });
  if (onConvert) actions.push({ label: 'Convertir', icon: 'bi-arrow-right-circle', variant: 'primary', onClick: (row) => onConvert(row), show: (row) => row.status === 'accepted' });

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
            placeholder="Rechercher une demande, un client ou un objet..."
          />
          <FilterBar
            filters={[
              { key: 'status', label: 'Statut', options: STATUS_OPTIONS, value: filters.status },
              { key: 'type', label: 'Type', options: TYPE_OPTIONS, value: filters.type },
              { key: 'priority', label: 'Priorité', options: PRIORITY_OPTIONS, value: filters.priority },
              { key: 'client', label: 'Client', options: CLIENT_OPTIONS, value: filters.client },
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
          pageSizeOptions={PARTNER_REQUEST_PAGE_SIZE_OPTIONS}
        />
      }
      actions={actions}
      empty={
        <EmptyState
          icon="bi-inbox"
          title="Aucune demande trouvée"
          description="Aucune demande ne correspond à vos critères de recherche."
          compact
        />
      }
    />
  );
};

export default PartnerRequestsTable;
