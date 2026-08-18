/**
 * Navix Partner Portal — PartnerClientActivity (PROMPT 065)
 * --------------------------------------------------------------------------
 * Activité d'un client partenaire : missions réelles du module Missions
 * (PROMPT 064) reliées via `missionClients` — jamais dupliquées. Chaque
 * ligne redirige vers le détail de la mission. Aucune finance (wallet /
 * ledger) : uniquement les prestations et leur montant FCFA informatif.
 */
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { EmptyState, StatusBadge } from '@/components/core';
import { partnerMissionDetailPath, ROUTES } from '@/routes/route.constants';
import { formatDate, formatNumber } from '@/utils/format';
import { FCFA_LABEL, getPartnerMissionStatus } from '../../constants/partner.constants';

const PartnerClientActivity = ({ missions = [], loading = false }) => {
  const navigate = useNavigate();

  return (
    <div className="navix-card p-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <h2 className="h6 fw-bold mb-0 d-flex align-items-center gap-2">
          <i className="bi bi-signpost-split text-primary" aria-hidden="true" />
          Missions récentes
        </h2>
        <span className="text-secondary small tabular-nums">{missions.length} mission{missions.length > 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="text-secondary small">Chargement de l’activité…</div>
      ) : missions.length === 0 ? (
        <EmptyState
          compact
          icon="bi-signpost"
          title="Aucune mission"
          description="Aucune prestation n’est encore rattachée à ce client."
        />
      ) : (
        <div className="d-flex flex-column gap-2">
          {missions.map((mission) => {
            const status = getPartnerMissionStatus(mission.status);
            return (
              <button
                key={mission.id}
                type="button"
                className="navix-pcli-refbtn w-100"
                onClick={() => navigate(partnerMissionDetailPath(mission.id))}
                title={`Voir ${mission.reference}`}
              >
                <span className="navix-pcli-icon" aria-hidden="true">
                  <i className="bi bi-signpost-split" />
                </span>
                <span className="text-start flex-grow-1" style={{ minWidth: 0 }}>
                  <span className="fw-semibold font-monospace d-block">{mission.reference}</span>
                  <span className="text-secondary d-block text-truncate" style={{ maxWidth: '100%' }}>
                    {mission.title}
                  </span>
                  <small className="text-secondary d-block">
                    {formatDate(mission.startDate)} → {formatDate(mission.endDate)}
                  </small>
                </span>
                <span className="text-end flex-shrink-0">
                  <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />
                  <span className="tabular-nums fw-semibold d-block mt-1">
                    {formatNumber(mission.amount)} {FCFA_LABEL}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {missions.length > 0 && (
        <div className="mt-3 pt-3 border-top border-secondary-subtle d-flex justify-content-end">
          <Button variant="ghost" size="sm" icon="bi-arrow-right" onClick={() => navigate(ROUTES.PARTNER_MISSIONS)}>
            Toutes les missions
          </Button>
        </div>
      )}
    </div>
  );
};

export default PartnerClientActivity;
