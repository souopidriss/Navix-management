/**
 * Navix Partner Portal — PartnerMissionsCard
 * --------------------------------------------------------------------------
 * Missions partenaire récentes / en cours : référence, titre, client,
 * véhicule, chauffeur et statut. Lien « Voir toutes les missions » →
 * /partner/missions.
 */
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { StatusBadge } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { getPartnerMissionStatus } from '../../constants/partner.constants';

const PartnerMissionsCard = ({ missions = [], loading = false }) => {
  return (
    <Card
      className="h-100"
      title={
        <span className="d-flex align-items-center gap-2">
          <i className="bi bi-signpost-split text-primary" aria-hidden="true" />
          <span>Missions récentes</span>
          <span className="badge bg-primary-subtle text-primary ms-1">{missions.length}</span>
        </span>
      }
      footer={
        <Link to={ROUTES.PARTNER_MISSIONS} className="btn btn-sm btn-outline-secondary w-100">
          Voir toutes les missions
          <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
        </Link>
      }
    >
      {loading ? (
        <div className="placeholder-glow">
          <div className="placeholder col-12 rounded mb-2" style={{ height: 44 }} />
          <div className="placeholder col-12 rounded mb-2" style={{ height: 44 }} />
          <div className="placeholder col-12 rounded" style={{ height: 44 }} />
        </div>
      ) : missions.length === 0 ? (
        <p className="text-secondary mb-0 py-3 text-center">Aucune mission pour le moment.</p>
      ) : (
        <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
          {missions.slice(0, 5).map((mission) => {
            const status = getPartnerMissionStatus(mission.status);
            return (
              <li key={mission.id} className="d-flex align-items-center justify-content-between gap-2 p-2 border rounded">
                <div className="d-flex flex-column gap-1 overflow-hidden">
                  <span className="small fw-semibold text-truncate">{mission.title}</span>
                  <span className="small text-muted text-truncate">
                    <i className="bi bi-building me-1" aria-hidden="true" />
                    {mission.client}
                    {mission.vehicle && (
                      <>
                        {' '}· <i className="bi bi-truck me-1" aria-hidden="true" />
                        {mission.vehicle}
                      </>
                    )}
                  </span>
                </div>
                <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default PartnerMissionsCard;
