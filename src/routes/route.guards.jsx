import { matchPath, Navigate, Outlet, useLocation } from 'react-router-dom';
import { can, hasAnyRole, ROUTE_META, useRbacStore } from '@/features/rbac';
import { useAuthStore } from '@/features/auth';
import { resolveLandingRoute, ROUTES } from './route.constants';

/**
 * ProtectedRoute — garde des routes privées.
 * Redirige vers LOGIN si l'utilisateur n'est pas authentifié (en conservant
 * la position d'origine via `location.state` pour un éventuel retour).
 */
export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

/**
 * GuestRoute — garde des routes réservées aux visiteurs non connectés.
 * Redirige vers la landing si une session est déjà active.
 */
export const GuestRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={resolveLandingRoute()} replace />;
  }

  return <Outlet />;
};

/**
 * HomeRedirect — garde de la racine publique.
 * Redirige vers le tableau de bord si une session existe, sinon vers la
 * page de connexion (évite le passage par /dashboard pour les visiteurs).
 */
export const HomeRedirect = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return <Navigate to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN} replace />;
};

/**
 * RoleGuard — garde de routes basée sur les rôles.
 * Redirige vers UNAUTHORIZED si le rôle courant ne figure pas dans `roles`.
 */
export const RoleGuard = ({ roles, children }) => {
  const role = useRbacStore((state) => state.currentRole);

  if (!hasAnyRole(role, roles)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children ?? <Outlet />;
};

/**
 * PermissionGuard — garde de routes basée sur les permissions.
 * Redirige vers UNAUTHORIZED si les permissions requises sont insuffisantes.
 */
export const PermissionGuard = ({ permission, mode = 'all', children }) => {
  const permissions = useRbacStore((state) => state.permissions);

  if (!can(permissions, permission, { mode })) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children ?? <Outlet />;
};

/**
 * RouteRbacGuard — garde générique de toutes les routes privées.
 * --------------------------------------------------------------------------
 * Applique la méta RBAC de la route courante (ROUTE_META) : les entrées
 * `requiredRole` / `requiredPermissions` (voir `mode`) sont vérifiées contre
 * le contexte RBAC de session, exactement comme la sidebar (même source de
 * vérité). La correspondance route → méta utilise les motifs de routes
 * (`matchPath`) afin de couvrir les routes paramétrées (`/dashboard/…/:id`).
 *
 * Redirige vers UNAUTHORIZED (`/403`) si l'accès est refusé — la distinction
 * avec l'absence d'authentification est assurée par ProtectedRoute (→ LOGIN).
 */
export const RouteRbacGuard = () => {
  const location = useLocation();
  const role = useRbacStore((state) => state.currentRole);
  const permissions = useRbacStore((state) => state.permissions);

  const metaKey = Object.keys(ROUTE_META).find((pattern) => matchPath(pattern, location.pathname));
  const meta = metaKey ? ROUTE_META[metaKey] : {};

  const hasRole = !meta.requiredRole || hasAnyRole(role, meta.requiredRole);
  const hasPermissions =
    !meta.requiredPermissions || can(permissions, meta.requiredPermissions, { mode: meta.mode });

  if (!hasRole || !hasPermissions) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
};
