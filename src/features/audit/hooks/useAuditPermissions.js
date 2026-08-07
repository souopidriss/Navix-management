/**
 * Navix Audit — Permissions du module (hook)
 * --------------------------------------------------------------------------
 * Résout les permissions effectives du rôle courant (matrice RBAC déclarative
 * dans rbac/constants/roles.js) et expose les décisions utiles au module.
 * Simulation UX uniquement : la sécurité réelle (audit.viewSensitive, etc.)
 * sera appliquée côté Express.js.
 */
import { useMemo } from 'react';
import { useAuthStore } from '@/features/auth';
import { PERMISSIONS } from '@/features/rbac';
import { getPermissionsForRole, hasPermission } from '@/features/rbac/utils/access';

export const useAuditPermissions = () => {
  const user = useAuthStore((state) => state.user);

  return useMemo(() => {
    const permissions = getPermissionsForRole(user?.role);
    const isSuperAdmin = user?.role === 'super_admin';

    return {
      permissions,
      isSuperAdmin,
      canView: hasPermission(permissions, PERMISSIONS.AUDIT_VIEW),
      canExport: hasPermission(permissions, PERMISSIONS.AUDIT_EXPORT),
      canViewSensitive: hasPermission(permissions, PERMISSIONS.AUDIT_VIEW_SENSITIVE),
      canViewAllCompanies: hasPermission(permissions, PERMISSIONS.AUDIT_VIEW_ALL_COMPANIES),
    };
  }, [user?.role]);
};
