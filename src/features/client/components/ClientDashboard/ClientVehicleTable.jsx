/**
 * Navix Client Dashboard — ClientVehicleTable
 * --------------------------------------------------------------------------
 * Tableau premium des véhicules les plus utilisés (contexte Client).
 * Reprend le design du VehicleStatusTable du Dashboard Master.
 * Accès limité aux véhicules du propre contrat du client.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/core';
import { Card } from '@/components/ui';
import { ROUTES } from '@/routes/route.constants';
import './ClientDashboard.css';

const STATUS_MAP = {
  in_use: { label: 'En mission', variant: 'success', icon: 'bi-circle-fill' },
  available: { label: 'Disponible', variant: 'info', icon: 'bi-circle' },
  maintenance: { label: 'Maintenance', variant: 'warning', icon: 'bi-wrench-adjustable' },
  out_of_service: { label: 'Hors service', variant: 'danger', icon: 'bi-slash-circle' },
};

const formatMileage = (value) =>
  Number.isFinite(Number(value))
    ? `${Number(value).toLocaleString('fr-FR')} km`
    : '—';

const ClientVehicleTable = ({ vehicles = [], loading = false }) => {
  const [sort, setSort] = useState({ by: 'mileage', dir: 'desc' });

  const sorted = [...vehicles].sort((a, b) => {
    if (sort.by === 'mileage') {
      return sort.dir === 'asc' ? a.mileage - b.mileage : b.mileage - a.mileage;
    }
    return 0;
  });

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.by === key ? { by: key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { by: key, dir: 'desc' },
    );
  };

  return (
    <Card
      flush
      title={
        <div className="d-flex align-items-center justify-content-between w-100">
          <span className="d-flex align-items-center gap-2">
            <i className="bi bi-shield-shaded text-primary" aria-hidden="true" />
            <span>Véhicules les plus utilisés</span>
          </span>
          <Link to={ROUTES.CLIENT_VEHICLES} className="btn btn-sm btn-outline-primary">
            Voir tous les véhicules
            <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
          </Link>
        </div>
      }
    >
      <div className="table-responsive">
        <table
          className="table table-hover align-middle mb-0 navix-client-vehicles-table"
          aria-label="Véhicules les plus utilisés"
        >
          <thead>
            <tr>
              <th>Véhicule</th>
              <th>Immatriculation</th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSort('mileage')}
                aria-sort={sort.by === 'mileage' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Kilométrage
                <i className={`bi ms-1 ${sort.dir === 'asc' ? 'bi-chevron-up' : 'bi-chevron-down'} text-muted`} />
              </th>
              <th>Localisation</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j}>
                      <span className="placeholder-glow">
                        <span className="placeholder col-10 rounded" />
                      </span>
                    </td>
                  ))}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  <i className="bi bi-truck me-2" aria-hidden="true" />
                  Aucun véhicule disponible
                </td>
              </tr>
            ) : (
              sorted.map((v) => {
                const statusMeta = STATUS_MAP[v.status] || STATUS_MAP.available;
                return (
                  <tr key={v.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="navix-client-vehicle-icon" aria-hidden="true">
                          <i className="bi bi-truck" />
                        </span>
                        <div>
                          <div className="fw-semibold">{v.brand} {v.model}</div>
                          <small className="text-muted">Année {v.year}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-monospace fw-medium">{v.registrationNumber}</span>
                    </td>
                    <td className="fw-semibold text-body-emphasis">
                      {formatMileage(v.mileage)}
                    </td>
                    <td>
                      <span className="d-flex align-items-center gap-1 text-muted small">
                        <i className="bi bi-geo-alt text-danger" aria-hidden="true" />
                        {v.location}
                      </span>
                    </td>
                    <td>
                      <StatusBadge
                        variant={statusMeta.variant}
                        label={statusMeta.label}
                        icon={statusMeta.icon}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ClientVehicleTable;
