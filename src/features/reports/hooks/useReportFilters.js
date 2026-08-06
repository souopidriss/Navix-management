/**
 * Navix Reports — Filtres de rapport
 * --------------------------------------------------------------------------
 * Gère l'ouverture du panneau de filtres et l'état « filtres actifs ».
 * Les options des listes (entreprises, agences, véhicules, chauffeurs) sont
 * fournies par le service (fonctions pures de `report.aggregate`).
 */
import { useEffect, useMemo, useState } from 'react';
import { useReportStore } from '../store';
import {
  buildCompaniesOptions,
  buildAgenciesOptions,
  buildVehiclesOptions,
  buildDriversOptions,
} from '../services';
import { REPORT_PERIODS } from '../constants';

const FILTER_KEYS = [
  'companyId',
  'agencyId',
  'vehicleGroup',
  'vehicleId',
  'driverId',
  'status',
  'planCode',
  'tripType',
  'maintenanceType',
  'documentCategory',
];

export const useReportFilters = () => {
  const [isOpen, setIsOpen] = useState(false);
  const filters = useReportStore((state) => state.filters);

  const options = useMemo(
    () => ({
      companies: buildCompaniesOptions(),
      agencies: buildAgenciesOptions(),
      vehicles: buildVehiclesOptions(),
      drivers: buildDriversOptions(),
    }),
    [],
  );

  const periodOptions = useMemo(
    () => Object.entries(REPORT_PERIODS).map(([value, meta]) => ({ value, label: meta.label })),
    [],
  );

  const activeCount = useMemo(
    () => Object.entries(filters).filter(([key, value]) => FILTER_KEYS.includes(key) && value).length,
    [filters],
  );

  useEffect(() => {
    const close = () => setIsOpen(false);
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
    return () => window.removeEventListener('keydown', close);
  }, []);

  return {
    isOpen,
    activeCount,
    options,
    periodOptions,
    toggle: () => setIsOpen((open) => !open),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
};
