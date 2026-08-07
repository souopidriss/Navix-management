/**
 * Navix Audit — AuditGroupedList
 * --------------------------------------------------------------------------
 * Vue « Regroupé » du journal : sections (date, utilisateur, module, action,
 * ressource ou sévérité) avec nombre d'entrées et liste condensée. Chaque
 * entrée ouvre son détail (lecture seule).
 *
 * Props :
 *   groups : [{ key, label, count, items }] — résultat de groupAuditLogs
 *   onView : (log) => void
 */
import { Button, Card } from '@/components/ui';
import { formatAuditDateTime } from '../constants';
import AuditActionBadge from './AuditActionBadge';
import AuditStatusBadge from './AuditStatusBadge';
import AuditSeverityBadge from './AuditSeverityBadge';
import './AuditGroupedList.css';

const AuditGroupedList = ({ groups = [], onView }) => (
  <div className="navix-audit-groups">
    {groups.map((group) => (
      <Card key={group.key} className="navix-audit-groups__group" padding="lg">
        <header className="navix-audit-groups__head">
          <h2 className="navix-audit-groups__title">{group.label}</h2>
          <span className="navix-audit-groups__count">
            {group.count} action{group.count > 1 ? 's' : ''}
          </span>
        </header>
        <ul className="list-unstyled navix-audit-groups__list mb-0">
          {group.items.map((log) => (
            <li key={log.id} className="navix-audit-groups__item">
              <div className="navix-audit-groups__badges">
                <AuditActionBadge action={log.action} />
                <AuditStatusBadge status={log.status} />
                <AuditSeverityBadge severity={log.severity} />
              </div>
              <div className="navix-audit-groups__body">
                <p className="navix-audit-groups__description mb-1">{log.description}</p>
                <div className="navix-audit-groups__meta">
                  <span>
                    <i className="bi bi-person me-1" aria-hidden="true" />
                    {log.userName}
                  </span>
                  {log.companyName && (
                    <span>
                      <i className="bi bi-buildings me-1" aria-hidden="true" />
                      {log.companyName}
                    </span>
                  )}
                  <time dateTime={log.createdAt}>
                    <i className="bi bi-clock me-1" aria-hidden="true" />
                    {formatAuditDateTime(log.createdAt)}
                  </time>
                </div>
              </div>
              <Button variant="ghost" size="sm" icon="bi-eye" onClick={() => onView?.(log)}>
                Détails
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    ))}
  </div>
);

export default AuditGroupedList;
