/**
 * Navix Assignments — AssignmentCard
 * --------------------------------------------------------------------------
 * Carte d'une affectation (affichage tablette/mobile) : numéro, statut,
 * chauffeur, véhicule, entreprise, type, dates et actions.
 *
 * Props :
 *   assignment : affectation à afficher
 *   companyName : nom de l'entreprise
 *   driverName  : nom complet du chauffeur
 *   vehicleLabel: libellé du véhicule (immatriculation ou marque/modèle)
 *   onView      : (id: string) => void
 *   onEdit      : (id: string) => void
 *   onFinish    : (assignment: object) => void
 *   onDelete    : (assignment: object) => void
 */
import { Badge, Button } from '@/components/ui';
import AssignmentStatusBadge from './AssignmentStatusBadge';
import { getAssignmentType, formatAssignmentDate } from '../constants';
import './AssignmentCard.css';

const AssignmentCard = ({
  assignment,
  companyName = '—',
  driverName = '—',
  vehicleLabel = '—',
  onView,
  onEdit,
  onFinish,
  onDelete,
}) => {
  const type = getAssignmentType(assignment.assignmentType);

  return (
    <article className="card h-100 navix-assignment-card">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between gap-2">
          <div className="min-w-0">
            <h2 className="navix-assignment-card__name">
              <button type="button" className="navix-assignment-card__link" onClick={() => onView(assignment.id)}>
                {assignment.assignmentNumber}
              </button>
            </h2>
            <p className="navix-assignment-card__driver mb-0">{driverName}</p>
          </div>
          <AssignmentStatusBadge status={assignment.status} />
        </div>

        <div className="navix-assignment-card__tags">
          <Badge variant={type.variant} soft>
            {type.label}
          </Badge>
        </div>

        <dl className="navix-assignment-card__meta">
          <div>
            <dt>
              <i className="bi bi-truck" aria-hidden="true" /> Véhicule
            </dt>
            <dd>{vehicleLabel}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-buildings" aria-hidden="true" /> Entreprise
            </dt>
            <dd>{companyName}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-calendar-plus" aria-hidden="true" /> Début
            </dt>
            <dd>{formatAssignmentDate(assignment.startDate)}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-calendar-check" aria-hidden="true" /> Fin prévue
            </dt>
            <dd>{formatAssignmentDate(assignment.expectedEndDate)}</dd>
          </div>
        </dl>
      </div>

      <div className="card-footer d-flex justify-content-end gap-1">
        <Button variant="ghost" size="sm" icon="bi-eye" onClick={() => onView(assignment.id)} title="Voir le détail" aria-label={`Voir le détail de ${assignment.assignmentNumber}`} />
        <Button variant="ghost" size="sm" icon="bi-pencil" onClick={() => onEdit(assignment.id)} title="Modifier" aria-label={`Modifier ${assignment.assignmentNumber}`} />
        {onFinish && assignment.status === 'active' && (
          <Button variant="ghost" size="sm" icon="bi-check2-circle" onClick={() => onFinish(assignment)} title="Terminer l’affectation" aria-label={`Terminer ${assignment.assignmentNumber}`} />
        )}
        <Button variant="ghost" size="sm" icon="bi-trash3" onClick={() => onDelete(assignment)} title="Supprimer" aria-label={`Supprimer ${assignment.assignmentNumber}`} />
      </div>
    </article>
  );
};

export default AssignmentCard;
