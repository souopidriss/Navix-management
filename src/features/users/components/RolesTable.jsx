/**
 * Navix Users — RolesTable
 * --------------------------------------------------------------------------
 * Tableau des rôles (affichage desktop) construit sur le DataTable générique :
 * nom, code, type (Système / Personnalisé), statut, nombre de permissions,
 * nombre d'utilisateurs et menu contextuel. Les rôles système ne peuvent ni
 * être désactivés ni supprimés (actions désactivées + garde côté service).
 *
 * Props :
 *   roles        : liste filtrée / triée
 *   sort         : { by, direction }
 *   onSortChange : (by, direction) => void
 *   onAction     : (key: string, role: object) => void
 *   onView       : (role: object) => void
 */
import { DataTable, ActionDropdown } from '@/components/core';
import { useCan, PERMISSIONS } from '@/features/rbac';
import RoleTypeBadge from './RoleTypeBadge';
import RoleStatusBadge from './RoleStatusBadge';
import './RolesTable.css';

const buildItems = (role, onAction, can) => {
  const items = [
    { key: 'view', label: 'Voir le détail', icon: 'bi-eye', onClick: () => onAction('view', role) },
    ...(can(PERMISSIONS.ROLES_MANAGE)
      ? [{ key: 'permissions', label: 'Gérer les permissions', icon: 'bi-key', onClick: () => onAction('permissions', role) }]
      : []),
  ];
  if (can(PERMISSIONS.ROLES_UPDATE) || can(PERMISSIONS.ROLES_DELETE)) {
    items.push({ key: 'sep1', separator: true });
  }

  if (can(PERMISSIONS.ROLES_UPDATE)) {
    if (role.isActive) {
      items.push({
        key: 'deactivate',
        label: 'Désactiver',
        icon: 'bi-toggle-off',
        disabled: role.isSystem,
        title: role.isSystem ? 'Un rôle système ne peut pas être désactivé.' : undefined,
        onClick: () => onAction('deactivate', role),
      });
    } else {
      items.push({ key: 'activate', label: 'Activer', icon: 'bi-toggle-on', onClick: () => onAction('activate', role) });
    }
  }

  if (can(PERMISSIONS.ROLES_UPDATE) && can(PERMISSIONS.ROLES_DELETE)) {
    items.push({ key: 'sep2', separator: true });
  }
  if (can(PERMISSIONS.ROLES_DELETE)) {
    items.push({
      key: 'delete',
      label: 'Supprimer',
      icon: 'bi-trash3',
      danger: true,
      disabled: role.isSystem,
      title: role.isSystem ? 'Un rôle système ne peut pas être supprimé.' : undefined,
      onClick: () => onAction('delete', role),
    });
  }

  return items;
};

const RolesTable = ({ roles = [], sort, onSortChange, onAction, onView }) => {
  const can = useCan();
  const columns = [
    {
      key: 'name',
      label: 'Nom',
      sortable: true,
      width: '16rem',
      render: (role) => (
        <div className="navix-roles-table__name">
          <span className="navix-roles-table__title">{role.name}</span>
          {role.description && <span className="navix-roles-table__desc">{role.description}</span>}
        </div>
      ),
    },
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      width: '11rem',
      render: (role) => <code>{role.code}</code>,
    },
    {
      key: 'isSystem',
      label: 'Type',
      sortable: true,
      width: '9rem',
      render: (role) => <RoleTypeBadge isSystem={role.isSystem} />,
    },
    {
      key: 'isActive',
      label: 'Statut',
      sortable: true,
      width: '8rem',
      render: (role) => <RoleStatusBadge isActive={role.isActive} />,
    },
    {
      key: 'permissions',
      label: 'Permissions',
      sortable: true,
      width: '7rem',
      render: (role) => (
        <span>
          {role.permissions?.includes('*') ? 'Toutes' : `${role.permissions?.length ?? 0}`}
        </span>
      ),
    },
    {
      key: 'usersCount',
      label: 'Utilisateurs',
      sortable: true,
      width: '7rem',
      render: (role) => role.usersCount ?? 0,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'end',
      className: 'text-end',
      render: (role) => (
        <ActionDropdown
          align="end"
          triggerLabel={`Actions pour ${role.name}`}
          items={buildItems(role, onAction, can)}
        />
      ),
    },
  ];

  return (
    <DataTable
      className="navix-roles-table"
      columns={columns}
      rows={roles}
      sort={sort}
      onSortChange={onSortChange}
      onRowClick={onView}
      ariaLabel="Tableau des rôles"
    />
  );
};

export default RolesTable;
