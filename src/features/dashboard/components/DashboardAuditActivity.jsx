/**
 * Navix Dashboard — DashboardAuditActivity
 * --------------------------------------------------------------------------
 * Carte « Journal des actions » du tableau de bord : dernières entrées du
 * journal (portée entreprise), compteurs critiques / échecs et accès au
 * journal complet. Masquée pour les profils sans `audit.view`.
 *
 * Props :
 *   limit : nombre d'entrées affichées (défaut : 5)
 */
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card } from '@/components/ui';
import { ROUTES, auditLogDetailPath } from '@/routes/route.constants';
import { useDashboardAudit } from '../hooks';
import { formatAuditDateTime, getAuditAction } from '@/features/audit/constants';
import './DashboardAuditActivity.css';

const DashboardAuditActivity = ({ limit = 5 }) => {
  const navigate = useNavigate();
  const { recent, critical, failed, total, isLoading, canView } = useDashboardAudit(limit);

  if (!canView) return null;

  return (
    <Card
      className="h-100 navix-dashboard-audit"
      flush
      title={
        <span>
          <i className="bi bi-journal-text me-2" aria-hidden="true" />
          Journal des actions
        </span>
      }
    >
      {isLoading && recent.length === 0 ? (
        <div className="navix-dashboard-audit__empty">
          Chargement du journal…
        </div>
      ) : recent.length === 0 ? (
        <div className="navix-dashboard-audit__empty">Aucune action enregistrée.</div>
      ) : (
        <>
          <ul className="list-unstyled navix-dashboard-audit__list mb-0">
            {recent.map((log) => {
              const action = getAuditAction(log.action);
              return (
                <li
                  key={log.id}
                  className="navix-dashboard-audit__item"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(auditLogDetailPath(log.id))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      navigate(auditLogDetailPath(log.id));
                    }
                  }}
                >
                  <span className="navix-dashboard-audit__icon" aria-hidden="true">
                    <i className={`bi ${action.icon}`} />
                  </span>
                  <div className="min-w-0">
                    <p className="navix-dashboard-audit__description mb-0">{log.description}</p>
                    <small className="text-muted">
                      {log.userName} · {formatAuditDateTime(log.createdAt)}
                    </small>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="navix-dashboard-audit__foot">
            <div className="d-flex gap-2">
              <Badge variant="danger" soft>
                {critical} critique{critical > 1 ? 's' : ''}
              </Badge>
              <Badge variant="warning" soft>
                {failed} échec{failed > 1 ? 's' : ''}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon="bi-box-arrow-up-right"
              onClick={() => navigate(ROUTES.AUDIT_LOGS)}
            >
              {total} entrées — tout voir
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default DashboardAuditActivity;
