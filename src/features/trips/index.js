/**
 * Navix Trips — API publique du module Trajets
 * --------------------------------------------------------------------------
 * Expose les éléments non-composants consommés par le reste de
 * l'application (constants, hooks, services, stores, schémas, pages).
 * Les composants sont importés via `./components`.
 */
export { default as TripListPage } from './pages/TripListPage';
export { default as TripDetailsPage } from './pages/TripDetailsPage';
export { default as TripCreatePage } from './pages/TripCreatePage';
export { default as TripEditPage } from './pages/TripEditPage';
export { default as TripHistoryPage } from './pages/TripHistoryPage';

export * from './constants';
export * from './hooks';
export * from './schemas';

export { tripService } from './services';
export { useTripsStore } from './store';
