/**
 * Navix Users — RoleDetails
 * --------------------------------------------------------------------------
 * Fiche détaillée d'un rôle : identité (nom, code, type, statut, description)
 * et permissions regroupées par module (lecture seule — l'édition des
 * permissions est assurée par RolePermissionEditor sur la même page).
 *
 * Props :
 *   role    : rôle détaillé
 *   modules : codes de module ordonnés
 *   groups  : Record<module, Array<permission>>
 */
import { Card } from '@/components/ui';
import { getPermissionModule } from '../constants';
import { getPermissionsByModule } from '../mocks';
import RoleTypeBadge from './RoleTypeBadge';
import RoleStatusBadge from './RoleStatusBadge';
import PermissionBadge from './PermissionBadge';
import './RoleDetails.css';

const WILDCARD = '*';

const RoleDetails = ({ role }) => {
  if (!role) return null;

  const groups = getPermissionsByModule();
  const wildcard = role.code === WILDCARD || role.permissions?.includes(WILDCARD);
  const modules = role.permissions
    ? role.permissions
        .filter((code) => code !== WILDCARD)
        .map((code) => code.split('.')[0])
        .filter((module, index, all) => all.indexOf(module) === index)
        .filter((module) => groups[module])
    : [];

  return (
    <Card className="navix-role-details" padding="lg">
      <div className="navix-role-details__header">
        <div className="navix-role-details__identity">
          <h2 className="h4 mb-1">{role.name}</h2>
          <p className="navix-role-details__code">
            Code : <code>{role.code}</code>
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <RoleTypeBadge isSystem={role.isSystem} />
          <RoleStatusBadge isActive={role.isActive} />
        </div>
      </div>

      {role.description && (
        <p className="navix-role-details__description">{role.description}</p>
      )}

      <div className="navix-role-details__permissions">
        <h3 className="h6">Permissions du rôle ({wildcard ? 'toutes' : role.permissions?.length ?? 0})</h3>
        {wildcard ? (
          <div className="alert alert-secondary mb-0">
            <i className="bi bi-shield-lock me-2" aria-hidden="true" />
            Accès complet à toutes les permissions.
          </div>
        ) : modules.length === 0 ? (
          <p className="text-muted mb-0">Aucune permission attribuée.</p>
        ) : (
          <div className="navix-role-details__groups">
            {modules.map((module) => {
              const meta = getPermissionModule(module);
              return (
                <section className="navix-role-details__group" key={module}>
                  <h4 className="navix-role-details__group-title">
                    {meta.icon && <i className={`bi ${meta.icon} me-2`} aria-hidden="true" />}
                    {meta.label}
                  </h4>
                  <div className="d-flex flex-wrap gap-1">
                    {(groups[module] ?? [])
                      .filter((permission) => role.permissions.includes(permission.code))
                      .map((permission) => (
                        <PermissionBadge key={permission.code} code={permission.code} />
                      ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RoleDetails;
