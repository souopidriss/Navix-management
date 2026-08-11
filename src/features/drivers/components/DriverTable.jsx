/**
 * Navix Drivers — DriverTable
 * --------------------------------------------------------------------------
 * Tableau des chauffeurs (affichage desktop) construit sur le DataTable
 * générique de la bibliothèque core : photo, nom, code employé, téléphone,
 * permis, entreprise, disponibilité, statut, expiration du permis et actions.
 * Tri par en-tête (Nom, Expiration permis) géré par le store.
 *
 * Props :
 *   drivers      : liste des chauffeurs à afficher (filtrée/triée/paginée)
 *   companyById  : carte { id → { name } } des entreprises
 *   agencyById   : carte { id → { name } } des agences
 *   sort         : { by, direction } — tri contrôlé
 *   onSortChange : (by, direction) => void
 *   onView       : (id: string) => void
 *   onEdit       : (id: string) => void
 *   onDelete     : (driver: object) => void
 */
import { Badge } from '@/components/ui';
import { DataTable } from '@/components/core';
import DriverAvatar from './DriverAvatar';
import DriverStatusBadge from './DriverStatusBadge';
import DriverLicenseBadge from './DriverLicenseBadge';
import { getDriverAvailability, formatDriverDate, getExpiryStatus } from '../constants';
import './DriverTable.css';

const DriverTable = ({ drivers = [], companyById = {}, agencyById = {}, sort, onSortChange, onView, onEdit, onDelete }) => {
  const columns = [
    {
      key: 'photo',
      label: 'Photo',
      srOnly: true,
      width: '3.25rem',
      className: 'navix-driver-table__photo',
      render: (driver) => <DriverAvatar src={driver.photo} fullName={driver.fullName} size="sm" />,
    },
    {
      key: 'name',
      label: 'Nom',
      sortable: true,
      render: (driver) => (
        <button
          type="button"
          className="navix-driver-table__name"
          onClick={() => onView(driver.id)}
          title={`Voir ${driver.fullName}`}
        >
          {driver.fullName}
        </button>
      ),
    },
    {
      key: 'employeeCode',
      label: 'Code',
      className: 'navix-driver-table__code',
      render: (driver) => driver.employeeCode,
    },
    {
      key: 'phone',
      label: 'Téléphone',
      className: 'navix-driver-table__phone',
      render: (driver) => driver.phone,
    },
    {
      key: 'licenseCategory',
      label: 'Permis',
      render: (driver) => <DriverLicenseBadge category={driver.licenseCategory} />,
    },
    {
      key: 'company',
      label: 'Entreprise',
      className: 'navix-driver-table__company',
      render: (driver) => (
        <>
          {companyById[driver.companyId]?.name ?? '—'}
          <span className="navix-driver-table__agency">{agencyById[driver.agencyId]?.name ?? '—'}</span>
        </>
      ),
    },
    {
      key: 'availability',
      label: 'Disponibilité',
      render: (driver) => {
        const availability = getDriverAvailability(driver.availability);
        return (
          <Badge variant={availability.variant} soft dot={false}>
            {availability.label}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'Statut',
      render: (driver) => <DriverStatusBadge status={driver.status} />,
    },
    {
      key: 'licenseExpiryDate',
      label: 'Expiration permis',
      sortable: true,
      className: 'navix-driver-table__expiry',
      render: (driver) => {
        const expiry = getExpiryStatus(driver.licenseExpiryDate);
        return (
          <>
            <span
              className={`navix-driver-table__expiry-date navix-driver-table__expiry-date--${expiry.variant}`}
            >
              {formatDriverDate(driver.licenseExpiryDate)}
            </span>
            {expiry.variant !== 'success' && expiry.variant !== 'secondary' && (
              <span className={`navix-driver-table__expiry-tag navix-driver-table__expiry-tag--${expiry.variant}`}>
                {expiry.label}
              </span>
            )}
          </>
        );
      },
    },
  ];

  return (
    <DataTable
      className="navix-driver-table"
      columns={columns}
      rows={drivers}
      sort={sort}
      onSortChange={onSortChange}
      ariaLabel="Liste des chauffeurs"
      actions={[
        {
          key: 'view',
          label: (driver) => `Voir le détail de ${driver.fullName}`,
          title: 'Voir le détail',
          icon: 'bi-eye',
          onClick: (driver) => onView(driver.id),
        },
        {
          key: 'edit',
          label: (driver) => `Modifier ${driver.fullName}`,
          title: 'Modifier',
          icon: 'bi-pencil',
          onClick: (driver) => onEdit(driver.id),
        },
        {
          key: 'delete',
          label: (driver) => `Supprimer ${driver.fullName}`,
          title: 'Supprimer',
          icon: 'bi-trash3',
          onClick: (driver) => onDelete(driver),
        },
      ]}
    />
  );
};

export default DriverTable;
