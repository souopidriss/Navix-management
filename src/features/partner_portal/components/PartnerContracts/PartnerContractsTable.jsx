/**
 * Navix Partner Portal — PartnerContractsTable (PROMPT 073)
 * --------------------------------------------------------------------------
 * Tableau des contrats : recherche, filtres (statut, type, catégorie, fréquence,
 * période), tri (date, référence, client, type, montant, statut), pagination,
 * et actions (voir, renouveler, résilier, suspendre).
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar, FilterBar, Pagination, EmptyState, StatusBadge } from '@/components/core';
import { formatDateTime, formatNumber } from '@/utils/format';
import { partnerContractDetailPath } from '@/routes/route.constants';
import {
  FCFA_LABEL,
  PARTNER_CONTRACT_STATUSES,
  PARTNER_CONTRACT_STATUS_KEYS,
  PARTNER_CONTRACT_TYPES,
  PARTNER_CONTRACT_TYPE_KEYS,
  PARTNER_BILLING_FREQUENCIES,
  PARTNER_BILLING_FREQUENCY_KEYS,
  PARTNER_CONTRACT_CATEGORIES,
  DEFAULT_PARTNER_CONTRACT_PAGE_SIZE,
  PARTNER_CONTRACT_PAGE_SIZE_OPTIONS,
} from '../../constants/partner.constants';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  ...PARTNER_CONTRACT_STATUS_KEYS.map((key) => ({ value: key, label: PARTNER_CONTRACT_STATUSES[key]?.label || key })),
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'Tous les types' },
  ...PARTNER_CONTRACT_TYPE_KEYS.map((key) => ({ value: key, label: PARTNER_CONTRACT_TYPES[key]?.label || key })),
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Toutes les catégories' },
  ...Object.keys(PARTNER_CONTRACT_CATEGORIES).map((key) => ({ value: key, label: PARTNER_CONTRACT_CATEGORIES[key]?.label || key })),
];

const BILLING_OPTIONS = [
  { value: 'all', label: 'Toutes les fréquences' },
  ...PARTNER_BILLING_FREQUENCY_KEYS.map((key) => ({ value: key, label: PARTNER_BILLING_FREQUENCIES[key]?.label || key })),
];

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Toutes les périodes' },
  { value: 'today', label: "Aujourd'hui" },
  { value: 'last7', label: '7 derniers jours' },
  { value: 'month', label: 'Ce mois' },
  { value: 'last3', label: '3 derniers mois' },
  { value: 'last6', label: '6 derniers mois' },
  { value: 'year', label: 'Cette année' },
];

const SORT_COLUMNS = [
  { key: 'reference', label: 'Référence' },
  { key: 'clientName', label: 'Client' },
  { key: 'type', label: 'Type' },
  { key: 'startDate', label: 'Début' },
  { key: 'endDate', label: 'Fin' },
  { key: 'value', label: 'Valeur' },
  { key: 'status', label: 'Statut' },
  { key: 'createdAt', label: 'Créé le' },
];

const PartnerContractsTable = ({
  contracts,
  onRenew,
  onTerminate,
  onSuspend,
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    category: 'all',
    billingFrequency: 'all',
    period: 'all',
  });
  const [sort, setSort] = useState({ by: 'createdAt', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PARTNER_CONTRACT_PAGE_SIZE);

  const filtered = useMemo(() => {
    let items = [...(contracts || [])];

    // Recherche
    if (search) {
      const s = search.toLowerCase();
      items = items.filter((c) =>
        c.reference?.toLowerCase().includes(s) ||
        c.title?.toLowerCase().includes(s) ||
        c.clientName?.toLowerCase().includes(s) ||
        c.vehicleName?.toLowerCase().includes(s)
      );
    }

    // Filtres exacts
    if (filters.status !== 'all') items = items.filter((c) => c.status === filters.status);
    if (filters.type !== 'all') items = items.filter((c) => c.type === filters.type);
    if (filters.category !== 'all') items = items.filter((c) => c.category === filters.category);
    if (filters.billingFrequency !== 'all') items = items.filter((c) => c.billingFrequency === filters.billingFrequency);

    // Période
    if (filters.period !== 'all') {
      const now = Date.now();
      const periodMap = { today: 1, last7: 7, month: 30, last3: 90, last6: 180, year: 365 };
      const days = periodMap[filters.period];
      if (days) {
        const cutoff = now - days * 24 * 60 * 60 * 1000;
        items = items.filter((c) => c.createdAt && new Date(c.createdAt).getTime() >= cutoff);
      }
    }

    // Tri
    items.sort((a, b) => {
      let aVal = a[sort.by];
      let bVal = b[sort.by];
      if (sort.by === 'value') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }
      if (['startDate', 'endDate', 'createdAt'].includes(sort.by)) {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return items;
  }, [contracts, search, filters, sort]);

  const totalFiltered = filtered.length;
  const totalPages = Math.ceil(totalFiltered / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSort = (column) => {
    setSort((prev) => ({
      by: column,
      direction: prev.by === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getExpiryBadge = (contract) => {
    if (!contract.endDate) return null;
    const now = Date.now();
    const end = new Date(contract.endDate).getTime();
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

    if (days < 0) return <span className="badge bg-danger">Expiré</span>;
    if (days <= 30) return <span className="badge bg-warning text-dark">{days}j</span>;
    if (days <= 90) return <span className="badge bg-info">{days}j</span>;
    return null;
  };

  return (
    <div>
      {/* Recherche + Filtres */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-4">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Rechercher un contrat, client, référence..."
              />
            </div>
            <div className="col-6 col-md-2">
              <FilterBar
                label="Statut"
                value={filters.status}
                options={STATUS_OPTIONS}
                onChange={(v) => handleFilterChange('status', v)}
              />
            </div>
            <div className="col-6 col-md-2">
              <FilterBar
                label="Type"
                value={filters.type}
                options={TYPE_OPTIONS}
                onChange={(v) => handleFilterChange('type', v)}
              />
            </div>
            <div className="col-6 col-md-2">
              <FilterBar
                label="Fréquence"
                value={filters.billingFrequency}
                options={BILLING_OPTIONS}
                onChange={(v) => handleFilterChange('billingFrequency', v)}
              />
            </div>
            <div className="col-6 col-md-2">
              <FilterBar
                label="Période"
                value={filters.period}
                options={PERIOD_OPTIONS}
                onChange={(v) => handleFilterChange('period', v)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {paged.length === 0 ? (
        <EmptyState
          icon="bi-file-earmark-x"
          title="Aucun contrat trouvé"
          description="Modifiez vos filtres ou créez un nouveau contrat."
        />
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  {SORT_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                    >
                      {col.label}
                      {sort.by === col.key && (
                        <i className={`bi bi-chevron-${sort.direction === 'asc' ? 'up' : 'down'} ms-1`} />
                      )}
                    </th>
                  ))}
                  <th style={{ whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((contract) => (
                    <tr key={contract.id}>
                      <td>
                        <span className="fw-semibold text-primary">{contract.reference}</span>
                      </td>
                      <td>
                        <div className="fw-medium">{contract.clientName}</div>
                        {contract.vehicleName && (
                          <small className="text-muted">{contract.vehicleName}</small>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {PARTNER_CONTRACT_TYPES[contract.type]?.label || contract.type}
                        </span>
                      </td>
                      <td>{contract.startDate ? formatDateTime(contract.startDate, 'DD MMM YYYY') : '—'}</td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          {contract.endDate ? formatDateTime(contract.endDate, 'DD MMM YYYY') : '—'}
                          {getExpiryBadge(contract)}
                        </div>
                      </td>
                      <td className="text-end">
                        <span className="fw-medium">{formatNumber(contract.value)} {FCFA_LABEL}</span>
                      </td>
                      <td>
                        <StatusBadge variant={PARTNER_CONTRACT_STATUSES[contract.status]?.variant} label={PARTNER_CONTRACT_STATUSES[contract.status]?.label} icon={PARTNER_CONTRACT_STATUSES[contract.status]?.icon} />
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            title="Voir"
                            onClick={() => navigate(partnerContractDetailPath(contract.id))}
                          >
                            <i className="bi bi-eye" />
                          </button>
                          {contract.status === 'active' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-warning"
                              title="Suspendre"
                              onClick={() => onSuspend?.(contract)}
                            >
                              <i className="bi bi-pause-circle" />
                            </button>
                          )}
                          {contract.status === 'suspended' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success"
                              title="Réactiver"
                              onClick={() => onSuspend?.(contract)}
                            >
                              <i className="bi bi-play-circle" />
                            </button>
                          )}
                          {(contract.status === 'active' || contract.status === 'expiring') && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-info"
                              title="Renouveler"
                              onClick={() => onRenew?.(contract)}
                            >
                              <i className="bi bi-arrow-repeat" />
                            </button>
                          )}
                          {['active', 'expiring', 'suspended'].includes(contract.status) && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              title="Résilier"
                              onClick={() => onTerminate?.(contract)}
                            >
                              <i className="bi bi-slash-circle" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="card-footer d-flex justify-content-between align-items-center">
            <small className="text-muted">
              {totalFiltered} contrat{totalFiltered > 1 ? 's' : ''} trouvé{totalFiltered > 1 ? 's' : ''}
            </small>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={pageSize}
              pageSizeOptions={PARTNER_CONTRACT_PAGE_SIZE_OPTIONS}
              onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerContractsTable;
