/**
 * Navix Reports — useReportPreferences
 * --------------------------------------------------------------------------
 * Préférences d'affichage des rapports issues du centre de configuration
 * (SettingsStore) : devise, unité de distance et unité de carburant.
 * Les sections « général » et « flotte » sont chargées à la demande si
 * absentes du store (aucune valeur codée en dur dans les composants).
 */
import { useEffect, useMemo } from 'react';
import { useSettingsStore } from '@/features/settings/store';
import { DEFAULT_CURRENCY } from '../constants';

const FALLBACK_DISTANCE_UNIT = 'km';
const FALLBACK_FUEL_UNIT = 'liter';

export const useReportPreferences = () => {
  const general = useSettingsStore((state) => state.general);
  const fleet = useSettingsStore((state) => state.fleet);
  const loading = useSettingsStore((state) => state.loading);
  const fetchSection = useSettingsStore((state) => state.fetchSection);

  useEffect(() => {
    if (!general) fetchSection('general');
    if (!fleet) fetchSection('fleet');
  }, [general, fleet, fetchSection]);

  return useMemo(
    () => ({
      currency: general?.currency ?? DEFAULT_CURRENCY,
      distanceUnit: fleet?.distanceUnit ?? FALLBACK_DISTANCE_UNIT,
      fuelUnit: fleet?.fuelUnit ?? FALLBACK_FUEL_UNIT,
      loading,
    }),
    [general, fleet, loading],
  );
};
