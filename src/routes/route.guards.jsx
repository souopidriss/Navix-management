import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';
import { can, hasAnyRole, useRbacStore } from '@/features/rbac';
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
