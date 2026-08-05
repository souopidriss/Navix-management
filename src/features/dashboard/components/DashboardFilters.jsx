/**
 * Navix Dashboard — DashboardFilters
 * --------------------------------------------------------------------------
 * Filtres globaux du tableau de bord : période d'analyse, entreprise
 * (multi-tenant) et plage de dates personnalisée. Construit sur la FilterBar
 * générique de la bibliothèque core — aucune logique métier ici.
 */
import { useEffect } from 'react';
import { FilterBar, Toolbar } from '@/components/core';
import { useCompaniesStore } from '@/features/companies';
import { PERIOD_OPTIONS } from '../constants';

const DashboardFilters = ({ filters = {}, onChange, onReset, hasActiveFilters = false }) => {
  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  useEffect(() => {
    if (companies.length === 0) {
      fetchCompanies();
    }
  }, [companies.length, fetchCompanies]);

  const companyOptions = companies.map((company) => ({
    value: company.id,
    label: company.name,
  }));

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
