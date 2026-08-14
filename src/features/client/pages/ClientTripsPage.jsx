/**
 * Navix Client — ClientTripsPage
 * --------------------------------------------------------------------------
 * Page "Mes trajets" pour le suivi des déplacements réalisés ou planifiés.
 */
import { Helmet } from 'react-helmet-async';
import { Card, Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/core';
import { formatDate } from '@/utils/format';
import { MOCK_TRIPS } from '@/features/trips/mocks';

const ClientTripsPage = () => {
  const trips = MOCK_TRIPS.slice(0, 6);

  return (
    <div>
      <Helmet>
        <title>Mes Trajets — Navix Client</title>
      </Helmet>

      <PageHeader
        title="Suivi de vos Trajets"
        subtitle="Historique des missions de transport et déplacements effectués au Cameroun 🇨🇲."
        icon="bi-signpost-split"
        breadcrumbs={[{ label: 'Client', to: '/client/dashboard' }, { label: 'Mes trajets' }]}
      />

      <Card>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Code Trajet</th>
                <th>Départ → Arrivée</th>
                <th>Distance (km)</th>
                <th>Date</th>
                <th>Statut</th>
                <th className="text-end">Détails</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t.id}>
                  <td className="fw-mono font-monospace">{t.code || 'TRP-0042'}</td>
                  <td className="fw-semibold">
                    {t.departureLocation || 'Douala'} → {t.arrivalLocation || 'Yaoundé'}
                  </td>
                  <td>{t.actualDistance || t.plannedDistance || 240} km</td>
                  <td>{formatDate(t.departureDate)}</td>
                  <td>
                    {t.status === 'completed' ? (
                      <Badge variant="success">Terminé</Badge>
                    ) : t.status === 'in_progress' ? (
                      <Badge variant="primary">En cours</Badge>
                    ) : (
                      <Badge variant="warning">Planifié</Badge>
                    )}
                  </td>
                  <td className="text-end">
                    <Button variant="outline" size="sm" icon="bi-info-circle">
                      Fiche
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

export default ClientTripsPage;
