/**
 * Navix Documents — DocumentListPage
 * --------------------------------------------------------------------------
 * Liste des documents : statistiques, recherche instantanée, filtres, tri,
 * pagination, états chargement / erreur / vide, aperçu et suppression.
 * Responsive : tableau sur desktop (vue liste), grille de cartes sur
 * tablette / mobile ou en vue grille explicite.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  Pagination,
  SearchBar,
  LoadingState,
  EmptyState,
} from '@/components/core';
import { ROUTES, documentDetailPath, documentEditPath } from '@/routes/route.constants';
import { useMediaQuery } from '@/hooks';
import { useCan, PERMISSIONS } from '@/features/rbac';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '@/features/vehicles';
import { useDriversStore } from '@/features/drivers';
import { useMaintenanceStore } from '@/features/maintenance';
import { useTripsStore } from '@/features/trips';
import { useFuelStore } from '@/features/fuel';
import { useDocumentsStore } from '../store';
import { useDocumentListData } from '../hooks';
import { DOCUMENT_ICON } from '../constants';
import {
  DocumentStatsCards,
  DocumentFilters,
  DocumentTable,
  DocumentCard,
  DocumentPreview,
  DeleteDocumentModal,
} from '../components';

const DocumentListPage = () => {
  const navigate = useNavigate();

  const documents = useDocumentsStore((state) => state.documents);
  const fileTypes = useDocumentsStore((state) => state.fileTypes);
  const statistics = useDocumentsStore((state) => state.statistics);
  const search = useDocumentsStore((state) => state.search);
  const filters = useDocumentsStore((state) => state.filters);
  const sort = useDocumentsStore((state) => state.sort);
  const pageSize = useDocumentsStore((state) => state.pagination.pageSize);
  const viewMode = useDocumentsStore((state) => state.viewMode);
  const isLoading = useDocumentsStore((state) => state.isLoading);
  const error = useDocumentsStore((state) => state.error);
  const fetchDocuments = useDocumentsStore((state) => state.fetchDocuments);
  const fetchStatistics = useDocumentsStore((state) => state.fetchStatistics);
  const fetchFileTypes = useDocumentsStore((state) => state.fetchFileTypes);
  const setSearch = useDocumentsStore((state) => state.setSearch);
  const setFilter = useDocumentsStore((state) => state.setFilter);
  const resetFilters = useDocumentsStore((state) => state.resetFilters);
  const setSort = useDocumentsStore((state) => state.setSort);
  const setPage = useDocumentsStore((state) => state.setPage);
  const setPageSize = useDocumentsStore((state) => state.setPageSize);
  const setViewMode = useDocumentsStore((state) => state.setViewMode);
  const deleteDocument = useDocumentsStore((state) => state.deleteDocument);
  const downloadDocument = useDocumentsStore((state) => state.downloadDocument);
  const clearError = useDocumentsStore((state) => state.clearError);

  const can = useCan();
  const canUpload = can(PERMISSIONS.FILES_CREATE);
  const canManageTypes = can(PERMISSIONS.FILES_MANAGE);
  const canEdit = can(PERMISSIONS.FILES_UPDATE);
  const canDelete = can(PERMISSIONS.FILES_DELETE);
  const canDownload = can(PERMISSIONS.FILES_DOWNLOAD);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);
  const vehicles = useVehiclesStore((state) => state.vehicles);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);
  const drivers = useDriversStore((state) => state.drivers);
  const fetchDrivers = useDriversStore((state) => state.fetchDrivers);
  const maintenanceRecords = useMaintenanceStore((state) => state.maintenanceRecords);
  const fetchMaintenanceRecords = useMaintenanceStore((state) => state.fetchMaintenanceRecords);
  const trips = useTripsStore((state) => state.trips);
  const fetchTrips = useTripsStore((state) => state.fetchTrips);
  const fuelRecords = useFuelStore((state) => state.fuelRecords);
  const fetchFuelRecords = useFuelStore((state) => state.fetchFuelRecords);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [previewTarget, setPreviewTarget] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const isCompact = useMediaQuery('(max-width: 991.98px)');

  const companyById = useMemo(
    () => Object.fromEntries(companies.map((company) => [company.id, company])),
    [companies],
  );
  const fileTypesById = useMemo(
    () => Object.fromEntries(fileTypes.map((fileType) => [fileType.id, fileType])),
    [fileTypes],
  );
  const vehicleById = useMemo(
    () => Object.fromEntries(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles],
  );
  const driverById = useMemo(
    () => Object.fromEntries(drivers.map((driver) => [driver.id, driver])),
    [drivers],
  );
  const maintenanceById = useMemo(
    () => Object.fromEntries(maintenanceRecords.map((record) => [record.id, record])),
    [maintenanceRecords],
  );
  const tripById = useMemo(
    () => Object.fromEntries(trips.map((trip) => [trip.id, trip])),
    [trips],
  );
  const fuelById = useMemo(
    () => Object.fromEntries(fuelRecords.map((record) => [record.id, record])),
    [fuelRecords],
  );

  const resourceLabel = useCallback(
    (document) => {
      switch (document.associationType) {
        case 'company':
          return companyById[document.associationId]?.name ?? '';
        case 'vehicle':
          return vehicleById[document.associationId]?.registrationNumber ?? '';
        case 'driver':
          return driverById[document.associationId]?.fullName ?? '';
        case 'maintenance':
          return maintenanceById[document.associationId]?.maintenanceNumber ?? '';
        case 'trip':
          return tripById[document.associationId]?.tripNumber ?? '';
        case 'fuel':
          return fuelById[document.associationId]?.fuelNumber ?? '';
        default:
          return '';
      }
    },
    [companyById, vehicleById, driverById, maintenanceById, tripById, fuelById],
  );

  const { items, totalItems, totalPages, page } = useDocumentListData(
    companyById,
    fileTypesById,
    resourceLabel,
  );

  useEffect(() => {
    fetchDocuments();
    fetchStatistics();
    fetchFileTypes();
    fetchCompanies();
    fetchVehicles();
    fetchDrivers();
    fetchMaintenanceRecords();
    fetchTrips();
    fetchFuelRecords();
  }, [
    fetchDocuments,
    fetchStatistics,
    fetchFileTypes,
    fetchCompanies,
    fetchVehicles,
    fetchDrivers,
    fetchMaintenanceRecords,
    fetchTrips,
    fetchFuelRecords,
  ]);

  const hasActiveFilters = Boolean(
    search.trim() ||
      filters.companyId ||
      filters.fileTypeId ||
      filters.associationType ||
      filters.visibility ||
      filters.size ||
      filters.period ||
      filters.extension,
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteDocument(deleteTarget.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success(`Le document « ${deleteTarget.name} » a été supprimé.`);
      setDeleteTarget(null);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer le document.');
    }
  };

  const closeDelete = () => {
    setDeleteTarget(null);
    setDeleteError('');
  };

  const handleDownload = async (document) => {
    setDownloading(true);
    const result = await downloadDocument(document.id);
    setDownloading(false);

    if (result.success) {
      toast.success(`Téléchargement simulé de « ${document.name} ».`);
    } else {
      toast.error(result.error || 'Échec du téléchargement.');
    }
  };

  const breadcrumbs = [{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Documents' }];

  const headerActions = (
    <div className="d-flex gap-2 flex-wrap">
      <div className="btn-group" role="group" aria-label="Mode d’affichage">
        <Button
          variant={viewMode === 'list' ? 'primary' : 'outline'}
          size="sm"
          icon="bi-list-ul"
          onClick={() => setViewMode('list')}
          title="Vue liste"
          aria-label="Vue liste"
        />
        <Button
          variant={viewMode === 'grid' ? 'primary' : 'outline'}
          size="sm"
          icon="bi-grid-3x3-gap"
          onClick={() => setViewMode('grid')}
          title="Vue grille"
          aria-label="Vue grille"
        />
      </div>
      {canManageTypes && (
        <Button variant="outline" icon="bi-file-earmark-binary" onClick={() => navigate(ROUTES.FILE_TYPES)}>
          Types de fichiers
        </Button>
      )}
      {canUpload && (
        <Button variant="primary" icon="bi-cloud-arrow-up" onClick={() => navigate(ROUTES.FILES_CREATE)}>
          Téléverser
        </Button>
      )}
    </div>
  );

  return (
    <PageContainer>
      <Helmet>
        <title>Documents — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Documents"
        subtitle="Centralisez, classez et consultez les fichiers de votre parc."
        icon={DOCUMENT_ICON}
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      <DocumentStatsCards statistics={statistics} loading={isLoading && !statistics} />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <SearchBar value={search} onChange={setSearch} resultCount={totalItems} placeholder="Rechercher un document…" />

      <DocumentFilters
        filters={filters}
        companies={companies}
        fileTypes={fileTypes}
        onChange={setFilter}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isLoading && documents.length === 0 ? (
        <LoadingState variant="table" rows={6} cols={6} label="Chargement des documents…" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={DOCUMENT_ICON}
          title="Aucun document"
          description={
            hasActiveFilters
              ? 'Aucun document ne correspond aux critères sélectionnés.'
              : 'Téléversez votre premier document pour démarrer.'
          }
          action={
            hasActiveFilters ? (
              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {viewMode === 'grid' || isCompact ? (
            <div className="row g-3">
              {items.map((document) => (
                <div key={document.id} className="col-12 col-sm-6 col-xl-4">
                  <DocumentCard
                    document={document}
                    fileType={fileTypesById[document.fileTypeId]}
                    companyName={companyById[document.companyId]?.name}
                    resourceLabel={resourceLabel(document)}
                    onView={(id) => navigate(documentDetailPath(id))}
                    onPreview={setPreviewTarget}
                    onEdit={(id) => navigate(documentEditPath(id))}
                    onDelete={setDeleteTarget}
                    canEdit={canEdit}
                    canDelete={canDelete}
                  />
                </div>
              ))}
            </div>
          ) : (
            <DocumentTable
              documents={items}
              fileTypesById={fileTypesById}
              companyById={companyById}
              resourceLabel={resourceLabel}
              sort={sort}
              onSortChange={(by, direction) => setSort(by, direction)}
              onView={(id) => navigate(documentDetailPath(id))}
              onPreview={setPreviewTarget}
              onEdit={(id) => navigate(documentEditPath(id))}
              onDelete={setDeleteTarget}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          )}

          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      <DocumentPreview
        open={Boolean(previewTarget)}
        document={previewTarget}
        fileType={previewTarget ? fileTypesById[previewTarget.fileTypeId] : null}
        companyName={previewTarget ? companyById[previewTarget.companyId]?.name : '—'}
        resourceLabel={previewTarget ? resourceLabel(previewTarget) : ''}
        onDownload={canDownload ? handleDownload : undefined}
        onClose={() => setPreviewTarget(null)}
        downloading={canDownload ? downloading : false}
      />

      <DeleteDocumentModal
        document={deleteTarget}
        open={Boolean(deleteTarget)}
        loading={isDeleting}
        error={deleteError}
        onConfirm={handleDelete}
        onClose={closeDelete}
      />
    </PageContainer>
  );
};

export default DocumentListPage;
