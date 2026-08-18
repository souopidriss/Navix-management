/**
 * Navix Partner Portal — PartnerVehiclesTable
 * --------------------------------------------------------------------------
 * Table de la flotte partenaire (immatriculation, marque/modèle, année,
 * statut, kilométrage, chauffeur) affichée sur le Dashboard Partenaire.
 */
import { Card } from '@/components/ui';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';

const STATUS_META = {
  active: { variant: 'success', label: 'Actif', icon: 'bi-check-circle' },
  maintenance: { variant: 'warning', label: 'Entretien', icon: 'bi-wrench-adjustable' },
  available: { variant: 'info', label: 'Disponible', icon: 'bi-check-circle' },
  out_of_service: { variant: 'danger', label: 'Hors service', icon: 'bi-x-circle' },
};

const PartnerVehiclesTable = ({ vehicles = [], loading = false }) => (
  <Card
    flush
    title={
      <div className="d-flex align-items-center justify-content-between w-100">
        <span className="d-flex align-items-center gap-2">
          <i className="bi bi-truck text-info" aria-hidden="true" />
          <span>Flotte partenaire</span>
        </span>
        <Link to={ROUTES.PARTNER_VEHICLES} className="btn btn-sm btn-outline-info">
          Gérer la flotte
          <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
        </Link>
      </div>
    }
  >
    {loading ? (
      <div className="p-3 placeholder-glow">
        <div className="placeholder col-12 rounded" style={{ height: 120 }} />
      </div>
    ) : (
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" aria-label="Flotte partenaire">
          <thead>
            <tr>
              <th>Immatriculation</th>
              <th>Véhicule</th>
              <th>Chauffeur</th>
              <th className="text-end">Kilométrage</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-secondary py-4">
                  Aucun véhicule dans la flotte partenaire.
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => {
                const status = STATUS_META[vehicle.status] || STATUS_META.active;
                return (
                  <tr key={vehicle.id}>
                    <td className="fw-semibold text-nowrap">{vehicle.registration}</td>
                    <td>
                      {vehicle.brand} {vehicle.model}
                      <span className="text-muted small d-block">{vehicle.year}</span>
                    </td>
                    <td>{vehicle.driver || <span className="text-secondary">—</span>}</td>
                    <td className="text-end tabular-nums">
                      {Number(vehicle.km || 0).toLocaleString('fr-FR')} km
                    </td>
                    <td>
                      <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    )}
  </Card>
);

export default PartnerVehiclesTable;
