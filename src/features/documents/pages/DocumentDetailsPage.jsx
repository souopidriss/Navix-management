/**
 * Navix Documents — DocumentDetailsPage
 * --------------------------------------------------------------------------
 * Détail d'un document : en-tête (nom, badges, actions Aperçu / Télécharger
 * / Modifier / Supprimer), fiche d'informations (entreprise, ressource,
 * visibilité, auteur, dates, version), description, historique et modale de
 * suppression.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState } from '@/components/core';
import { ROUTES, documentEditPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '@/features/vehicles';
import { useDriversStore } from '@/features/drivers';
import { useMaintenanceStore } from '@/features/maintenance';
import { useTripsStore } from '@/features/trips';
import { useFuelStore } from '@/features/fuel';
import { useCan, PERMISSIONS } from '@/features/rbac';
import { useDocumentsStore } from '../store';
import {
  DocumentTypeBadge,
  DocumentVisibilityBadge,
  DocumentAssociationBadge,
  DocumentVersionBadge,
  DocumentPreview,
  DocumentTimeline,
  DeleteDocumentModal,
} from '../components';
import { formatDocumentSize, formatDocumentLongDate, getDocumentType } from '../constants';
import './DocumentDetailsPage.css';

const InfoRow = ({ icon, label, children }) => (
  <div className="d-flex align-items-start justify-content-between gap-3 py-1">
    <dt className="text-secondary mb-0">
      <i className={`bi ${icon} me-1`} aria-hidden="true" /> {label}
    </dt>
    <dd className="mb-0 text-end min-w-0">{children}</dd>
  </div>
);

const DocumentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedDocument = useDocumentsStore((state) => state.selectedDocument);
  const fileTypes = useDocumentsStore((state) => state.fileTypes);
  const isLoading = useDocumentsStore((state) => state.isLoading);
  const error = useDocumentsStore((state) => state.error);
  const fetchDocument = useDocumentsStore((state) => state.fetchDocument);
  const fetchFileTypes = useDocumentsStore((state) => state.fetchFileTypes);
  const deleteDocument = useDocumentsStore((state) => state.deleteDocument);
  const downloadDocument = useDocumentsStore((state) => state.downloadDocument);
  const clearError = useDocumentsStore((state) => state.clearError);

  const can = useCan();
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

  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (id) fetchDocument(id);
    fetchFileTypes();
    fetchCompanies();
    fetchVehicles();
    fetchDrivers();
    fetchMaintenanceRecords();
    fetchTrips();
    fetchFuelRecords();
  }, [
    id,
    fetchDocument,
    fetchFileTypes,
    fetchCompanies,
    fetchVehicles,
    fetchDrivers,
    fetchMaintenanceRecords,
    fetchTrips,
    fetchFuelRecords,
  ]);

  const companyById = useMemo(
    () => Object.fromEntries(companies.map((company) => [company.id, company])),
    [companies],
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
  const fileTypesById = useMemo(
    () => Object.fromEntries(fileTypes.map((fileType) => [fileType.id, fileType])),
    [fileTypes],
  );

  const document = selectedDocument?.id === id ? selectedDocument : null;
  const fileType = document ? fileTypesById[document.fileTypeId] : null;

  const resourceLabel = (doc) => {
    switch (doc?.associationType) {
      case 'company':
        return companyById[doc.associationId]?.name ?? '';
      case 'vehicle':
        return vehicleById[doc.associationId]?.registrationNumber ?? '';
      case 'driver':
        return driverById[doc.associationId]?.fullName ?? '';
      case 'maintenance':
        return maintenanceById[doc.associationId]?.maintenanceNumber ?? '';
      case 'trip':
        return tripById[doc.associationId]?.tripNumber ?? '';
      case 'fuel':
        return fuelById[doc.associationId]?.fuelNumber ?? '';
      default:
        return '';
    }
  };

  const handleDownload = async (doc) => {
    setDownloading(true);
    const result = await downloadDocument(doc.id);
    setDownloading(false);

    if (result.success) {
      toast.success(`Téléchargement simulé de « ${doc.name} ».`);
    } else {
      toast.error(result.error || 'Échec du téléchargement.');
    }
  };

  const handleDelete = async () => {
    if (!document) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteDocument(document.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success(`Le document « ${document.name} » a été supprimé.`);
      navigate(ROUTES.FILES);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer le document.');
    }
  };

  const closeDelete = () => {
    setDeleteOpen(false);
    setDeleteError('');
  };

  return (
    <PageContainer>
      <Helmet>
        <title>{document ? `${document.name} — Navix Management` : 'Document — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title={document ? document.name : 'Document'}
        subtitle={document ? formatDocumentSize(document.size) : undefined}
        icon="bi-folder2-open"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Documents', to: ROUTES.FILES },
          { label: document ? document.name : '…' },
        ]}
        actions={
          document ? (
            <div className="d-flex gap-2 flex-wrap">
              <Button variant="outline" icon="bi-eye" onClick={() => setPreviewOpen(true)}>
                Aperçu
              </Button>
              {canDownload && (
                <Button variant="outline" icon="bi-download" onClick={() => handleDownload(document)} loading={downloading}>
                  Télécharger
                </Button>
              )}
              {canEdit && (
                <Button variant="outline" icon="bi-pencil" onClick={() => navigate(documentEditPath(document.id))}>
                  Modifier
                </Button>
              )}
              {canDelete && (
                <Button variant="danger" icon="bi-trash3" onClick={() => setDeleteOpen(true)}>
                  Supprimer
                </Button>
              )}
            </div>
          ) : undefined
        }
      />

      {isLoading && !document ? (
        <LoadingState variant="text" lines={6} label="Chargement du document…" />
      ) : error || !document ? (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error || 'Document introuvable.'}
        </Alert>
      ) : (
        <>
          <Card className="mb-3">
            <div className="d-flex flex-column flex-md-row gap-4 align-items-md-start">
              <span className="navix-doc-detail__tile" aria-hidden="true">
                <i className={`bi ${getDocumentType(String(fileType?.title ?? '').toLowerCase()).icon}`} />
              </span>
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex flex-wrap gap-2 mb-2">
                  <DocumentTypeBadge fileType={fileType} />
                  <DocumentVisibilityBadge visibility={document.visibility} />
                  <DocumentVersionBadge version={document.version} />
                  <DocumentAssociationBadge
                    associationType={document.associationType}
                    resourceLabel={resourceLabel(document)}
                  />
                </div>
                {document.description && <p className="mb-0">{document.description}</p>}
              </div>
            </div>
          </Card>

          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <Card>
                <h3 className="h6 mb-3">Informations</h3>
                <dl className="mb-0">
                  <InfoRow icon="bi-file-earmark" label="Extension">
                    {document.extension || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-filetype" label="Type MIME">
                    {document.mimeType || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-folder" label="Dossier">
                    {document.directory || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-hdd" label="Taille">
                    {formatDocumentSize(document.size)}
                  </InfoRow>
                  <InfoRow icon="bi-buildings" label="Entreprise">
                    {companyById[document.companyId]?.name ?? '—'}
                  </InfoRow>
                  <InfoRow icon="bi-person" label="Téléversé par">
                    {document.uploadedBy || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-calendar3" label="Ajouté le">
                    {formatDocumentLongDate(document.createdAt)}
                  </InfoRow>
                  <InfoRow icon="bi-pencil" label="Modifié le">
                    {formatDocumentLongDate(document.updatedAt)}
                  </InfoRow>
                </dl>
              </Card>
            </div>

            <div className="col-12 col-lg-6">
              <Card>
                <h3 className="h6 mb-3">Historique</h3>
                <DocumentTimeline document={document} />
              </Card>
            </div>
          </div>
        </>
      )}

      <DocumentPreview
        document={document}
        fileType={fileType}
        companyName={document ? companyById[document.companyId]?.name : '—'}
        resourceLabel={document ? resourceLabel(document) : ''}
        onDownload={canDownload ? handleDownload : undefined}
        downloading={canDownload ? downloading : false}
        onClose={() => setPreviewOpen(false)}
        open={previewOpen}
      />

      <DeleteDocumentModal
        document={document}
        open={deleteOpen}
        loading={isDeleting}
        error={deleteError}
        onConfirm={handleDelete}
        onClose={closeDelete}
      />
    </PageContainer>
  );
};

export default DocumentDetailsPage;
