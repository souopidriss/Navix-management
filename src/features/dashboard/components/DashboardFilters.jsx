/**
 * Navix Dashboard — DashboardFilters
 * --------------------------------------------------------------------------
 * Filtres globaux du tableau de bord : période d'analyse, entreprise
 * (multi-tenant) et plage de dates personnalisée. Construit sur la FilterBar
 * générique de la bibliothèque core — aucune logique métier ici.
 */
import { useEffect, useMemo } from 'react';
import { FilterBar, Toolbar } from '@/components/core';
import { useCompaniesStore } from '@/features/companies';
import { getTenantScope } from '@/utils/tenantScope';
import { PERIOD_OPTIONS } from '../constants';

const DashboardFilters = ({ filters = {}, onChange, onReset, hasActiveFilters = false }) => {
  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  useEffect(() => {
    if (companies.length === 0) {
      fetchCompanies();
    }
  }, [companies.length, fetchCompanies]);

  /* Multi-tenant : hors super_admin, le sélecteur n'expose que l'entreprise
     courante (le filtrage des données est déjà borné par le store). */
  const companyOptions = useMemo(() => {
    const { isSuperAdmin, companyId: scopeCompanyId } = getTenantScope();
    const visible = isSuperAdmin
      ? companies
      : companies.filter((company) => company.id === scopeCompanyId);
    return visible.map((company) => ({
      value: company.id,
      label: company.name,
    }));
  }, [companies]);

  const fields = [
    {
      key: 'period',
      type: 'select',
      label: 'Période',
      options: PERIOD_OPTIONS.map(({ value, label }) => ({ value, label })),
      allLabel: 'Toutes les périodes',
    },
    {
      key: 'companyId',
      type: 'select',
      label: 'Entreprise',
      options: companyOptions,
      allLabel: 'Toutes les entreprises',
    },
    { key: 'dateFrom', type: 'date', label: 'Du' },
    { key: 'dateTo', type: 'date', label: 'Au' },
  ];

  return (
    <Toolbar align="start" gap="sm">
      <FilterBar
        fields={fields}
        values={filters}
        onChange={onChange}
        onReset={onReset}
        hasActiveFilters={hasActiveFilters}
      />
    </Toolbar>
  );
};

export default DashboardFilters;
