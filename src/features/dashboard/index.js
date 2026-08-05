/**
 * Navix Dashboard — API publique du module Tableau de bord
 * --------------------------------------------------------------------------
 * Expose les éléments non-composants consommés par le reste de
 * l'application (constants, hooks, services, stores, pages).
 * Les composants sont importés via `./components`.
 */
export { default as DashboardPage } from './pages/DashboardPage';

export * from './constants';
export * from './hooks';

export { dashboardService } from './services';
export { useDashboardStore } from './store';
