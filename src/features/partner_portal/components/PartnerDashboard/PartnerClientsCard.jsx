/**
 * Navix Partner Portal — PartnerClientsCard
 * --------------------------------------------------------------------------
 * Top clients de l'entreprise partenaire (CA en FCFA, nombre de missions).
 * Lien « Voir tous les clients » → /partner/clients.
 */
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { formatNumber } from '@/utils/format';
import { ROUTES } from '@/routes/route.constants';

const PartnerClientsCard = ({ clients = [], loading = false }) => {
  return (
    <Card
      className="h-100"
      title={
        <span className="d-flex align-items-center gap-2">
          <i className="bi bi-people text-success" aria-hidden="true" />
          <span>Clients partenaires</span>
          <span className="badge bg-success-subtle text-success ms-1">{clients.length}</span>
        </span>
      }
      footer={
        <Link to={ROUTES.PARTNER_CLIENTS} className="btn btn-sm btn-outline-secondary w-100">
          Voir tous les clients
          <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
        </Link>
      }
    >
      {loading ? (
        <div className="placeholder-glow">
          <div className="placeholder col-12 rounded mb-2" style={{ height: 44 }} />
          <div className="placeholder col-12 rounded mb-2" style={{ height: 44 }} />
        </div>
      ) : clients.length === 0 ? (
        <p className="text-secondary mb-0 py-3 text-center">Aucun client partenaire.</p>
      ) : (
        <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
          {clients.slice(0, 4).map((client) => (
            <li key={client.id} className="d-flex align-items-center justify-content-between gap-2 p-2 border rounded">
              <div className="d-flex flex-column gap-1 overflow-hidden">
                <span className="small fw-semibold text-truncate">{client.name}</span>
                <span className="small text-muted text-truncate">
                  <i className="bi bi-geo-alt me-1" aria-hidden="true" />
                  {client.city} · {client.missionsCount} mission{client.missionsCount > 1 ? 's' : ''}
                </span>
              </div>
              <span className="small fw-semibold text-body-emphasis text-nowrap">
                {formatNumber(client.revenue)} FCFA
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default PartnerClientsCard;
