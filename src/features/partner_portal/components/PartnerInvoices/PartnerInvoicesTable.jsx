/**
 * Navix Partner Portal — PartnerInvoicesTable (PROMPT 071 §6-12)
 * --------------------------------------------------------------------------
 * Tableau des factures : recherche, filtres (statut, paiement, période, client),
 * tri (date, montant, échéance, statut), pagination et actions.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, SearchBar, FilterBar, Pagination, EmptyState, StatusBadge } from '@/components/core';
import { formatDateTime, formatNumber } from '@/utils/format';
import { ROUTES, partnerInvoiceDetailPath } from '@/routes/route.constants';
import {
  FCFA_LABEL,
  PARTNER_INVOICE_STATUSES,
  PARTNER_INVOICE_STATUS_VALUES,
  PARTNER_PAYMENT_STATUSES,
  PARTNER_PAYMENT_STATUS_VALUES,
  PARTNER_MISSION_TYPES,
  PARTNER_MISSION_TYPE_VALUES,
  DEFAULT_PARTNER_INVOICE_PAGE_SIZE,
  PARTNER_INVOICE_PAGE_SIZE_OPTIONS,
} from '../../constants/partner.constants';

const TYPE_OPTIONS = [
  { value: 'all', label: 'Tous les types' },
  ...PARTNER_MISSION_TYPE_VALUES.map((key) => ({ value: key, label: PARTNER_MISSION_TYPES[key]?.label || key })),
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  ...PARTNER_INVOICE_STATUS_VALUES.map((key) => ({ value: key, label: PARTNER_INVOICE_STATUSES[key]?.label || key })),
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les paiements' },
  ...PARTNER_PAYMENT_STATUS_VALUES.map((key) => ({ value: key, label: PARTNER_PAYMENT_STATUSES[key]?.label || key })),
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

const PartnerInvoicesTable = ({ invoices }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    paymentStatus: 'all',
    serviceType: 'all',
    period: 'all',
    client: 'all',
  });
  const [sort, setSort] = useState({ by: 'issueDate', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PARTNER_INVOICE_PAGE_SIZE);

  const filtered = useMemo(() => {
    let items = [...invoices];
    if (search) {
      const s = search.toLowerCase();
      items = items.filter((inv) =>
        inv.reference.toLowerCase().includes(s) ||
        inv.clientName.toLowerCase().includes(s) ||
        inv.missionReference.toLowerCase().includes(s) ||
        (inv.description && inv.description.toLowerCase().includes(s))
      );
    }
    if (filters.status !== 'all') items = items.filter((inv) => inv.status === filters.status);
    if (filters.paymentStatus !== 'all') items = items.filter((inv) => inv.paymentStatus === filters.paymentStatus);
    if (filters.serviceType !== 'all') items = items.filter((inv) => inv.serviceType === filters.serviceType);
    if (filters.client !== 'all') items = items.filter((inv) => inv.clientName === filters.client);
    if (filters.period !== 'all') {
      const now = Date.now();
      const periodMap = { today: 1, last7: 7, month: 30, lastMonth: 60, last3: 90 };
      const days = periodMap[filters.period];
      if (days) {
        const from = now - days * 86_400_000;
        items = items.filter((inv) => new Date(inv.issueDate).getTime() >= from);
      }
    }
    return items;
  }, [invoices, search, filters]);

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
      key: 'issueDate',
      label: 'Date',
      sortable: true,
      render: (row) => <span className="text-nowrap">{formatDateTime(row.issueDate)}</span>,
    },
    {
      key: 'reference',
      label: 'Référence',
      sortable: true,
      render: (row) => (
        <button
          type="button"
          className="btn btn-link p-0 font-monospace fw-semibold text-decoration-none"
          onClick={() => navigate(partnerInvoiceDetailPath(row.id))}
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
      key: 'missionReference',
      label: 'Mission',
      render: (row) => <span className="font-monospace">{row.missionReference}</span>,
    },
    {
      key: 'totalAmount',
      label: 'Montant',
      sortable: true,
      render: (row) => <span className="navix-client-finance__amount fw-bold">{formatNumber(row.totalAmount)} {FCFA_LABEL}</span>,
    },
    {
      key: 'dueDate',
      label: 'Échéance',
      sortable: true,
      render: (row) => {
        const due = new Date(row.dueDate);
        const now = Date.now();
        const diff = Math.ceil((due.getTime() - now) / 86_400_000);
        let className = '';
        if (row.status !== 'paid' && row.status !== 'cancelled') {
          if (diff < 0) className = 'text-danger fw-semibold';
          else if (diff <= 7) className = 'text-warning fw-semibold';
        }
        return <span className={`text-nowrap ${className}`}>{formatDateTime(row.dueDate)}</span>;
      },
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (row) => {
        const cfg = PARTNER_INVOICE_STATUSES[row.status] || {};
        return <StatusBadge variant={cfg.variant} label={cfg.label} icon={cfg.icon} size="sm" />;
      },
    },
    {
      key: 'paymentStatus',
      label: 'Paiement',
      sortable: true,
      render: (row) => {
        const cfg = PARTNER_PAYMENT_STATUSES[row.paymentStatus] || {};
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
            placeholder="Rechercher une facture, un client ou une mission..."
          />
          <FilterBar
            filters={[
              { key: 'status', label: 'Statut', options: STATUS_OPTIONS, value: filters.status },
              { key: 'paymentStatus', label: 'Paiement', options: PAYMENT_STATUS_OPTIONS, value: filters.paymentStatus },
              { key: 'client', label: 'Client', options: CLIENT_OPTIONS, value: filters.client },
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
          pageSizeOptions={PARTNER_INVOICE_PAGE_SIZE_OPTIONS}
        />
      }
      actions={[
        {
          label: 'Voir le détail',
          icon: 'bi-eye',
          onClick: (row) => navigate(partnerInvoiceDetailPath(row.id)),
        },
      ]}
      empty={
        <EmptyState
          icon="bi-receipt"
          title="Aucune facture trouvée"
          description="Aucune facture ne correspond à vos critères de recherche."
          compact
        />
      }
    />
  );
};

export default PartnerInvoicesTable;
