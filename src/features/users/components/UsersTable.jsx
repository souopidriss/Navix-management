/**
 * Navix Users — UsersTable
 * --------------------------------------------------------------------------
 * Tableau des utilisateurs (affichage desktop) construit sur le DataTable
 * générique : avatar + identité, coordonnées, rattachements, rôles, statut,
 * dernière connexion et menu contextuel selon l'état du compte.
 *
 * Props :
 *   users        : liste filtrée / triée / paginée
 *   sort         : { by, direction }
 *   onSortChange : (by, direction) => void
 *   onAction     : (key: string, user: object) => void
 *   onView       : (user: object) => void
 */
import { Avatar, DataTable, ActionDropdown } from '@/components/core';
import { useCan, PERMISSIONS } from '@/features/rbac';
import { formatUserDate, formatUserDateTime } from '../constants';
import UserStatusBadge from './UserStatusBadge';
import RoleBadges from './RoleBadges';
import './UsersTable.css';

const buildItems = (user, onAction, can) => {
  const items = [
    { key: 'view', label: 'Voir le détail', icon: 'bi-eye', onClick: () => onAction('view', user) },
    ...(can(PERMISSIONS.USERS_UPDATE)
      ? [{ key: 'edit', label: 'Modifier', icon: 'bi-pencil', onClick: () => onAction('edit', user) }]
      : []),
    { key: 'sep1', separator: true },
  ];

  if (can(PERMISSIONS.USERS_UPDATE)) {
    if (user.status === 'active') {
      items.push({ key: 'deactivate', label: 'Désactiver', icon: 'bi-person-slash', onClick: () => onAction('deactivate', user) });
      items.push({ key: 'suspend', label: 'Suspendre', icon: 'bi-person-x', onClick: () => onAction('suspend', user) });
    }
    if (user.status === 'inactive' || user.status === 'suspended') {
      items.push({ key: 'reactivate', label: 'Réactiver', icon: 'bi-person-check', onClick: () => onAction('reactivate', user) });
    }
    if (user.status === 'pending') {
      items.push({ key: 'invite', label: 'Envoyer l’invitation', icon: 'bi-envelope', onClick: () => onAction('invite', user) });
    }
    if (user.status === 'invited') {
      items.push({ key: 'invite', label: 'Relancer l’invitation', icon: 'bi-envelope', onClick: () => onAction('invite', user) });
    }
  }

  if (can(PERMISSIONS.USERS_UPDATE)) {
    items.push({ key: 'sep2', separator: true });
    items.push({ key: 'resetPassword', label: 'Réinitialiser le mot de passe', icon: 'bi-key', onClick: () => onAction('resetPassword', user) });
  }

  if (can(PERMISSIONS.USERS_DELETE)) {
    items.push({
      key: 'delete',
      label: 'Supprimer',
      icon: 'bi-trash3',
      danger: true,
      disabled: user.id === 'usr_001',
      onClick: () => onAction('delete', user),
    });
  }

  return items;
};

const UsersTable = ({ users = [], sort, onSortChange, onAction, onView }) => {
  const can = useCan();
  const columns = [
    {
      key: 'fullName',
      label: 'Utilisateur',
      sortable: true,
      width: '16rem',
      render: (user) => (
        <div className="navix-users-table__user">
          <Avatar name={user.fullName} size="sm" />
          <div>
            <span className="navix-users-table__name">{user.fullName}</span>
            <span className="navix-users-table__email">{user.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Téléphone',
      width: '10rem',
      render: (user) => (user.phone ? <a href={`tel:${user.phone}`}>{user.phone}</a> : '—'),
    },
    {
      key: 'companyName',
      label: 'Entreprise',
      sortable: true,
      width: '11rem',
      render: (user) => user.companyName || '—',
    },
    {
      key: 'agencyName',
      label: 'Agence',
      width: '10rem',
      render: (user) => user.agencyName || '—',
    },
    {
      key: 'roleIds',
      label: 'Rôles',
      width: '13rem',
      render: (user) => <RoleBadges roleIds={user.roleIds} />,
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      width: '8rem',
      render: (user) => <UserStatusBadge status={user.status} />,
    },
    {
      key: 'lastLoginAt',
      label: 'Dernière connexion',
      sortable: true,
      width: '10rem',
      render: (user) =>
        user.lastLoginAt ? (
          <time dateTime={user.lastLoginAt} title={formatUserDateTime(user.lastLoginAt)}>
            {formatUserDate(user.lastLoginAt)}
          </time>
        ) : (
          <span className="text-muted">Jamais</span>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'end',
      className: 'text-end',
      render: (user) => (
        <ActionDropdown
          align="end"
          triggerLabel={`Actions pour ${user.fullName}`}
          items={buildItems(user, onAction, can)}
        />
      ),
    },
  ];

  return (
    <DataTable
      className="navix-users-table"
      columns={columns}
      rows={users}
      sort={sort}
      onSortChange={onSortChange}
      onRowClick={onView}
      ariaLabel="Tableau des utilisateurs"
    />
  );
};

export default UsersTable;
