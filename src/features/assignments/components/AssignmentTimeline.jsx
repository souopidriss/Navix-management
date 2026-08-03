/**
 * Navix Assignments — AssignmentTimeline
 * --------------------------------------------------------------------------
 * Frise chronologique d'une affectation (page de détail) : création, début,
 * modification, fin et validation.
 *
 * Props :
 *   assignment : affectation à afficher
 */
import { formatAssignmentLongDate } from '../constants';
import './AssignmentTimeline.css';

const getStep = (item) => {
  const steps = {
    created: { icon: 'bi-plus-circle', label: 'Affectation créée', variant: 'navix-timeline__item--info' },
    started: { icon: 'bi-play-circle', label: 'Début de l’affectation', variant: 'navix-timeline__item--success' },
    updated: { icon: 'bi-pencil-square', label: 'Affectation modifiée', variant: 'navix-timeline__item--secondary' },
    ended: { icon: 'bi-flag', label: 'Fin de l’affectation', variant: 'navix-timeline__item--dark' },
    validated: { icon: 'bi-shield-check', label: 'Affectation validée', variant: 'navix-timeline__item--primary' },
  };

  return steps[item.type] ?? { icon: 'bi-circle', label: item.type, variant: 'navix-timeline__item--secondary' };
};

const AssignmentTimeline = ({ assignment }) => {
  const items = [];

  if (assignment.createdAt) {
    items.push({ type: 'created', date: assignment.createdAt });
  }
  if (assignment.startDate) {
    items.push({ type: 'started', date: assignment.startDate });
  }
  if (assignment.updatedAt && assignment.updatedAt !== assignment.createdAt) {
    items.push({ type: 'updated', date: assignment.updatedAt });
  }
  if (assignment.endDate) {
    items.push({ type: 'ended', date: assignment.endDate });
  }
  if (assignment.validatedBy) {
    items.push({ type: 'validated', date: assignment.endDate ?? assignment.updatedAt, by: assignment.validatedBy });
  }

  return (
    <ol className="navix-timeline">
      {items.map((item) => {
        const step = getStep(item);
        return (
          <li key={item.type} className={`navix-timeline__item ${step.variant}`}>
            <span className="navix-timeline__marker" aria-hidden="true">
              <i className={`bi ${step.icon}`} />
            </span>
            <div className="navix-timeline__body">
              <p className="navix-timeline__label mb-0">{step.label}</p>
              <time className="navix-timeline__date">{formatAssignmentLongDate(item.date)}</time>
              {item.by && <p className="navix-timeline__by mb-0">par {item.by}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default AssignmentTimeline;
