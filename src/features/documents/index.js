/**
 * Navix Documents — API publique du module Documents
 * --------------------------------------------------------------------------
 * Expose les pages, constantes, hooks, schémas, service et store du module.
 * Les composants métier sont importés via `./components`.
 */
export { default as DocumentListPage } from './pages/DocumentListPage';
export { default as DocumentDetailsPage } from './pages/DocumentDetailsPage';
export { default as DocumentCreatePage } from './pages/DocumentCreatePage';
export { default as DocumentEditPage } from './pages/DocumentEditPage';
export { default as FileTypesPage } from './pages/FileTypesPage';

export * from './constants';
export * from './hooks';
export * from './schemas';

export { documentService } from './services';
export { useDocumentsStore } from './store';
