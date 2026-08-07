/**
 * Navix Audit — AuditResourceActivity
 * --------------------------------------------------------------------------
 * Carte « Activité récente » d'une ressource métier (véhicule, chauffeur,
 * …) : dernières entrées du journal liées à cette ressource, avec lien vers
 * le détail de chaque entrée et vers le journal complet. Consommée par les
 * fiches de détail des modules (vehicles, drivers, …).
 *
 * Props :
 *   resourceType : type de ressource (vehicle, driver, …)
 *   resourceId   : identifiant de la ressource
 *   title        : titre de la carte (défaut : « Activité récente »)
 *   limit        : nombre d'entrées affichées (défaut : 5)
 *   className     : classes additionnelles
 */
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { ROUTES, auditLogDetailPath } from '@/routes/route.constants';
import { formatAuditDateTime, getAuditAction } from '../constants';
import { useResourceActivity } from '../hooks';
import './AuditResourceActivity.css';

const AuditResourceActivity = ({
  resourceType,
  resourceId,
  title = 'Activité récente',
  limit = 5,
  className,
}) => {
  const navigate = useNavigate();
  const { recent, total } = useResourceActivity({ resourceType, resourceId }, { limit });

  return (
    <Card
      className={`navix-audit-resource ${className || ''}`.trim()}
      padding="lg"
      title={
        <span>
          <i className="bi bi-journal-text me-2" aria-hidden="true" />
          {title}
        </span>
      }
    >
      {recent.length === 0 ? (
        <p className="navix-audit-resource__empty text-muted mb-0">
          Aucune action enregistrée pour cette ressource.
        </p>
      ) : (
        <>
          <ul className="list-unstyled navix-audit-resource__list mb-0">
            {recent.map((log) => {
              const action = getAuditAction(log.action);
              return (
                <li
                  key={log.id}
                  className="navix-audit-resource__item"
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
                  <span className="navix-audit-resource__icon" aria-hidden="true">
                    <i className={`bi ${action.icon}`} />
                  </span>
                  <div className="navix-audit-resource__body">
                    <p className="navix-audit-resource__action mb-0">
                      {action.label} — {log.description}
                    </p>
                    <time className="navix-audit-resource__meta" dateTime={log.createdAt}>
                      {formatAuditDateTime(log.createdAt)} · {log.userName}
                    </time>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="navix-audit-resource__foot">
            <span className="navix-audit-resource__total text-muted">
              {total} entrée{total > 1 ? 's' : ''} au total
            </span>
            <Button
              variant="ghost"
              size="sm"
              icon="bi-box-arrow-up-right"
              onClick={() => navigate(ROUTES.AUDIT_LOGS)}
            >
              Journal complet
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default AuditResourceActivity;
