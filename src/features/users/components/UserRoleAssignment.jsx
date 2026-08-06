/**
 * Navix Users — UserRoleAssignment
 * --------------------------------------------------------------------------
 * Widget d'attribution des rôles à un utilisateur : liste de cases à cocher
 * (rôles de la portée courante, rôles système signalés) + aperçu des
 * permissions effectives résultantes (union des permissions des rôles
 * sélectionnés — joker `*` = accès complet).
 *
 * Props :
 *   roles      : rôles disponibles
 *   selectedIds: rôles sélectionnés (roleIds)
 *   onChange   : (roleIds: string[]) => void
 *   error      : message d'erreur de validation (au moins un rôle requis)
 *   readOnly   : booléen — désactive les cases à cocher
 */
import { useMemo } from 'react';
import { Badge } from '@/components/ui';
import { getPermissionsByRoleIds } from '../utils/access';
import PermissionBadge from './PermissionBadge';
import './UserRoleAssignment.css';

const WILDCARD = '*';
const MAX_PREVIEW = 8;

const UserRoleAssignment = ({ roles = [], selectedIds = [], onChange, error, readOnly = false }) => {
  const { hasWildcard, permissions } = useMemo(() => {
    const selected = roles.filter((role) => selectedIds.includes(role.id));
    return {
      hasWildcard: selected.some((role) => role.code === WILDCARD || role.permissions?.includes(WILDCARD)),
      permissions: getPermissionsByRoleIds(selectedIds, roles),
    };
  }, [roles, selectedIds]);

  const toggle = (roleId) => {
    if (readOnly) return;
    const next = selectedIds.includes(roleId)
      ? selectedIds.filter((id) => id !== roleId)
      : [...selectedIds, roleId];
    onChange(next);
  };

  return (
    <div className="navix-user-roles">
      <fieldset className="navix-user-roles__fieldset">
        <legend className="visually-hidden">Rôles attribués</legend>
        {roles.map((role) => {
          const checked = selectedIds.includes(role.id);
          return (
            <div className="form-check navix-user-roles__item" key={role.id}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`user-role-${role.id}`}
                checked={checked}
                onChange={() => toggle(role.id)}
                disabled={readOnly}
                aria-label={`Attribuer le rôle ${role.name}`}
              />
              <label className="form-check-label d-flex align-items-center gap-2" htmlFor={`user-role-${role.id}`}>
                <span>{role.name}</span>
                {role.isSystem && <Badge variant="primary" soft size="sm">Système</Badge>}
                {!role.isActive && <Badge variant="secondary" soft size="sm">Inactif</Badge>}
              </label>
            </div>
          );
        })}
      </fieldset>

      {error && (
        <div className="invalid-feedback d-block" role="alert">
          {error}
        </div>
      )}

      <div className="navix-user-roles__preview">
        <span className="navix-user-roles__preview-title">
          Permissions résultantes ({hasWildcard ? 'toutes' : permissions.length})
        </span>
        {hasWildcard ? (
          <PermissionBadge code={WILDCARD} />
        ) : permissions.length === 0 ? (
          <span className="text-muted">Aucune permission — attribuez au moins un rôle.</span>
        ) : (
          <div className="d-flex flex-wrap gap-1">
            {permissions.slice(0, MAX_PREVIEW).map((code) => (
              <PermissionBadge key={code} code={code} />
            ))}
            {permissions.length > MAX_PREVIEW && (
              <Badge variant="secondary" soft size="sm">
                +{permissions.length - MAX_PREVIEW}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRoleAssignment;
