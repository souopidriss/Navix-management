import { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  SearchBar,
  FilterBar,
  MetricCard,
  Pagination,
  DeleteModal,
} from '@/components/core';
import { Can } from '@/features/rbac/components';
import { useCan } from '@/features/rbac/hooks';
import { PERMISSIONS } from '@/features/rbac/constants';
import {
  getDocumentCategory,
  getDocumentCategoryKind,
  formatDocumentDate,
  formatDocumentSize,
} from '@/features/documents/constants';
import { ROUTES } from '@/routes/route.constants';
import { useClientData } from '../hooks/useClientData';
import { useClientVehicles } from '../hooks/useClientVehicles';
import { useClientDrivers } from '../hooks/useClientDrivers';
import { useClientDocuments } from '../hooks/useClientDocuments';
import ClientDocumentUploadModal from '../components/ClientDocuments/ClientDocumentUploadModal';
import '../components/ClientDocuments/ClientDocuments.css';

const CATEGORY_FILTER_OPTIONS = [
  { value: '', label: 'Toutes les catégories' },
  { value: 'carte_grise', label: 'Carte grise' },
  { value: 'assurance', label: 'Assurance' },
  { value: 'visite_technique', label: 'Visite technique' },
  { value: 'permis', label: 'Permis' },
  { value: 'cni', label: 'Pièce d’identité' },
  { value: 'facture', label: 'Facture' },
  { value: 'bon_carburant', label: 'Bon carburant' },
  { value: 'ordre_mission', label: 'Ordre de mission' },
  { value: 'photo', label: 'Photo' },
  { value: 'contrat', label: 'Contrat' },
  { value: 'rapport', label: 'Rapport' },
];

const EXPIRY_FILTER_OPTIONS = [
  { value: '', label: 'Tous les documents' },
  { value: 'expired', label: 'Expirés' },
  { value: 'expiring', label: 'Bientôt expirés (30 j)' },
  { value: 'valid', label: 'Valides' },
  { value: 'no_expiry', label: 'Sans date d’expiration' },
];

const RESOURCE_FILTER_OPTIONS = [
  { value: '', label: 'Toutes les ressources' },
  { value: 'vehicle', label: 'Véhicules' },
  { value: 'driver', label: 'Chauffeurs' },
  { value: 'company', label: 'Entreprise' },
];

const toDays = (value) => {
  if (!value) return null;
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((date.getTime() - Date.now()) / 86400000);
};

const EXPIRY_WARNING_DAYS = 30;

const getExpiryStatus = (document) => {
  if (!document.expiryDate) return 'no_expiry';
  const days = toDays(document.expiryDate);
  if (days === null) return 'no_expiry';
  if (days < 0) return 'expired';
  if (days <= EXPIRY_WARNING_DAYS) return 'expiring';
  return 'valid';
};

