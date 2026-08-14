/**
 * Navix Client — ClientRequestsPage
 * --------------------------------------------------------------------------
 * Page "Mes demandes" (Réservations, ajouts de véhicules, chauffeurs VIP).
 */
import { Helmet } from 'react-helmet-async';
import { Card, Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/core';
import { formatCurrency, formatDate } from '@/utils/format';
import { MOCK_CLIENT_REQUESTS } from '../mocks/client.mock';
import { REQUEST_STATUSES } from '../constants/client.constants';

const ClientRequestsPage = () => {
  return (
    <div>
      <Helmet>
        <title>Mes Demandes — Navix Client</title>
      </Helmet>

      <PageHeader
        title="Mes Demandes & Réservations"
        subtitle="Historique et suivi du traitement de vos demandes de transport et mise à disposition."
        icon="bi-clipboard-plus"
        breadcrumbs={[{ label: 'Client', to: '/client/dashboard' }, { label: 'Mes demandes' }]}
        actions={
          <Button variant="primary" size="sm" icon="bi-plus-circle">
            Créer une nouvelle demande
          </Button>
        }
      />

      <Card>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Intitulé de la demande</th>
                <th>Trajet / Ville</th>
                <th>Dates</th>
                <th>Coût Estimé</th>
                <th>Statut</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CLIENT_REQUESTS.map((req) => {
                const statusMeta = REQUEST_STATUSES[req.status.toUpperCase()] || REQUEST_STATUSES.PENDING;
                return (
                  <tr key={req.id}>
                    <td className="fw-mono font-monospace">{req.id}</td>
                    <td className="fw-semibold">{req.title}</td>
                    <td>
                      <i className="bi bi-arrow-right-circle me-1 text-primary" />
                      {req.departureCity} → {req.destinationCity}
                    </td>
                    <td>
                      {formatDate(req.departureDate)} - {formatDate(req.returnDate)}
                    </td>
                    <td className="fw-bold text-success">{formatCurrency(req.estimatedCost, 'XAF')}</td>
                    <td>
                      <Badge variant={statusMeta.variant}>
                        <i className={`bi ${statusMeta.icon} me-1`} />
                        {statusMeta.label}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <Button variant="outline" size="sm" icon="bi-eye">
                        Suivi
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ClientRequestsPage;
