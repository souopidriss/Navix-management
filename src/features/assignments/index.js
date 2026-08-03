/**
 * Navix Assignments — API publique du module Affectations
 * --------------------------------------------------------------------------
 * Expose les éléments non-composants consommés par le reste de
 * l'application (constants, hooks, services, stores, schémas, pages).
 * Les composants sont importés via `./components`.
 */
export { default as AssignmentListPage } from './pages/AssignmentListPage';
export { default as AssignmentDetailsPage } from './pages/AssignmentDetailsPage';
export { default as AssignmentCreatePage } from './pages/AssignmentCreatePage';
export { default as AssignmentEditPage } from './pages/AssignmentEditPage';
export { default as AssignmentHistoryPage } from './pages/AssignmentHistoryPage';

export * from './constants';
export * from './hooks';
export * from './schemas';

export { assignmentService } from './services';
export { useAssignmentsStore } from './store';
