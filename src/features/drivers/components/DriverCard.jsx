/**
 * Navix Drivers — DriverCard
 * --------------------------------------------------------------------------
 * Carte d'un chauffeur (affichage tablette/mobile) : photo, nom complet,
 * code employé, statut, entreprise, agence, téléphone, permis et expiration
 * du permis.
 *
 * Props :
 *   driver      : chauffeur à afficher
 *   companyName : nom de l'entreprise
 *   agencyName  : nom de l'agence
 *   onView      : (id: string) => void
 *   onEdit      : (id: string) => void
 *   onDelete    : (driver: object) => void
 */
import { Badge, Button } from '@/components/ui';
import DriverAvatar from './DriverAvatar';
import DriverStatusBadge from './DriverStatusBadge';
import DriverLicenseBadge from './DriverLicenseBadge';
import { getDriverAvailability, formatDriverDate, getExpiryStatus } from '../constants';
import './DriverCard.css';

const DriverCard = ({ driver, companyName = '—', agencyName = '—', onView, onEdit, onDelete }) => {
  const expiry = getExpiryStatus(driver.licenseExpiryDate);
  const availability = getDriverAvailability(driver.availability);

  return (
    <article className="card h-100 navix-driver-card">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between gap-2">
          <div className="d-flex align-items-center gap-3 min-w-0">
            <DriverAvatar src={driver.photo} fullName={driver.fullName} size="lg" />
            <div className="min-w-0">
              <h2 className="navix-driver-card__name">
                <button type="button" className="navix-driver-card__link" onClick={() => onView(driver.id)}>
                  {driver.fullName}
                </button>
              </h2>
              <p className="navix-driver-card__code mb-0">{driver.employeeCode}</p>
            </div>
          </div>
          <DriverStatusBadge status={driver.status} />
        </div>

        <div className="navix-driver-card__tags">
          <DriverLicenseBadge category={driver.licenseCategory} />
          <Badge variant={availability.variant} soft>
            {availability.label}
          </Badge>
        </div>

        <dl className="navix-driver-card__meta">
          <div>
            <dt>
              <i className="bi bi-buildings" aria-hidden="true" /> Entreprise
            </dt>
            <dd>{companyName}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-diagram-3" aria-hidden="true" /> Agence
            </dt>
            <dd>{agencyName}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-telephone" aria-hidden="true" /> Téléphone
            </dt>
            <dd>{driver.phone}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-file-earmark-text" aria-hidden="true" /> Permis
            </dt>
            <dd>{formatDriverDate(driver.licenseExpiryDate)}</dd>
          </div>
        </dl>

        {expiry.variant !== 'success' && expiry.variant !== 'secondary' && (
          <p className={`navix-driver-card__expiry navix-driver-card__expiry--${expiry.variant}`}>
            <i className="bi bi-exclamation-triangle" aria-hidden="true" /> Permis {expiry.label.toLowerCase()}
          </p>
        )}
      </div>

      <div className="card-footer d-flex justify-content-end gap-1">
        <Button variant="ghost" size="sm" icon="bi-eye" onClick={() => onView(driver.id)} title="Voir le détail" aria-label={`Voir le détail de ${driver.fullName}`} />
        <Button variant="ghost" size="sm" icon="bi-pencil" onClick={() => onEdit(driver.id)} title="Modifier" aria-label={`Modifier ${driver.fullName}`} />
        <Button variant="ghost" size="sm" icon="bi-trash3" onClick={() => onDelete(driver)} title="Supprimer" aria-label={`Supprimer ${driver.fullName}`} />
      </div>
    </article>
  );
};

export default DriverCard;
