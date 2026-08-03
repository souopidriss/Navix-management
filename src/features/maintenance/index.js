/**
 * Navix Maintenance — API publique du module Entretiens
 * --------------------------------------------------------------------------
 * Expose les éléments non-composants consommés par le reste de
 * l'application (constants, hooks, services, stores, schémas, pages).
 * Les composants sont importés via `./components`.
 */
export { default as MaintenanceListPage } from './pages/MaintenanceListPage';
export { default as MaintenanceDetailsPage } from './pages/MaintenanceDetailsPage';
export { default as MaintenanceCreatePage } from './pages/MaintenanceCreatePage';
export { default as MaintenanceEditPage } from './pages/MaintenanceEditPage';
export { default as MaintenanceCalendarPage } from './pages/MaintenanceCalendarPage';
export { default as MaintenanceStatisticsPage } from './pages/MaintenanceStatisticsPage';

export * from './constants';
export * from './hooks';
export * from './schemas';

export { maintenanceService } from './services';
export { useMaintenanceStore } from './store';
