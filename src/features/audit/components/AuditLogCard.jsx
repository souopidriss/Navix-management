/**
 * Navix Audit — AuditLogCard
 * --------------------------------------------------------------------------
 * Carte compacte d'une entrée du journal (vue mobile / tablette) : action,
 * ressource, description, utilisateur, entreprise, statut, sévérité et date.
 *
 * Props :
 *   log     : entrée du journal
 *   onView  : (log) => void
 */
import { Button, Card } from '@/components/ui';
import { formatAuditDateTime, getUser } from '../constants';
import AuditActionBadge from './AuditActionBadge';
import AuditResourceBadge from './AuditResourceBadge';
import AuditStatusBadge from './AuditStatusBadge';
import AuditSeverityBadge from './AuditSeverityBadge';
import './AuditLogCard.css';

const AuditLogCard = ({ log, onView }) => (
  <Card className="navix-audit-card" padding="md">
    <div className="navix-audit-card__head">
      <AuditActionBadge action={log.action} />
      <AuditStatusBadge status={log.status} />
    </div>

    <p className="navix-audit-card__description mb-0">{log.description}</p>

    <div className="navix-audit-card__resource">
      <AuditResourceBadge resourceType={log.resourceType} />
      <span className="navix-audit-card__resource-name">{log.resourceName}</span>
    </div>

    <div className="navix-audit-card__meta">
      <div className="navix-audit-card__meta-item">
        <i className="bi bi-person" aria-hidden="true" />
        <span>{log.userName}</span>
      </div>
      <div className="navix-audit-card__meta-item">
        <i className="bi bi-buildings" aria-hidden="true" />
        <span>{log.companyName ?? '—'}</span>
      </div>
      {log.agencyName && (
        <div className="navix-audit-card__meta-item">
          <i className="bi bi-diagram-3" aria-hidden="true" />
          <span>{log.agencyName}</span>
        </div>
      )}
    </div>

    <div className="navix-audit-card__foot">
      <div className="navix-audit-card__badges">
        <AuditSeverityBadge severity={log.severity} />
        <span className="navix-audit-card__role">{getUser(log.userId).role ?? '—'}</span>
      </div>
      <time className="navix-audit-card__date" dateTime={log.createdAt}>
        {formatAuditDateTime(log.createdAt)}
      </time>
    </div>

    <div className="navix-audit-card__actions">
      <Button variant="outline" size="sm" icon="bi-eye" fullWidth onClick={() => onView?.(log)}>
        Détails
      </Button>
    </div>
  </Card>
);

export default AuditLogCard;