const ClientDocumentsPage = () => {
  const { currentClient, isEnterprise } = useClientData();
  const { vehicles } = useClientVehicles();
  const { drivers } = useClientDrivers();
  const {
    documents,
    isLoading,
    error,
    refetch,
    uploadDocument,
    downloadDocument,
    deleteDocument,
  } = useClientDocuments();
  const can = useCan();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', expiry: '', resource: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const hasActiveFilters = Boolean(search.trim() || filters.category || filters.expiry || filters.resource);

  const vehicleById = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);
  const driverById = useMemo(() => new Map(drivers.map((d) => [d.id, d])), [drivers]);

  const getResourceLabel = useCallback(
    (document) => {
      if (document.associationType === 'vehicle') {
        const vehicle = vehicleById.get(document.associationId);
        return vehicle ? `${vehicle.brand} ${vehicle.model} · ${vehicle.registrationNumber}` : document.associationId;
      }
      if (document.associationType === 'driver') {
        const driver = driverById.get(document.associationId);
        return driver ? driver.fullName : document.associationId;
      }
      return 'Entreprise TEC';
    },
    [vehicleById, driverById],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return documents.filter((document) => {
      if (filters.category && document.category !== filters.category) return false;
      if (filters.expiry && getExpiryStatus(document) !== filters.expiry) return false;
      if (filters.resource && document.associationType !== filters.resource) return false;
      if (!query) return true;
      const haystack = [document.name, document.description, getResourceLabel(document)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [documents, search, filters, getResourceLabel]);

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const counts = useMemo(() => {
    const result = { total: documents.length, expired: 0, expiring: 0, valid: 0, no_expiry: 0 };
    documents.forEach((document) => {
      result[getExpiryStatus(document)] += 1;
    });
    return result;
  }, [documents]);

  const totalSize = useMemo(
    () => documents.reduce((sum, document) => sum + Number(document.size || 0), 0),
    [documents],
  );

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ category: '', expiry: '', resource: '' });
  };

  const openUpload = () => {
    setUploadError('');
    setUploadOpen(true);
  };

  const handleUpload = async (payload) => {
    setIsUploading(true);
    setUploadError('');
    try {
      await uploadDocument(payload);
      toast.success('Document téléversé.');
      setUploadOpen(false);
      refetch();
    } catch (err) {
      setUploadError(err?.message || 'Impossible de téléverser le document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      await downloadDocument(document.id);
      toast.success(`Téléchargement de « ${document.name} » simulé.`);
      refetch();
    } catch (err) {
      toast.error(err?.message || 'Impossible de télécharger le document.');
    }
  };

  const openDelete = (document) => {
    setDeleteTarget(document);
    setDeleteError('');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteDocument(deleteTarget.id);
      toast.success('Document supprimé.');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      setDeleteError(err?.message || 'Impossible de supprimer le document.');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderExpiryBadge = (document) => {
    const status = getExpiryStatus(document);
    if (status === 'expired') {
      return (
        <span className="badge text-bg-danger">
          <i className="bi bi-x-octagon me-1" aria-hidden="true" />
          Expiré le {formatDocumentDate(document.expiryDate)}
        </span>
      );
    }
    if (status === 'expiring') {
      return (
        <span className="badge text-bg-warning">
          <i className="bi bi-clock-history me-1" aria-hidden="true" />
          Expire le {formatDocumentDate(document.expiryDate)}
        </span>
      );
    }
    if (status === 'valid') {
      return (
        <span className="badge text-bg-success">
          <i className="bi bi-check2-circle me-1" aria-hidden="true" />
          Valide jusqu’au {formatDocumentDate(document.expiryDate)}
        </span>
      );
    }
    return (
      <span className="badge text-bg-secondary">
        <i className="bi bi-dash-circle me-1" aria-hidden="true" />
        Sans expiration
      </span>
    );
  };

  if (isLoading && documents.length === 0) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement de vos documents…" />
      </PageContainer>
    );
  }

  if (error && documents.length === 0) {
    return (
      <PageContainer>
        <ErrorState
          title="Impossible de charger vos documents"
          description="Les données sont temporairement indisponibles."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Documents — Navix Client</title>
      </Helmet>

      <PageHeader
        title="Documents"
        subtitle={
          isEnterprise
            ? `Espace documentaire de la flotte de ${currentClient?.companyName || 'votre entreprise'} : cartes grises, assurances, contrats… 🇨🇲.`
            : 'L’espace documentaire n’est pas disponible pour un client particulier.'
        }
        icon="bi-folder2-open"
        breadcrumbs={[{ label: 'Espace Client', to: ROUTES.CLIENT_DASHBOARD }, { label: 'Documents' }]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Can permission={PERMISSIONS.CLIENT_DOCUMENTS_CREATE}>
              <Button variant="primary" size="sm" icon="bi-cloud-arrow-up" onClick={openUpload}>
                Téléverser un document
              </Button>
            </Can>
            <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={refetch} aria-label="Actualiser">
              <span className="visually-hidden">Actualiser</span>
            </Button>
          </div>
        }
      />

      {!isEnterprise ? (
        <EmptyState
          icon="bi-folder2-open"
          title="Documents indisponibles"
          description="En tant que client particulier, l’espace documentaire n’est pas disponible. Basculez en profil Entreprise pour accéder à vos documents."
        />
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-3">
              <MetricCard label="Documents" value={counts.total} icon="bi-file-earmark-text" variant="primary" />
            </div>
            <div className="col-6 col-lg-3">
              <MetricCard label="Expirés" value={counts.expired} icon="bi-x-octagon" variant="danger" />
            </div>
            <div className="col-6 col-lg-3">
              <MetricCard label="Bientôt expirés" value={counts.expiring} icon="bi-clock-history" variant="warning" />
            </div>
            <div className="col-6 col-lg-3">
              <MetricCard label="Espace utilisé" value={formatDocumentSize(totalSize)} icon="bi-hdd-stack" variant="info" />
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <div className="navix-ops-toolbar">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Rechercher (nom, description, véhicule…)"
                  resultCount={totalItems}
                  aria-label="Rechercher parmi mes documents"
                />
                <FilterBar
                  fields={[
                    {
                      key: 'category',
                      type: 'select',
                      label: 'Catégorie',
                      options: CATEGORY_FILTER_OPTIONS,
                      allLabel: 'Toutes les catégories',
                    },
                    {
                      key: 'expiry',
                      type: 'select',
                      label: 'Expiration',
                      options: EXPIRY_FILTER_OPTIONS,
                      allLabel: 'Tous les documents',
                    },
                    {
                      key: 'resource',
                      type: 'select',
                      label: 'Ressource',
                      options: RESOURCE_FILTER_OPTIONS,
                      allLabel: 'Toutes les ressources',
                    },
                  ]}
                  values={filters}
                  onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
                  onReset={handleResetFilters}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon="bi-file-earmark-text"
              title={hasActiveFilters ? 'Aucun document ne correspond' : 'Aucun document'}
              description={
                hasActiveFilters
                  ? 'Modifiez vos critères de recherche ou réinitialisez les filtres.'
                  : 'Téléversez votre premier document pour bâtir votre espace documentaire.'
              }
            />
          ) : (
            <div className="navix-client-docs-grid">
              {pageItems.map((document) => {
                const category = getDocumentCategory(document.associationType, document.category);
                const kind = getDocumentCategoryKind(category.value);
                const icon =
                  kind === 'image' ? 'bi-image' : kind === 'pdf' ? 'bi-file-earmark-pdf' : kind === 'office' ? 'bi-file-earmark-text' : 'bi-file-earmark';
                return (
                  <article className="navix-client-doc-card" key={document.id}>
                    <div className="d-flex align-items-start gap-3">
                      <span
                        className={`navix-client-doc-card__icon bg-${category.icon ? 'primary' : 'secondary'}-soft text-primary`}
                        aria-hidden="true"
                      >
                        <i className={`bi ${icon}`} />
                      </span>
                      <div className="flex-grow-1 min-w-0">
                        <h3 className="navix-client-doc-card__title text-truncate" title={document.name}>
                          {document.name}
                        </h3>
                        <p className="navix-client-doc-card__meta mb-1">{category.label}</p>
                        <p className="navix-client-doc-card__meta mb-1 text-truncate">{getResourceLabel(document)}</p>
                      </div>
                      <div className="dropdown">
                        <button
                          type="button"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="dropdown"
                          aria-label="Actions du document"
                        >
                          <i className="bi bi-three-dots-vertical" aria-hidden="true" />
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button type="button" className="dropdown-item" onClick={() => handleDownload(document)}>
                              <i className="bi bi-download me-2" aria-hidden="true" />
                              Télécharger
                            </button>
                          </li>
                          {can(PERMISSIONS.CLIENT_DOCUMENTS_UPDATE) && (
                            <li>
                              <button type="button" className="dropdown-item" onClick={() => openDelete(document)}>
                                <i className="bi bi-trash3 me-2" aria-hidden="true" />
                                Supprimer
                              </button>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                    <div className="d-flex flex-wrap gap-2 align-items-center mt-3">
                      {renderExpiryBadge(document)}
                      <span className="small text-secondary ms-auto">
                        {formatDocumentSize(document.size)} · {formatDocumentDate(document.createdAt)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination
                page={page}
                pageSize={pageSize}
                totalItems={totalItems}
                totalPages={totalPages}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[8, 12, 16, 24]}
              />
            </div>
          )}

          <ClientDocumentUploadModal
            key={`upload-${uploadOpen}`}
            open={uploadOpen}
            onClose={() => setUploadOpen(false)}
            onSubmit={handleUpload}
            loading={isUploading}
            error={uploadError}
          />

          <DeleteModal
            open={Boolean(deleteTarget)}
            onClose={() => setDeleteTarget(null)}
            entityName={deleteTarget ? deleteTarget.name : undefined}
            title="Supprimer ce document"
            loading={isDeleting}
            error={deleteError}
            onConfirm={handleDelete}
          />
        </>
      )}
    </PageContainer>
  );
};

export default ClientDocumentsPage;
