/**
 * Navix Audit — AuditTimeline
 * --------------------------------------------------------------------------
 * Chronologie lisible du journal : les entrées sont groupées par jour
 * (séparateurs) puis rendues avec la Timeline générique de Core UI (icône
 * de l'action, statut coloré, description, acteur et horodatage).
 *
 * Props :
 *   logs  : entrées d'audit (triées du plus récent au plus ancien)
 *   limit : nombre maximal d'entrées affichées (défaut : 50)
 */
import Timeline from '@/components/core/Timeline';
import {
  formatAuditDate,
  formatAuditDateTime,
  getAuditAction,
  getAuditStatus,
} from '../constants';
import './AuditTimeline.css';

const AuditTimeline = ({ logs = [], limit = 50 }) => {
  const visible = logs.slice(0, limit);

  const days = [];
  visible.forEach((log) => {
    const day = log.createdAt.slice(0, 10);
    const current = days[days.length - 1];
    if (!current || current.date !== day) {
      days.push({ date: day, label: formatAuditDate(day), logs: [] });
    }
    days[days.length - 1].logs.push(log);
  });

  return (
    <div className="navix-audit-timeline">
      {days.map((day) => (
        <section key={day.date} className="navix-audit-timeline__day">
          <header className="navix-audit-timeline__day-head">
            <i className="bi bi-calendar3" aria-hidden="true" />
            <h2 className="navix-audit-timeline__day-title">{day.label}</h2>
            <span className="navix-audit-timeline__day-count">
              {day.logs.length} action{day.logs.length > 1 ? 's' : ''}
            </span>
          </header>
          <Timeline
            items={day.logs.map((log) => {
              const action = getAuditAction(log.action);
              const status = getAuditStatus(log.status);
              return {
                id: log.id,
                title: `${action.label} — ${log.resourceName}`,
                description: `${log.description} · ${log.userName}`,
                date: formatAuditDateTime(log.createdAt),
                icon: action.icon,
                variant: status.variant,
              };
            })}
          />
        </section>
      ))}
    </div>
  );
};

export default AuditTimeline;
