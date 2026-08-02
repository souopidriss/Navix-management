/**
 * Navix RBAC — Garde de rôle (`RoleGuard`)
 * --------------------------------------------------------------------------
 * Protège une portion d'interface selon le(s) rôle(s) autorisé(s).
 * Rendu conditionnel : `children` si le rôle courant est autorisé, sinon
 * `fallback` (null par défaut).
 *
 * @param {{ roles: string|string[], fallback?: ReactNode, children: ReactNode }} props
 *
 * Exemple :
 *   <RoleGuard roles={['super_admin', 'company_owner']}>
 *     <BillingPanel />
 *   </RoleGuard>
 */
import Can from './Can';

const RoleGuard = ({ roles, fallback = null, children }) => (
  <Can roles={roles} fallback={fallback}>
    {children}
  </Can>
);

export default RoleGuard;
