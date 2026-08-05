/**
 * Navix Agencies — AgencyDrivers
 * --------------------------------------------------------------------------
 * Liste des chauffeurs rattachés à une agence : identité, code employé,
 * téléphone, catégorie de permis, statut et disponibilité. Les badges
 * proviennent des constantes métier du module Chauffeurs.
 *
 * Props :
 *   drivers : liste des chauffeurs de l'agence
 *   onView  : (id: string) => void — ouvre le détail du chauffeur
 */
import { Badge, Button } from '@/components/ui';
import { EmptyState } from '@/components/core';
import {
  getDriverStatus,
  getDriverAvailability,
  getLicenseCategory,
} from '@/features/drivers';
import './AgencyDrivers.css';

const AgencyDrivers = ({ drivers = [], onView }) => (
  <div className="navix-agency-drivers">
    {drivers.length === 0 ? (
      <EmptyState
        compact
        icon="bi-person-badge"
        title="Aucun chauffeur"
        description="Aucun chauffeur n’est actuellement rattaché à cette agence."
      />
    ) : (
      <ul className="list-group list-group-flush navix-agency-drivers__list">
        {drivers.map((driver) => {
          const status = getDriverStatus(driver.status);
          const availability = getDriverAvailability(driver.availability);
          const license = getLicenseCategory(driver.licenseCategory);

          return (
            <li
              key={driver.id}
              className="list-group-item d-flex align-items-center gap-3 px-0 navix-agency-drivers__item"
            >
              <span className="navix-agency-drivers__icon" aria-hidden="true">
                <i className="bi bi-person-badge" />
              </span>
              <span className="flex-grow-1 min-w-0">
                <span className="navix-agency-drivers__main">{driver.fullName}</span>
                <span className="navix-agency-drivers__sub d-block">
                  {[driver.employeeCode, driver.phone].filter(Boolean).join(' · ') || '—'}
                </span>
              </span>
              <Badge variant={license.variant} soft>
                {license.label}
              </Badge>
              <span className="navix-agency-drivers__status text-end">
                <Badge variant={status.variant} soft>
                  {status.label}
                </Badge>
                <Badge variant={availability.variant} soft className="ms-1">
                  {availability.label}
                </Badge>
              </span>
              {onView && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon="bi-eye"
                  onClick={() => onView(driver.id)}
                  title="Voir le détail"
                  aria-label={`Voir le détail de ${driver.fullName}`}
                />
              )}
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

export default AgencyDrivers;
