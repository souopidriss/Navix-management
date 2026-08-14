/**
 * Navix Client — ClientNotificationsPage
 * --------------------------------------------------------------------------
 * Page de notifications de l'Espace Client.
 */
import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui';
import { PageHeader } from '@/components/core';

const MOCK_NOTIFS = [
  { id: 1, title: 'Validation de votre demande REQ-2026-002', text: 'Chauffeur VIP attribué pour le déplacement à Yaoundé Bastos.', time: 'Il y a 30 min', type: 'success' },
  { id: 2, title: 'Nouvelle facture disponible : FAC-2026-0814', text: 'La facture du mois d’août (14 500 000 FCFA) est disponible.', time: 'Il y a 2 heures', type: 'info' },
  { id: 3, title: 'Rappel d’entretien véhicule Toyota Hilux AB 3824 KL', text: 'Le véhicule entrera en révision au garage agréé Douala.', time: 'Hier', type: 'warning' },
];

const ClientNotificationsPage = () => {
  return (
    <div>
      <Helmet>
        <title>Notifications Client — Navix</title>
      </Helmet>

      <PageHeader
        title="Centre de Notifications Client"
        subtitle="Alertes et suivis en temps réel concernant vos services, trajets et factures."
        icon="bi-bell"
        breadcrumbs={[{ label: 'Client', to: '/client/dashboard' }, { label: 'Notifications' }]}
      />

      <Card>
        <div className="list-group list-group-flush">
          {MOCK_NOTIFS.map((n) => (
            <div key={n.id} className="list-group-item px-0 py-3 border-bottom">
              <div className="d-flex align-items-start gap-3">
                <span className={`p-2 rounded-circle bg-${n.type}-subtle text-${n.type} fs-5`}>
                  <i className="bi bi-bell-fill" />
                </span>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between">
                    <h6 className="mb-1 fw-bold">{n.title}</h6>
                    <small className="text-muted">{n.time}</small>
                  </div>
                  <p className="mb-0 text-muted small">{n.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ClientNotificationsPage;
