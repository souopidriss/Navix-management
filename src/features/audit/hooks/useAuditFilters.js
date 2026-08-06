/**
 * Navix Audit — Visibilité des filtres avancés
 * --------------------------------------------------------------------------
 * Gère l'ouverture/fermeture du panneau de filtres de la page Journal des
 * actions, ainsi que l'état « filtres actifs » (indicateur sur le bouton).
 */
import { useMemo, useState } from 'react';
import { useAuditStore } from '../store';

const FILTER_KEYS = [
  'companyId',
  'agencyId',
  'userId',
  'action',
  'actionType',
  'resourceType',
  'status',
  'severity',
  'period',
  'dateFrom',
  'dateTo',
];

export const useAuditFilters = () => {
  const [isOpen, setIsOpen] = useState(false);
  const filters = useAuditStore((state) => state.filters);

  const activeCount = useMemo(
    () => Object.entries(filters).filter(([key, value]) => FILTER_KEYS.includes(key) && value).length,
    [filters],
  );

  return {
    isOpen,
    activeCount,
    toggle: () => setIsOpen((open) => !open),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
};
