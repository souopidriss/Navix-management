/**
 * Navix Users — Contexte référentiel (entreprises, agences, rôles)
 * --------------------------------------------------------------------------
 * Fournit aux hooks et composants du module les données de référence partagées
 * (catalogues mockés) ainsi que la portée multi-tenant simulée de l'utilisateur
 * courant. Les cartes id → libellé servent à l'enrichissement des listes
 * (nom d'entreprise / d'agence / rôles) et aux options des filtres.
 */
import { useEffect, useMemo } from 'react';
import { MOCK_COMPANIES } from '@/features/companies/mocks';
import { MOCK_AGENCIES } from '@/features/agencies/mocks';
import { getTenantScopeCompanyId } from '@/utils/tenantScope';
import { useRoleStore } from '../store';

/** Portée multi-tenant simulée (source canonique) : tout sauf super_admin. */
export { getTenantScopeCompanyId } from '@/utils/tenantScope';

/** Carte id → entreprise (référentiel global, sauf portée bornée). */
export const buildCompanyById = (scopeCompanyId = '') =>
  MOCK_COMPANIES.filter((company) => !scopeCompanyId || company.id === scopeCompanyId).reduce(
    (acc, company) => {
      acc[company.id] = company;
      return acc;
    },
    {},
  );

/** Carte id → agence. */
export const buildAgencyById = () =>
  MOCK_AGENCIES.reduce((acc, agency) => {
    acc[agency.id] = agency;
    return acc;
  }, {});

/**
 * Enrichit des utilisateurs avec libellés métier (nom d'entreprise, agence,
 * rôles) — données affichées par les tableaux et cherchées par le filtre.
 * @param {Array<object>} users
 * @param {Array<object>} roles — rôles du store
 * @param {object} [companyById]
 * @param {object} [agencyById]
 * @returns {Array<object>}
 */
export const enrichUsers = (users, roles, companyById, agencyById) => {
  const roleNameById = (roles ?? []).reduce((acc, role) => {
    acc[role.id] = role.name;
    return acc;
  }, {});

  return (users ?? []).map((user) => ({
    ...user,
    companyName: companyById[user.companyId]?.name ?? '',
    agencyName: agencyById[user.agencyId]?.name ?? '',
    roleNames: (user.roleIds ?? []).map((roleId) => roleNameById[roleId] ?? '').filter(Boolean),
  }));
};

/**
 * Enrichit des rôles avec le nombre d'utilisateurs rattachés (tri + affichage).
 * @param {Array<object>} roles
 * @param {Array<object>} users — utilisateurs de la portée courante
 * @returns {Array<object>}
 */
export const enrichRoles = (roles, users) => {
  const counts = (users ?? []).reduce((acc, user) => {
    (user.roleIds ?? []).forEach((roleId) => {
      acc[roleId] = (acc[roleId] ?? 0) + 1;
    });
    return acc;
  }, {});

  return (roles ?? []).map((role) => ({ ...role, usersCount: counts[role.id] ?? 0 }));
};

/**
 * Hook référentiel : charge les rôles une seule fois puis expose cartes et
 * listes de référence ainsi que les fonctions d'enrichissement.
 * @returns {object}
 */
export const useTenantScope = () => {
  const scopeCompanyId = useMemo(() => getTenantScopeCompanyId(), []);
  const roles = useRoleStore((state) => state.roles);
  const fetchRoles = useRoleStore((state) => state.fetchRoles);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const reference = useMemo(() => {
    const companies = scopeCompanyId
      ? MOCK_COMPANIES.filter((company) => company.id === scopeCompanyId)
      : MOCK_COMPANIES;
    const companyById = buildCompanyById(scopeCompanyId);
    const agencyById = buildAgencyById();

    return {
      scopeCompanyId,
      companies,
      companyById,
      agencyById,
      agencies: MOCK_AGENCIES,
      roles,
    };
  }, [scopeCompanyId, roles]);

  return {
    ...reference,
    enrichUsers: (users) => enrichUsers(users, reference.roles, reference.companyById, reference.agencyById),
  };
};
