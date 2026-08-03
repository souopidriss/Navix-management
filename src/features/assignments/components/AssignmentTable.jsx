/**
 * Navix Assignments — AssignmentTable
 * --------------------------------------------------------------------------
 * Tableau des affectations (affichage desktop) : numéro, chauffeur, véhicule,
 * entreprise, type, début, fin prévue, statut et actions (voir, modifier,
 * terminer, supprimer).
 *
 * Props :
 *   assignments : liste des affectations à afficher (filtrée/triée/paginée)
 *   companyById : carte { id → { name } } des entreprises
 *   driverById  : carte { id → { fullName } } des chauffeurs
 *   vehicleById : carte { id → { registrationNumber, brand, model } } des véhicules
 *   onView      : (id: string) => void
 *   onEdit      : (id: string) => void
 *   onFinish    : (assignment: object) => void
 *   onDelete    : (assignment: object) => void
 */
import { Badge, Button } from '@/components/ui';
import AssignmentStatusBadge from './AssignmentStatusBadge';
import { getAssignmentType, formatAssignmentDate } from '../constants';
import './AssignmentTable.css';

const AssignmentTable = ({
  assignments = [],
  companyById = {},
  driverById = {},
  vehicleById = {},
  onView,
  onEdit,
  onFinish,
  onDelete,
}) => (
  <div className="table-responsive">
    <table className="table table-hover align-middle mb-0 navix-assignment-table">
      <thead>
        <tr>
          <th scope="col">N°</th>
          <th scope="col">Chauffeur</th>
          <th scope="col">Véhicule</th>
          <th scope="col">Entreprise</th>
          <th scope="col">Type</th>
          <th scope="col">Début</th>
          <th scope="col">Fin prévue</th>
          <th scope="col">Statut</th>
          <th scope="col" className="text-end">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {assignments.map((assignment) => {
          const type = getAssignmentType(assignment.assignmentType);
          const vehicle = vehicleById[assignment.vehicleId] ?? {};
          const vehicleLabel = vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim();

          return (
            <tr key={assignment.id}>
              <td className="navix-assignment-table__number">
                <button
                  type="button"
                  className="navix-assignment-table__link"
                  onClick={() => onView(assignment.id)}
                  title={`Voir ${assignment.assignmentNumber}`}
                >
                  {assignment.assignmentNumber}
                </button>
              </td>
              <td className="navix-assignment-table__driver">
                {driverById[assignment.driverId]?.fullName ?? '—'}
              </td>
              <td className="navix-assignment-table__vehicle">
                {vehicleLabel || '—'}
                {vehicle.brand && vehicle.model && (
                  <span className="navix-assignment-table__vehicle-sub">
                    {vehicle.brand} {vehicle.model}
                  </span>
                )}
              </td>
              <td className="navix-assignment-table__company">
                {companyById[assignment.companyId]?.name ?? '—'}
              </td>
              <td>
                <Badge variant={type.variant} soft>
                  {type.label}
                </Badge>
              </td>
              <td className="navix-assignment-table__date">{formatAssignmentDate(assignment.startDate)}</td>
              <td className="navix-assignment-table__date">
                {formatAssignmentDate(assignment.expectedEndDate)}
              </td>
              <td>
                <AssignmentStatusBadge status={assignment.status} />
              </td>
              <td>
                <div className="d-flex justify-content-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="bi-eye"
                    onClick={() => onView(assignment.id)}
                    title="Voir le détail"
                    aria-label={`Voir le détail de ${assignment.assignmentNumber}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="bi-pencil"
                    onClick={() => onEdit(assignment.id)}
                    title="Modifier"
                    aria-label={`Modifier ${assignment.assignmentNumber}`}
                  />
                  {onFinish && assignment.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="bi-check2-circle"
                      onClick={() => onFinish(assignment)}
                      title="Terminer l’affectation"
                      aria-label={`Terminer ${assignment.assignmentNumber}`}
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="bi-trash3"
                    onClick={() => onDelete(assignment)}
                    title="Supprimer"
                    aria-label={`Supprimer ${assignment.assignmentNumber}`}
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default AssignmentTable;
