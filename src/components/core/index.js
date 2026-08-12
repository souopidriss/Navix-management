/**
 * Navix Core — Bibliothèque interne de composants UI génériques.
 * --------------------------------------------------------------------------
 * Source unique des composants réutilisables pour TOUS les modules métier.
 * Aucun composant ne connaît le métier (Vehicle, Driver, Fuel, Trip…).
 *
 * Primitives pré-existantes ré-exportées (source unique de vérité) :
 *   Avatar, Pagination, PageContainer, PageHeader
 */
export { default as Avatar } from './Avatar';
export { default as Pagination } from './Pagination';
export { default as PageContainer } from './PageContainer';
export { default as PageHeader } from './PageHeader';

export { default as DataTable } from './DataTable';
export { default as SearchBar } from './SearchBar';
export { default as FilterBar } from './FilterBar';
export { default as Toolbar } from './Toolbar';
export { default as StatsCards } from './StatsCards';
export { default as MetricCard } from './MetricCard';
export { default as StatusBadge } from './StatusBadge';

export { default as FormModal } from './FormModal';
export { default as DeleteModal } from './DeleteModal';
export { default as ConfirmDialog } from './ConfirmDialog';
export { default as ActionDropdown } from './ActionDropdown';

export { default as EmptyState } from './EmptyState';
export { default as LoadingState } from './LoadingState';
export { default as ErrorState } from './ErrorState';
export { default as Timeline } from './Timeline';

export { default as FileUploader } from './FileUploader';
export { default as ImagePreview } from './ImagePreview';
export { default as ExportButton } from './ExportButton';
