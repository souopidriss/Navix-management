/**
 * Navix Driver — DriverDocumentsPage
 * --------------------------------------------------------------------------
 * Documents du chauffeur et du véhicule : grille de cartes, filtres
 * (type / statut), recherche par nom et tri par échéance ou type.
 */
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { formatDate } from '@/utils/format';
import { Button, Card, Alert } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  SearchBar,
  FilterBar,
  LoadingState,
  ErrorState,
  EmptyState,
  StatusBadge,
} from '@/components/core';
import {
  DRIVER_DOCUMENT_TYPES,
  DRIVER_DOCUMENT_STATUSES,
  getDriverDocumentType,
  getDriverDocumentStatus,
} from '../constants/driver.constants';
import { useDriverDocuments } from '../hooks/useDriverDocuments';

const toOptions = (map) => Object.entries(map).map(([value, meta]) => ({ value, label: meta.label }));

const SORT_OPTIONS = [
  { value: 'expiry', label: 'Échéance proche' },
  { value: 'type', label: 'Type' },
  { value: 'name', label: 'Nom' },
];

const expiryValue = (document) => (document.expiryDate ? new Date(`${document.expiryDate}T00:00:00`).getTime() : Infinity);

const DriverDocumentsPage = () => {
  const { data: documents, isLoading, error, refetch } = useDriverDocuments();

  const [filters, setFilters] = useState({ type: '', status: '' });
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('expiry');

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const list = (documents ?? []).filter((document) => {
      if (filters.type && document.type !== filters.type) return false;
      if (filters.status && document.status !== filters.status) return false;
      if (keyword && !`${document.name} ${document.holder} ${document.reference}`.toLowerCase().includes(keyword)) {
        return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sort === 'type') return getDriverDocumentType(a.type).label.localeCompare(getDriverDocumentType(b.type).label);
      if (sort === 'name') return a.name.localeCompare(b.name);
      return expiryValue(a) - expiryValue(b);
    });
  }, [documents, filters, query, sort]);

  const hasActiveFilters = Boolean(filters.type || filters.status || query.trim());
  const resetFilters = () => {
    setFilters({ type: '', status: '' });
    setQuery('');
  };

  const stats = useMemo(() => {
    const countBy = (status) => (documents ?? []).filter((document) => document.status === status).length;
    return [
      { key: 'valid', label: 'Valides', value: countBy('valid'), icon: 'bi-check-circle', variant: 'success' },
      { key: 'expiring', label: 'Expirent bientôt', value: countBy('expiring'), icon: 'bi-clock', variant: 'warning' },
      { key: 'expired', label: 'Expirés', value: countBy('expired'), icon: 'bi-x-circle', variant: 'danger' },
      { key: 'pending', label: 'En attente', value: countBy('pending'), icon: 'bi-hourglass-split', variant: 'info' },
    ];
  }, [documents]);

  const expiring = stats.find((stat) => stat.key === 'expiring')?.value ?? 0;
  const expired = stats.find((stat) => stat.key === 'expired')?.value ?? 0;

  const breadcrumbs = [{ label: 'Espace Chauffeur' }, { label: 'Mes documents' }];

  if (isLoading && !documents) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={6} label="Chargement de vos documents…" />
      </PageContainer>
    );
  }

  if (error && !documents) {
    return (
      <PageContainer>
        <ErrorState
          title="Documents indisponibles"
          description="Impossible de charger vos documents pour le moment."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Mes documents — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Mes documents"
        subtitle="Permis, assurance, visite technique et autres documents de votre véhicule."
        icon="bi-folder2-open"
        breadcrumbs={breadcrumbs}
        actions={
          <Button variant="outline" size="sm" icon="bi-arrow-clockwise" onClick={refetch}>
            Actualiser
          </Button>
        }
      />

      {/* ── Statistiques ───────────────────────────────────────────────── */}
      <div className="row g-3 mb-3">
        {stats.map((stat) => (
          <div key={stat.key} className="col-6 col-lg-3">
            <Card className="h-100">
              <div className="d-flex align-items-center gap-3">
                <i className={`bi ${stat.icon} fs-4 text-${stat.variant}`} aria-hidden="true" />
                <div>
                  <div className="fw-bold fs-5">{stat.value}</div>
                  <div className="text-muted small">{stat.label}</div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* ── Alerte échéances ───────────────────────────────────────────── */}
      {(expired > 0 || expiring > 0) && (
        <Alert variant={expired > 0 ? 'danger' : 'warning'} className="mb-3" closable>
          {expired > 0
            ? `${expired} document${expired > 1 ? 's' : ''} expiré${expired > 1 ? 's' : ''} : le véhicule peut être immobilisé.`
            : `${expiring} document${expiring > 1 ? 's' : ''} arrive${expiring > 1 ? 'nt' : ''} à échéance sous 30 jours. Prévoyez leur renouvellement.`}
        </Alert>
      )}

      {/* ── Recherche, filtres & tri ───────────────────────────────────── */}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Rechercher un document…"
          className="flex-grow-1"
        />
        <FilterBar
          fields={[
            { key: 'type', type: 'select', label: 'Type', allLabel: 'Tous les types', options: toOptions(DRIVER_DOCUMENT_TYPES) },
            { key: 'status', type: 'select', label: 'Statut', allLabel: 'Tous les statuts', options: toOptions(DRIVER_DOCUMENT_STATUSES) },
          ]}
          values={filters}
          onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '11rem' }}
          aria-label="Trier les documents"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              Trier : {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Grille de documents ────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="bi-folder-x"
          title="Aucun document trouvé"
          description="Aucun document ne correspond à vos critères."
          action={
            hasActiveFilters ? (
              <Button variant="outline" size="sm" icon="bi-arrow-counterclockwise" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="row g-3">
          {filtered.map((document) => {
            const type = getDriverDocumentType(document.type);
            const status = getDriverDocumentStatus(document.status);
            return (
              <div key={document.id} className="col-md-6 col-xl-4">
                <Card className="h-100">
                  <div className="d-flex align-items-start gap-3">
                    <span
                      className="rounded-3 bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: '3rem', height: '3rem', fontSize: '1.5rem' }}
                      aria-hidden="true"
                    >
                      <i className={`bi ${type.icon}`} />
                    </span>
                    <div className="flex-grow-1">
                      <h3 className="h6 fw-bold mb-1">{document.name}</h3>
                      <p className="text-muted small mb-2">
                        {type.label} · {document.holder}
                      </p>
                      <div className="mb-2">
                        <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />
                      </div>
                    </div>
                  </div>

                  <div className="border-top border-secondary-subtle pt-2 mt-2 small">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Référence</span>
                      <span className="fw-medium">{document.reference}</span>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <span className="text-muted">Délivré le</span>
                      <span className="fw-medium">{formatDate(document.issueDate)}</span>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <span className="text-muted">Expire le</span>
                      <span className="fw-medium">{document.expiryDate ? formatDate(document.expiryDate) : 'Sans échéance'}</span>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};

export default DriverDocumentsPage;
