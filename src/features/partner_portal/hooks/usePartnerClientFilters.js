/**
 * Navix Partner Portal — Hook usePartnerClientFilters (PROMPT 065)
 * --------------------------------------------------------------------------
 * Fournit les options de filtres des clients (statut / ville / type)
 * résolues depuis les constantes métier et les villes du portefeuille,
 * ainsi que le descripteur de champs FilterBar.
 */
import { useMemo } from 'react';
import {
  PARTNER_CLIENT_STATUSES,
  PARTNER_CLIENT_TYPE_VALUES,
  PARTNER_CLIENT_TYPES,
} from '../constants/partner.constants';

export const usePartnerClientFilters = (cities = []) => {
  const options = useMemo(() => {
    const statusOptions = Object.entries(PARTNER_CLIENT_STATUSES).map(([value, meta]) => ({
      value,
      label: meta.label,
    }));
    const typeOptions = PARTNER_CLIENT_TYPE_VALUES.map((value) => ({
      value,
      label: PARTNER_CLIENT_TYPES[value]?.label ?? value,
    }));
    const cityOptions = cities.map((city) => ({ value: city, label: city }));
    return { statusOptions, typeOptions, cityOptions };
  }, [cities]);

  const fields = useMemo(
    () => [
      { key: 'status', type: 'select', label: 'Statut', options: options.statusOptions, allLabel: 'Tous les statuts' },
      { key: 'city', type: 'select', label: 'Ville', options: options.cityOptions, allLabel: 'Toutes les villes' },
      { key: 'type', type: 'select', label: 'Type', options: options.typeOptions, allLabel: 'Tous les types' },
    ],
    [options],
  );

  return { options, fields };
};

export default usePartnerClientFilters;
