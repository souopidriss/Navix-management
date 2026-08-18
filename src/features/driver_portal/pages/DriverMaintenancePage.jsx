/**
 * Navix Driver — DriverMaintenancePage
 * --------------------------------------------------------------------------
 * Entretiens du véhicule assigné : statistiques, filtres, tableau et
 * pagination. Réutilise les constantes métier du module Entretiens.
 */
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { formatNumber } from '@/utils/format';
import { Button } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  DataTable,
  StatsCards,
  FilterBar,
  Pagination,
  LoadingState,
  ErrorState,
  EmptyState,
  StatusBadge,
} from '@/components/core';
import {
  MAINTENANCE_TYPES,
  MAINTENANCE_STATUSES,
  MAINTENANCE_PRIORITIES,
  getMaintenanceType,
  getMaintenanceStatus,
  getMaintenancePriority,
  formatMaintenanceDate,
  formatMaintenanceMoney,
} from '@/features/maintenance';
import { useDriverMaintenance } from '../hooks/useDriverMaintenance';

const DEFAULT_PAGE_SIZE = 8;

const toOptions = (map) => Object.entries(map).map(([value, meta]) => ({ value, label: meta.label }));

const DriverMaintenancePage = () => {
  const { data: records, isLoading, error, refetch } = useDriverMaintenance();

  const [filters, setFilters] = useState({ type: '', status: '', priority: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const filtered = useMemo(
    () =>
      (records ?? []).filter((record) => {
        if (filters.type && record.type !== filters.type) return false;
        if (filters.status && record.status !== filters.status) return false;
        if (filters.priority && record.priority !== filters.priority) return false;
        return true;
      }),
    [records, filters],
  );

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const hasActiveFilters = Boolean(filters.type || filters.status || filters.priority);

  const resetFilters = () => setFilters({ type: '', status: '', priority: '' });

  const stats = useMemo(() => {
    const list = records ?? [];
    return [
      {
        key: 'upcoming',
        label: 'À venir',
        value: formatNumber(list.filter((record) => record.status === 'planned').length),
        icon: 'bi-calendar2-event',
        variant: 'warning',
      },
      {
        key: 'inProgress',
        label: 'En cours',
        value: formatNumber(
          list.filter((record) => record.status === 'in_progress' || record.status === 'pending').length,
        ),
        icon: 'bi-gear-wide-connected',
        variant: 'primary',
      },
      {
        key: 'completed',
        label: 'Terminés',
        value: formatNumber(list.filter((record) => record.status === 'completed').length),
        icon: 'bi-check2-circle',
        variant: 'success',
      },
      {
        key: 'urgent',
        label: 'Urgents',
        value: formatNumber(list.filter((record) => record.priority === 'urgent').length),
        icon: 'bi-exclamation-triangle',
        variant: 'danger',
      },
    ];
  }, [records]);

  const breadcrumbs = [{ label: 'Espace Chauffeur' }, { label: 'Entretiens' }];

  if (isLoading && !records) {
    return (
      <PageContainer>
        <LoadingState variant="table" rows={6} cols={6} label="Chargement de vos entretiens…" />
      </PageContainer>
    );
  }

  if (error && !records) {
    return (
      <PageContainer>
        <ErrorState
          title="Entretiens indisponibles"
          description="Impossible de charger les entretiens de votre véhicule."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Mes entretiens — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Mes entretiens"
        subtitle="Suivez la maintenance de votre véhicule et les échéances à venir."
        icon="bi-wrench-adjustable"
        breadcrumbs={breadcrumbs}
        actions={
          <Button variant="outline" size="sm" icon="bi-arrow-clockwise" onClick={refetch}>
            Actualiser
          </Button>
        }
      />

      <StatsCards stats={stats} loading={isLoading && !records} columns={4} />

      <div className="my-3">
        <FilterBar
          fields={[
            {
              key: 'type',
              type: 'select',
              label: 'Type d\u2019entretien',
              allLabel: 'Tous les types',
              options: toOptions(MAINTENANCE_TYPES),
            },
            {
              key: 'status',
              type: 'select',
              label: 'Statut',
              allLabel: 'Tous les statuts',
              options: toOptions(MAINTENANCE_STATUSES),
            },
            {
              key: 'priority',
              type: 'select',
              label: 'Priorité',
              allLabel: 'Toutes les priorités',
              options: toOptions(MAINTENANCE_PRIORITIES),
            },
          ]}
          values={filters}
          onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {pageItems.length === 0 ? (
        <EmptyState
          icon="bi-wrench-adjustable"
          title="Aucun entretien trouvé"
          description="Aucun entretien ne correspond à vos critères."
          action={
            hasActiveFilters ? (
              <Button variant="outline" size="sm" icon="bi-arrow-counterclockwise" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            ) : undefined
          }
        />
      ) : (
        <DataTable
          ariaLabel="Liste de mes entretiens"
          columns={[
            {
              key: 'type',
              label: 'Type',
              render: (record) => {
                const meta = getMaintenanceType(record.type);
                return <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} dot={false} />;
              },
            },
            { key: 'title', label: 'Entretien', render: (record) => <span className="fw-medium">{record.title}</span> },
            { key: 'scheduledDate', label: 'Date prévue', sortable: true, render: (record) => formatMaintenanceDate(record.scheduledDate) },
            { key: 'workshop', label: 'Atelier', render: (record) => record.workshop || '—' },
            {
              key: 'cost',
              label: 'Coût',
              align: 'end',
              render: (record) =>
                record.actualCost != null
                  ? formatMaintenanceMoney(record.actualCost)
                  : formatMaintenanceMoney(record.estimatedCost),
            },
            {
              key: 'priority',
              label: 'Priorité',
              render: (record) => {
                const meta = getMaintenancePriority(record.priority);
                return <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} dot={false} />;
              },
            },
            {
              key: 'status',
              label: 'Statut',
              render: (record) => {
                const meta = getMaintenanceStatus(record.status);
                return <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} />;
              },
            },
          ]}
          rows={pageItems}
          rowKey="id"
          footer={
            <Pagination
              page={safePage}
              pageSize={pageSize}
              totalItems={totalItems}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          }
        />
      )}
    </PageContainer>
  );
};

export default DriverMaintenancePage;
