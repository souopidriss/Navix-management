/**
 * Navix RBAC — Données mockées de test
 * --------------------------------------------------------------------------
 * Aucune logique serveur : ce jeu de données sert uniquement à tester
 * l'architecture (sidebar, guards, hooks) avant le branchement du backend.
 *
 * - `defaultRole`  : rôle appliqué par défaut au démarrage.
 * - `users`        : profils de test, un par rôle représentatif, pour basculer
 *                    facilement de rôle via `useRbacStore`.
 *
 * Le remplacement par des données API consistera à initialiser le store RBAC
 * à partir de la réponse du serveur (aucun changement dans les hooks/guards).
 */
import { ROLES } from './roles';

export const MOCK_RBAC = {
  defaultRole: ROLES.SUPER_ADMIN,

  users: [
    {
      id: 'usr_rbac_super_admin',
      name: 'Awa Kouamé',
      email: 'demo@navix.app',
      role: ROLES.SUPER_ADMIN,
      companyRole: ROLES.SUPER_ADMIN,
      tenantRole: ROLES.SUPER_ADMIN,
    },
    {
      id: 'usr_rbac_company_owner',
      name: 'Fatou Traoré',
      email: 'owner@navix-trans.app',
      role: ROLES.COMPANY_OWNER,
      companyRole: ROLES.COMPANY_OWNER,
      tenantRole: ROLES.SUPER_ADMIN,
    },
    {
      id: 'usr_rbac_company_admin',
      name: 'Kouassi Koffi',
      email: 'admin@navix-trans.app',
      role: ROLES.COMPANY_ADMIN,
      companyRole: ROLES.COMPANY_ADMIN,
      tenantRole: ROLES.COMPANY_ADMIN,
    },
    {
      id: 'usr_rbac_fleet_manager',
      name: 'Moussa Diabaté',
      email: 'fleet@navix-trans.app',
      role: ROLES.FLEET_MANAGER,
      companyRole: ROLES.FLEET_MANAGER,
      tenantRole: ROLES.COMPANY_ADMIN,
    },
    {
      id: 'usr_rbac_driver',
      name: 'Jean Kouassi',
      email: 'driver@navix-trans.app',
      role: ROLES.DRIVER,
      companyRole: ROLES.DRIVER,
      tenantRole: ROLES.VIEWER,
    },
    {
      id: 'usr_rbac_accountant',
      name: 'Aïcha Diallo',
      email: 'accounting@navix-trans.app',
      role: ROLES.ACCOUNTANT,
      companyRole: ROLES.ACCOUNTANT,
      tenantRole: ROLES.COMPANY_ADMIN,
    },
    {
      id: 'usr_rbac_viewer',
      name: 'Sébastien Kanga',
      email: 'viewer@navix-trans.app',
      role: ROLES.VIEWER,
      companyRole: ROLES.VIEWER,
      tenantRole: ROLES.COMPANY_ADMIN,
    },
  ],
};
