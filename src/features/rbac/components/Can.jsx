/**
 * Navix RBAC — Gating conditionnel (`Can`)
 * --------------------------------------------------------------------------
 * Affiche son contenu si le contexte d'accès courant satisfait les exigences.
 * Prend en charge :
 *   - un rôle : `roles={['admin', 'owner']}`
 *   - une permission : `permission="vehicles.update"`
 *   - une liste de permissions : `permission={['vehicles.read', 'drivers.read']}`
 *     combinée selon `mode` ('all' par défaut | 'any')
 *
 * `children` peut être un nœud React (rendu si autorisé) ou une fonction
 * (render prop recevant le booléen d'autorisation).
 *
 * Exemples :
 *   <Can permission="vehicles.update"><VehicleActions /></Can>
 *   <Can roles="super_admin" fallback={<RestrictedNotice />}>{content}</Can>
 *   <Can permission="vehicles.read">{(allowed) => <Checkbox checked={allowed} />}</Can>
 */
import { useCan } from '../hooks/useCan';
import { useHasAnyRole } from '../hooks/useHasAnyRole';

const Can = ({ permission, roles, mode = 'all', fallback = null, children }) => {
  const can = useCan();
  const hasRole = useHasAnyRole(roles);

  const hasRequiredPermission = permission === undefined ? true : can(permission, { mode });
  const allowed = hasRole && hasRequiredPermission;

  if (typeof children === 'function') {
    return children(allowed);
  }

  return allowed ? children : fallback;
};

export default Can;
