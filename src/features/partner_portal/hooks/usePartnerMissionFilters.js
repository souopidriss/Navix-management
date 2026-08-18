/**
 * Navix Partner Portal — Hook usePartnerMissionFilters (PROMPT 064)
 * --------------------------------------------------------------------------
 * Fournit les options de filtres des missions (statut / type / période)
 * résolues depuis les constantes métier, ainsi que le descripteur de champs
 * FilterBar — y compris les champs de date pour la période personnalisée.
 */
import { useMemo } from 'react';
import {
  PARTNER_MISSION_STATUSES,
  PARTNER_MISSION_TYPES,
  PARTNER_MISSION_TYPE_VALUES,
  PARTNER_MISSION_PERIODS,
} from '../constants/partner.constants';

export const usePartnerMissionFilters = (filters = {}) => {
  const options = useMemo(() => {
    const statusOptions = Object.entries(PARTNER_MISSION_STATUSES).map(([value, meta]) => ({
      value,
      label: meta.label,
    }));
    const typeOptions = PARTNER_MISSION_TYPE_VALUES.map((value) => ({
      value,
      label: PARTNER_MISSION_TYPES[value]?.label ?? value,
    }));
    const periodOptions = Object.entries(PARTNER_MISSION_PERIODS).map(([value, meta]) => ({
      value,
      label: meta.label,
    }));
    return { statusOptions, typeOptions, periodOptions };
  }, []);

  const fields = useMemo(() => {
    const base = [
      { key: 'status', type: 'select', label: 'Statut', options: options.statusOptions, allLabel: 'Tous les statuts' },
      { key: 'type', type: 'select', label: 'Prestation', options: options.typeOptions, allLabel: 'Toutes les prestations' },
      { key: 'period', type: 'select', label: 'Période', options: options.periodOptions, allLabel: 'Toutes les périodes' },
    ];
    if (filters.period === 'custom') {
      base.push(
        { key: 'customFrom', type: 'date', label: 'Du', min: '2025-01-01' },
        { key: 'customTo', type: 'date', label: 'Au', min: '2025-01-01' },
      );
    }
    return base;
  }, [options, filters.period]);

  return { options, fields };
};

export default usePartnerMissionFilters;
