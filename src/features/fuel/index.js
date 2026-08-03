/**
 * Navix Fuel — API publique du module Carburant
 * --------------------------------------------------------------------------
 * Expose les éléments non-composants consommés par le reste de
 * l'application (constants, hooks, services, stores, schémas, pages).
 * Les composants sont importés via `./components`.
 */
export { default as FuelListPage } from './pages/FuelListPage';
export { default as FuelDetailsPage } from './pages/FuelDetailsPage';
export { default as FuelCreatePage } from './pages/FuelCreatePage';
export { default as FuelEditPage } from './pages/FuelEditPage';
export { default as FuelStatisticsPage } from './pages/FuelStatisticsPage';

export * from './constants';
export * from './hooks';
export * from './schemas';

export { fuelService } from './services';
export { useFuelStore } from './store';
