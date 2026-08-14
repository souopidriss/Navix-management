/**
 * Navix Client — ClientVehiclesPage
 * --------------------------------------------------------------------------
 * Page "Mes véhicules" pour les clients ayant une flotte sous contrat.
 */
import { Helmet } from 'react-helmet-async';
import { Card, Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/core';
import { useClientData } from '../hooks/useClientData';
import { MOCK_VEHICLES } from '@/features/vehicles/mocks';

const ClientVehiclesPage = () => {
  const { currentClient } = useClientData();

  const clientVehicles = MOCK_VEHICLES.filter((v) => v.companyId === currentClient?.companyId || true).slice(0, 8);

  return (
    <div>
      <Helmet>
        <title>Mes Véhicules — Navix Client</title>
      </Helmet>

      <PageHeader
        title="Mes Véhicules Sous Contrat"
        subtitle="Consultez l'état et l'affectation des véhicules mis à disposition de votre organisation."
        icon="bi-truck"
        breadcrumbs={[{ label: 'Client', to: '/client/dashboard' }, { label: 'Mes véhicules' }]}
        actions={
          <Button variant="outline" size="sm" icon="bi-plus-circle">
            Demander un véhicule supplémentaire
          </Button>
        }
      />

      <Card>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Véhicule</th>
                <th>Immatriculation</th>
                <th>Groupe</th>
                <th>Kilométrage</th>
                <th>Localisation</th>
                <th>Statut</th>
                <th className="text-end">Fiche</th>
              </tr>
            </thead>
            <tbody>
              {clientVehicles.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="p-2 rounded-2 bg-primary-subtle text-primary">
                        <i className="bi bi-truck" />
                      </span>
                      <div>
                        <div className="fw-semibold">{v.brand} {v.model}</div>
                        <small className="text-muted">Année {v.year}</small>
                      </div>
                    </div>
                  </td>
                  <td className="fw-mono font-monospace">{v.registrationNumber}</td>
                  <td><span className="badge bg-secondary-subtle text-body">Groupe {v.group}</span></td>
                  <td>{v.mileage?.toLocaleString('fr-FR')} km</td>
                  <td><i className="bi bi-geo-alt me-1 text-danger" />{v.location || 'Douala'}</td>
                  <td>
                    {v.status === 'in_use' ? (
                      <Badge variant="success">En mission</Badge>
                    ) : v.status === 'available' ? (
                      <Badge variant="info">Disponible</Badge>
                    ) : (
                      <Badge variant="warning">En révision</Badge>
                    )}
                  </td>
                  <td className="text-end">
                    <Button variant="outline" size="sm" icon="bi-eye">
                      Voir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ClientVehiclesPage;
