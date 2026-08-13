/**
 * Navix Tenant — Contexte multi-tenant (source unique de vérité)
 * --------------------------------------------------------------------------
 * Dérive la portée tenant / entreprise de la session authentifiée
 * (`useAuthStore`) : l'utilisateur courant, son entreprise et son tenant.
 *
 * Règle de portée simulée :
 *   - utilisateur non connecté  → aucune portée ('' / null) ;
 *   - super_admin               → vision globale ('' / null) ;
 *   - tout autre rôle           → borné à l'entreprise / au tenant de session.
 *
 * Aucune seconde source de vérité : les stores et services consomment ces
 * fonctions et ne doivent pas réimplémenter la règle.
 */
import { useAuthStore } from '@/features/auth';

/**
 * Contexte tenant courant de la session.
 * @returns {{
 *   isAuthenticated: boolean,
 *   isSuperAdmin: boolean,
 *   companyId: string,
 *   tenantId: string,
 *   company: object|null,
 *   tenant: object|null,
 * }}
 */
export const getTenantScope = () => {
  const { user, company, tenant } = useAuthStore.getState();
  const isGlobal = !user || user.role === 'super_admin';

  return {
    isAuthenticated: Boolean(user),
    isSuperAdmin: user?.role === 'super_admin',
    companyId: isGlobal ? '' : (company?.id ?? ''),
    tenantId: isGlobal ? '' : (tenant?.id ?? ''),
    company: isGlobal ? null : company,
    tenant: isGlobal ? null : tenant,
  };
};

/** Entreprise courante (id) — vide pour super_admin / session absente. */
export const getTenantScopeCompanyId = () => getTenantScope().companyId;

/** Tenant courant (id) — vide pour super_admin / session absente. */
export const getTenantScopeTenantId = () => getTenantScope().tenantId;
