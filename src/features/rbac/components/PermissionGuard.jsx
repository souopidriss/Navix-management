/**
 * Navix RBAC — Garde de permissions (`PermissionGuard`)
 * --------------------------------------------------------------------------
 * Protège une portion d'interface selon les permissions requises.
 * Rendu conditionnel : `children` si les permissions sont satisfaites, sinon
 * `fallback` (null par défaut). Les permissions peuvent être combinées en
 * 'all' (défaut) ou 'any' via `mode`.
 *
 * @param {{
 *   permission: string|string[],
 *   mode?: 'all'|'any',
 *   fallback?: ReactNode,
 *   children: ReactNode
 * }} props
 *
 * Exemple :
 *   <PermissionGuard permission="maintenance.create">
 *     <MaintenanceForm />
 *   </PermissionGuard>
 */
import Can from './Can';

const PermissionGuard = ({ permission, mode = 'all', fallback = null, children }) => (
  <Can permission={permission} mode={mode} fallback={fallback}>
    {children}
  </Can>
);

export default PermissionGuard;
