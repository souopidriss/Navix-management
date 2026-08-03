/**
 * Navix Drivers — DriverTable
 * --------------------------------------------------------------------------
 * Tableau des chauffeurs (affichage desktop) : photo, nom, code employé,
 * téléphone, permis, entreprise, disponibilité, statut, expiration du permis
 * et actions.
 *
 * Props :
 *   drivers      : liste des chauffeurs à afficher (filtrée/triée/paginée)
 *   companyById  : carte { id → { name } } des entreprises
 *   agencyById   : carte { id → { name } } des agences
 *   onView       : (id: string) => void
 *   onEdit       : (id: string) => void
 *   onDelete     : (driver: object) => void
 */
import { Badge, Button } from '@/components/ui';
import DriverAvatar from './DriverAvatar';
import DriverStatusBadge from './DriverStatusBadge';
import DriverLicenseBadge from './DriverLicenseBadge';
import { getDriverAvailability, formatDriverDate, getExpiryStatus } from '../constants';
import './DriverTable.css';

const DriverTable = ({ drivers = [], companyById = {}, agencyById = {}, onView, onEdit, onDelete }) => (
  <div className="table-responsive">
    <table className="table table-hover align-middle mb-0 navix-driver-table">
      <thead>
        <tr>
          <th scope="col" className="navix-driver-table__photo">
            <span className="visually-hidden">Photo</span>
          </th>
          <th scope="col">Nom</th>
          <th scope="col">Code</th>
          <th scope="col">Téléphone</th>
          <th scope="col">Permis</th>
          <th scope="col">Entreprise</th>
          <th scope="col">Disponibilité</th>
          <th scope="col">Statut</th>
          <th scope="col">Expiration permis</th>
          <th scope="col" className="text-end">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {drivers.map((driver) => {
          const expiry = getExpiryStatus(driver.licenseExpiryDate);
          const availability = getDriverAvailability(driver.availability);
          const companyName = companyById[driver.companyId]?.name ?? '—';
          const agencyName = agencyById[driver.agencyId]?.name ?? '—';

          return (
            <tr key={driver.id}>
              <td className="navix-driver-table__photo">
                <DriverAvatar src={driver.photo} fullName={driver.fullName} size="sm" />
              </td>
              <td>
                <button
                  type="button"
                  className="navix-driver-table__name"
                  onClick={() => onView(driver.id)}
                  title={`Voir ${driver.fullName}`}
                >
                  {driver.fullName}
                </button>
              </td>
              <td className="navix-driver-table__code">{driver.employeeCode}</td>
              <td className="navix-driver-table__phone">{driver.phone}</td>
              <td>
                <DriverLicenseBadge category={driver.licenseCategory} />
              </td>
              <td className="navix-driver-table__company">
                {companyName}
                <span className="navix-driver-table__agency">{agencyName}</span>
              </td>
              <td>
                <Badge variant={availability.variant} soft dot={false}>
                  {availability.label}
                </Badge>
              </td>
              <td>
                <DriverStatusBadge status={driver.status} />
              </td>
              <td className="navix-driver-table__expiry">
                <span className={`navix-driver-table__expiry-date navix-driver-table__expiry-date--${expiry.variant}`}>
                  {formatDriverDate(driver.licenseExpiryDate)}
                </span>
                {expiry.variant !== 'success' && expiry.variant !== 'secondary' && (
                  <span className={`navix-driver-table__expiry-tag navix-driver-table__expiry-tag--${expiry.variant}`}>
                    {expiry.label}
                  </span>
                )}
              </td>
              <td>
                <div className="d-flex justify-content-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="bi-eye"
                    onClick={() => onView(driver.id)}
                    title="Voir le détail"
                    aria-label={`Voir le détail de ${driver.fullName}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="bi-pencil"
                    onClick={() => onEdit(driver.id)}
                    title="Modifier"
                    aria-label={`Modifier ${driver.fullName}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="bi-trash3"
                    onClick={() => onDelete(driver)}
                    title="Supprimer"
                    aria-label={`Supprimer ${driver.fullName}`}
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

export default DriverTable;
