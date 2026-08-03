/**
 * Navix Assignments — AssignmentHistoryTable
 * --------------------------------------------------------------------------
 * Tableau de l'historique des affectations (terminées / annulées) : numéro,
 * chauffeur, véhicule, entreprise, début, fin réelle, durée et statut.
 *
 * Props :
 *   items      : liste des affectations passées à afficher
 *   companyById : carte { id → { name } } des entreprises
 *   driverById  : carte { id → { fullName } } des chauffeurs
 *   vehicleById : carte { id → { registrationNumber, brand, model } } des véhicules
 *   onView      : (id: string) => void
 */
import { Badge, Button } from '@/components/ui';
import AssignmentStatusBadge from './AssignmentStatusBadge';
import { formatAssignmentDate, formatAssignmentDuration } from '../constants';
import './AssignmentHistoryTable.css';

const AssignmentHistoryTable = ({ items = [], companyById = {}, driverById = {}, vehicleById = {}, onView }) => (
  <div className="table-responsive">
    <table className="table table-hover align-middle mb-0 navix-assignment-history-table">
      <thead>
        <tr>
          <th scope="col">N°</th>
          <th scope="col">Chauffeur</th>
          <th scope="col">Véhicule</th>
          <th scope="col">Entreprise</th>
          <th scope="col">Début</th>
          <th scope="col">Fin</th>
          <th scope="col">Durée</th>
          <th scope="col">Statut</th>
          <th scope="col" className="text-end">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const vehicle = vehicleById[item.vehicleId] ?? {};
          const vehicleLabel = vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim();

          return (
            <tr key={item.id}>
              <td className="navix-assignment-history-table__number">
                <button
                  type="button"
                  className="navix-assignment-history-table__link"
                  onClick={() => onView(item.id)}
                  title={`Voir ${item.assignmentNumber}`}
                >
                  {item.assignmentNumber}
                </button>
              </td>
              <td className="navix-assignment-history-table__driver">
                {driverById[item.driverId]?.fullName ?? '—'}
              </td>
              <td className="navix-assignment-history-table__vehicle">
                {vehicleLabel || '—'}
                {vehicle.brand && vehicle.model && (
                  <span className="navix-assignment-history-table__vehicle-sub">
                    {vehicle.brand} {vehicle.model}
                  </span>
                )}
              </td>
              <td className="navix-assignment-history-table__company">
                {companyById[item.companyId]?.name ?? '—'}
              </td>
              <td className="navix-assignment-history-table__date">
                {formatAssignmentDate(item.startDate)}
              </td>
              <td className="navix-assignment-history-table__date">
                {formatAssignmentDate(item.endDate)}
              </td>
              <td>
                <Badge variant="light">{formatAssignmentDuration(item.startDate, item.endDate)}</Badge>
              </td>
              <td>
                <AssignmentStatusBadge status={item.status} />
              </td>
              <td className="text-end">
                <Button
                  variant="ghost"
                  size="sm"
                  icon="bi-eye"
                  onClick={() => onView(item.id)}
                  title="Voir le détail"
                  aria-label={`Voir le détail de ${item.assignmentNumber}`}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default AssignmentHistoryTable;
