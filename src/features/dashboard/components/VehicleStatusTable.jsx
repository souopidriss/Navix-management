/**
 * Navix Dashboard — VehicleStatusTable
 * --------------------------------------------------------------------------
 * Tableau des véhicules du parc (état courant) : immatriculation, groupe,
 * statut, kilométrage et prochaine échéance documentaire. Construit sur la
 * DataTable générique ; tri local par kilométrage.
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui';
import { DataTable, StatusBadge } from '@/components/core';
import { vehicleDetailPath } from '@/routes/route.constants';
import {
  getVehicleGroup,
  getVehicleStatus,
  formatMileage,
  getExpiryStatus,
} from '@/features/vehicles/constants';
import { formatDashboardDate } from '../constants';
import './VehicleStatusTable.css';

const nextExpiry = (vehicle) => {
  const candidates = [vehicle.insuranceExpiry, vehicle.inspectionExpiry, vehicle.registrationExpiry]
    .filter(Boolean)
    .map((value) => ({ value, time: new Date(value).getTime() }))
    .filter((item) => Number.isFinite(item.time))
    .sort((a, b) => a.time - b.time);

  if (candidates.length === 0) return { label: '—', variant: 'secondary', date: '' };

  const { value } = candidates[0];
  return { ...getExpiryStatus(value), date: formatDashboardDate(value) };
};

const VehicleStatusTable = ({ vehicles = [], loading = false }) => {
  const navigate = useNavigate();
  const [sort, setSort] = useState({ by: 'mileage', direction: 'desc' });

  const rows = useMemo(() => {
    const sorted = [...vehicles];
    if (sort.by === 'mileage') {
      sorted.sort((a, b) =>
        sort.direction === 'asc' ? a.mileage - b.mileage : b.mileage - a.mileage,
      );
    }
    return sorted;
  }, [vehicles, sort]);

  const columns = [
    {
      key: 'vehicle',
      label: 'Véhicule',
      sortable: true,
      sortValue: (row) => row.registrationNumber,
      render: (row) => (
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-truck text-secondary" aria-hidden="true" />
          <div className="min-w-0">
            <div className="fw-semibold text-truncate">{row.registrationNumber}</div>
            <div className="navix-dash-table__sub">
              {row.brand} {row.model} · {row.year}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'group',
      label: 'Groupe',
      render: (row) => {
        const group = getVehicleGroup(row.group);
        return <StatusBadge variant={group.variant} label={group.label} dot={false} size="sm" />;
      },
    },
    {
      key: 'status',
      label: 'Statut',
      render: (row) => {
        const status = getVehicleStatus(row.status);
        return <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />;
      },
    },
    {
      key: 'mileage',
      label: 'Kilométrage',
      sortable: true,
      align: 'end',
      render: (row) => formatMileage(row.mileage),
    },
    {
      key: 'expiry',
      label: 'Prochaine échéance',
      render: (row) => {
        const expiry = nextExpiry(row);
        return (
          <div>
            <StatusBadge variant={expiry.variant} label={expiry.label} dot={false} size="sm" />
            <div className="navix-dash-table__sub">{expiry.date}</div>
          </div>
        );
      },
    },
  ];

  return (
    <Card
      title={
        <span>
          <i className="bi bi-table me-2" aria-hidden="true" />
          Parc — état des véhicules
        </span>
      }
      flush
      className="navix-dash-table"
    >
      <DataTable
        columns={columns}
        rows={rows}
        rowKey="id"
        sort={sort}
        onSortChange={setSort}
        loading={loading}
        loadingRows={5}
        onRowClick={(row) => navigate(vehicleDetailPath(row.id))}
        ariaLabel="État des véhicules du parc"
        emptyTitle="Aucun véhicule"
        emptyDescription="Aucun véhicule ne correspond aux filtres sélectionnés."
        emptyIcon="bi-truck"
      />
    </Card>
  );
};

export default VehicleStatusTable;
