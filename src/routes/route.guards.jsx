import { Outlet } from 'react-router-dom';

/**
 * ProtectedRoute — garde des routes privées.
 * TODO(auth) : vérifier la session (auth store) puis rediriger vers ROUTES.LOGIN
 * si l'utilisateur n'est pas authentifié.
 */
export const ProtectedRoute = () => <Outlet />;

/**
 * GuestRoute — garde des routes réservées aux visiteurs non connectés.
 * TODO(auth) : rediriger vers ROUTES.DASHBOARD si une session est déjà active.
 */
export const GuestRoute = () => <Outlet />;

/**
 * RoleGuard — garde basée sur les rôles.
 * TODO(rbac) : vérifier que le rôle de l'utilisateur courant figure dans `roles`.
 */
export const RoleGuard = ({ roles, children }) => {
  void roles;
  return children ?? <Outlet />;
};

/**
 * PermissionGuard — garde basée sur les permissions.
 * TODO(rbac) : vérifier que l'utilisateur courant possède chaque permission.
 */
export const PermissionGuard = ({ permissions, children }) => {
  void permissions;
  return children ?? <Outlet />;
};
