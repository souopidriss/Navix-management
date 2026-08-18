/**
 * Navix Driver — DriverFuelPage
 * --------------------------------------------------------------------------
 * Historique des pleins de carburant du véhicule assigné : statistiques,
 * recherche, filtres, tableau et pagination.
 */
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { formatDate, formatNumber } from '@/utils/format';
import { Button } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  DataTable,
  StatsCards,
  SearchBar,
  FilterBar,
  Pagination,
  LoadingState,
  ErrorState,
  EmptyState,
  StatusBadge,
} from '@/components/core';
import { DRIVER_FUEL_TYPES, getDriverFuelType, formatDriverMoney } from '../constants/driver.constants';
import { useDriverFuel } from '../hooks/useDriverFuel';

const DEFAULT_PAGE_SIZE = 8;

const matchesPeriod = (record, period) => {
  if (!period) return true;
  const date = new Date(`${record.date}T00:00:00`);
  const now = new Date();
  if (period === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  if (period === 'quarter') {
    return date.getFullYear() === now.getFullYear() && Math.floor(date.getMonth() / 3) === Math.floor(now.getMonth() / 3);
  }
  return date.getFullYear() === now.getFullYear();
};

const DriverFuelPage = () => {
  const { data: records, isLoading, error, refetch } = useDriverFuel();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ fuelType: '', period: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (records ?? []).filter((record) => {
      if (query && !record.station.toLowerCase().includes(query)) return false;
      if (filters.fuelType && record.fuelType !== filters.fuelType) return false;
      if (!matchesPeriod(record, filters.period)) return false;
      return true;
    });
  }, [records, search, filters]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const hasActiveFilters = Boolean(search.trim() || filters.fuelType || filters.period);

  const resetFilters = () => {
    setSearch('');
    setFilters({ fuelType: '', period: '' });
  };

  const stats = useMemo(() => {
    const list = records ?? [];
    const totalQuantity = list.reduce((sum, record) => sum + Number(record.quantity || 0), 0);
    const totalCost = list.reduce((sum, record) => sum + Number(record.totalCost || 0), 0);
    const avgPrice = totalQuantity ? totalCost / totalQuantity : 0;

    return [
      {
        key: 'totalQuantity',
        label: 'Volume total',
        value: `${formatNumber(totalQuantity)} L`,
        icon: 'bi-fuel-pump',
        variant: 'info',
      },
      {
        key: 'totalCost',
        label: 'Coût total',
        value: formatDriverMoney(totalCost),
        icon: 'bi-cash-stack',
        variant: 'success',
      },
      {
        key: 'count',
        label: 'Pleins effectués',
        value: formatNumber(list.length),
        icon: 'bi-ev-station',
        variant: 'primary',
      },
      {
        key: 'avgPrice',
        label: 'Prix moyen / L',
        value: formatDriverMoney(Math.round(avgPrice)),
        icon: 'bi-graph-up-arrow',
        variant: 'warning',
      },
    ];
  }, [records]);

  const breadcrumbs = [{ label: 'Espace Chauffeur' }, { label: 'Carburant' }];

  if (isLoading && !records) {
    return (
      <PageContainer>
        <LoadingState variant="table" rows={6} cols={6} label="Chargement de vos pleins de carburant…" />
      </PageContainer>
    );
  }

  if (error && !records) {
    return (
      <PageContainer>
        <ErrorState
          title="Données indisponibles"
          description="Impossible de charger l\u2019historique de carburant."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Mon carburant — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Mon carburant"
        subtitle="Suivi des pleins et de la consommation de votre véhicule."
        icon="bi-fuel-pump"
        breadcrumbs={breadcrumbs}
        actions={
          <Button variant="outline" size="sm" icon="bi-arrow-clockwise" onClick={refetch}>
            Actualiser
          </Button>
        }
      />

      <StatsCards stats={stats} loading={isLoading && !records} columns={4} />

      <div className="my-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          resultCount={totalItems}
          placeholder="Rechercher une station…"
        />
      </div>

      <FilterBar
        fields={[
          {
            key: 'fuelType',
            type: 'select',
            label: 'Type de carburant',
            allLabel: 'Tous les carburants',
            options: Object.entries(DRIVER_FUEL_TYPES).map(([value, meta]) => ({ value, label: meta.label })),
          },
          {
            key: 'period',
            type: 'select',
            label: 'Période',
            allLabel: 'Toutes les périodes',
            options: [
              { value: 'month', label: 'Ce mois-ci' },
              { value: 'quarter', label: 'Ce trimestre' },
              { value: 'year', label: 'Cette année' },
            ],
          },
        ]}
        values={filters}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {pageItems.length === 0 ? (
        <EmptyState
          icon="bi-fuel-pump"
          title="Aucun plein trouvé"
          description="Aucun plein ne correspond à vos critères."
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
          ariaLabel="Liste de mes pleins de carburant"
          columns={[
            { key: 'date', label: 'Date', sortable: true, render: (record) => formatDate(record.date) },
            { key: 'station', label: 'Station', render: (record) => <span className="fw-medium">{record.station}</span> },
            {
              key: 'fuelType',
              label: 'Type',
              render: (record) => {
                const meta = getDriverFuelType(record.fuelType);
                return <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} dot={false} />;
              },
            },
            { key: 'quantity', label: 'Quantité', align: 'end', render: (record) => `${formatNumber(record.quantity)} L` },
            {
              key: 'pricePerLiter',
              label: 'Prix / L',
              align: 'end',
              render: (record) => formatDriverMoney(record.pricePerLiter),
            },
            {
              key: 'totalCost',
              label: 'Coût total',
              align: 'end',
              sortable: true,
              render: (record) => <span className="fw-semibold">{formatDriverMoney(record.totalCost)}</span>,
            },
            { key: 'odometer', label: 'Kilométrage', align: 'end', render: (record) => `${formatNumber(record.odometer)} km` },
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

export default DriverFuelPage;
