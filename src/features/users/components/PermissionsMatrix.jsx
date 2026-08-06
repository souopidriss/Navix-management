/**
 * Navix Users — PermissionsMatrix
 * --------------------------------------------------------------------------
 * Matrice des permissions (lecture seule) : une ligne par module, une colonne
 * par action (Voir / Créer / Modifier / Supprimer / Gérer / Exporter). Une
 * cellule pleine indique qu'une permission `module.action` existe dans le
 * catalogue. Défilement horizontal sur mobile ; en-tête et première colonne
 * restent visibles (accessibilité clavier).
 *
 * Props :
 *   modules : codes de module ordonnés
 *   groups  : Record<module, Array<permission>>
 */
import { getPermissionModule, PERMISSION_MATRIX_ACTIONS, getPermissionAction } from '../constants';
import './PermissionsMatrix.css';

const PermissionsMatrix = ({ modules = [], groups = {} }) => (
  <div className="navix-permissions-matrix" tabIndex={0}>
    <table className="table table-sm align-middle mb-0">
      <thead>
        <tr>
          <th scope="col" className="navix-permissions-matrix__module-col">Module</th>
          {PERMISSION_MATRIX_ACTIONS.map((action) => (
            <th scope="col" key={action} className="navix-permissions-matrix__action-col">
              <span className="d-inline-flex align-items-center gap-1">
                {getPermissionAction(action).icon && (
                  <i className={`bi ${getPermissionAction(action).icon}`} aria-hidden="true" />
                )}
                <span className="visually-hidden">Action </span>
                {getPermissionAction(action).label}
              </span>
            </th>
          ))}
          <th scope="col" className="navix-permissions-matrix__count-col">Total</th>
        </tr>
      </thead>
      <tbody>
        {modules.map((module) => {
          const moduleMeta = getPermissionModule(module);
          const permissions = groups[module] ?? [];
          return (
            <tr key={module}>
              <th scope="row" className="navix-permissions-matrix__module-col">
                <span className="d-inline-flex align-items-center gap-2">
                  {moduleMeta.icon && <i className={`bi ${moduleMeta.icon}`} aria-hidden="true" />}
                  {moduleMeta.label}
                </span>
              </th>
              {PERMISSION_MATRIX_ACTIONS.map((action) => {
                const exists = permissions.some((permission) => permission.action === action);
                const permission = permissions.find((item) => item.action === action);
                return (
                  <td key={action} className="navix-permissions-matrix__cell">
                    {exists ? (
                      <span
                        className={`navix-permissions-matrix__dot ${permission?.isSensitive ? 'navix-permissions-matrix__dot--sensitive' : ''}`}
                        title={permission?.name ?? `${module}.${action}`}
                        aria-label={permission?.name ?? `${module}.${action}`}
                      />
                    ) : (
                      <span className="navix-permissions-matrix__dot navix-permissions-matrix__dot--empty" aria-label="Non disponible" />
                    )}
                  </td>
                );
              })}
              <td className="navix-permissions-matrix__count-col">
                <span className="navix-permissions-matrix__count">{permissions.length}</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default PermissionsMatrix;
