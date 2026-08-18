/**
 * Navix Partner Portal — PartnerDocumentsPage (PROMPT 066 — DOCUMENTS &
 * JUSTIFICATIFS · PREMIUM)
 * --------------------------------------------------------------------------
 * Centre documentaire de l'entreprise partenaire, en gestion complète :
 *   HEADER « Documents & Justificatifs » + « + Ajouter un document » (RBAC)
 *   → 4 KPI premium (Documents / Valides / Expire bientôt / Espace utilisé)
 *   → Zone « Documents à surveiller » (expirant / expirés / en attente)
 *   → Recherche instantanée (nom, référence, entité, catégorie, type, statut)
 *     + filtres Type / Statut / Entité liée / Date d'ajout (personnalisée)
 *     + tri (nom, type, ajout, expiration, taille, statut) + pagination 10/25/50
 *   → Tableau premium + actions par ligne (menu déroulant) : Voir,
 *     Télécharger, Modifier, Renouveler (si expiré), Supprimer.
 *   → Modales : création/édition (Zod + FileUploader), renouvellement,
 *     suppression confirmée.
 *
 * Multi-tenant : le service filtre strictement par companyId / partnerId du
 * partenaire. RBAC : les actions d'écriture sont conditionnées aux
 * permissions PARTNER_DOCUMENTS_*.
 */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
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
  ConfirmDialog,
  DeleteModal,
} from '@/components/core';
import { Can } from '@/features/rbac/components';
import { useCan } from '@/features/rbac/hooks';
import { PERMISSIONS } from '@/features/rbac/constants';
import { ROUTES } from '@/routes/route.constants';
import usePartnerDocuments from '../hooks/usePartnerDocuments';
import usePartnerDocumentFilters from '../hooks/usePartnerDocumentFilters';
import PartnerDocumentStats from '../components/PartnerDocuments/PartnerDocumentStats';
import PartnerDocumentAlerts from '../components/PartnerDocuments/PartnerDocumentAlerts';
import PartnerDocumentsTable from '../components/PartnerDocuments/PartnerDocumentsTable';
import PartnerDocumentUploadModal from '../components/PartnerDocuments/PartnerDocumentUploadModal';
import '../components/PartnerDocuments/PartnerDocuments.css';

const PartnerDocumentsPage = () => {
  const navigate = useNavigate();
  const can = useCan();

  const {
    stats,
    isLoading,
    error,
    refetch,
    search,
    setSearch,
    filters,
    setFilters,
    hasActiveFilters,
    resetFilters,
    sort,
    setSort,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    pageItems,
    counts,
    createDocument,
    updateDocument,
    deleteDocument,
    renewDocument,
    downloadDocument,
  } = usePartnerDocuments();

  const { fields: baseFilterFields } = usePartnerDocumentFilters();

  /* ── États des modales ────────────────────────────────────────────────── */
  const [formOpen, setFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [renewTarget, setRenewTarget] = useState(null);
  const [isRenewing, setIsRenewing] = useState(false);
  const [renewError, setRenewError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  /* ── Champs de filtres (plages de dates personnalisées) ──────────────── */
  const filterFields =
    filters.date === 'custom'
      ? [
          ...baseFilterFields,
          { key: 'dateFrom', type: 'date', label: 'Du' },
          { key: 'dateTo', type: 'date', label: 'Au' },
        ]
      : baseFilterFields;

  const canUpdate = can(PERMISSIONS.PARTNER_DOCUMENTS_UPDATE);
  const canDelete = can(PERMISSIONS.PARTNER_DOCUMENTS_DELETE);

  /* ── Ouvertures ───────────────────────────────────────────────────────── */
  const openCreate = () => {
    setFormTarget(null);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (document) => {
    setFormTarget(document);
    setFormError('');
    setFormOpen(true);
  };

  const openRenew = (document) => {
    setRenewTarget(document);
    setRenewError('');
  };

  const openDelete = (document) => {
    setDeleteTarget(document);
    setDeleteError('');
  };

  /* ── Soumissions ──────────────────────────────────────────────────────── */
  const handleFormSubmit = async (payload) => {
    setIsSaving(true);
    setFormError('');
    try {
      if (formTarget) {
        await updateDocument(formTarget.id, payload);
        toast.success('Document mis à jour.');
      } else {
        await createDocument(payload);
        toast.success('Document ajouté à votre centre documentaire.');
      }
      setFormOpen(false);
      refetch();
    } catch (err) {
      setFormError(err?.message || 'Impossible d’enregistrer le document.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      await downloadDocument(document.id);
      toast.success(`Téléchargement de « ${document.name} » simulé.`);
    } catch (err) {
      toast.error(err?.message || 'Téléchargement impossible.');
    }
  };

  const handleRenew = async () => {
    if (!renewTarget) return;
    setIsRenewing(true);
    setRenewError('');
    try {
      await renewDocument(renewTarget.id);
      toast.success('Validité du document prolongée d’un an.');
      setRenewTarget(null);
      refetch();
    } catch (err) {
      setRenewError(err?.message || 'Renouvellement refusé.');
    } finally {
      setIsRenewing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteDocument(deleteTarget.id);
      toast.success('Document supprimé de votre centre documentaire.');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      setDeleteError(err?.message || 'Suppression refusée.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSortChange = (by, direction) => setSort({ by, direction });

  const handleView = (document) => {
    navigate(ROUTES.PARTNER_DOCUMENTS_DETAIL.replace(':id', document.id));
  };

  const handleAlertFilter = (status) => {
    setSearch('');
    setFilters({ category: '', status, entity: '', date: '', dateFrom: '', dateTo: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    resetFilters();
  };

  if (isLoading && pageItems.length === 0 && totalItems === 0) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement de vos documents…" />
      </PageContainer>
    );
  }

  if (error && totalItems === 0) {
    return (
      <PageContainer>
        <ErrorState
          title="Impossible de charger vos documents"
          description="Les données de votre centre documentaire sont temporairement indisponibles."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Documents — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title="Documents & Justificatifs"
        subtitle="Téléversez et suivez les justificatifs de votre entreprise partenaire."
        icon="bi-folder2-open"
        breadcrumbs={[{ label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD }, { label: 'Documents' }]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Can permission={PERMISSIONS.PARTNER_DOCUMENTS_CREATE}>
              <Button variant="primary" size="sm" icon="bi-plus-circle" onClick={openCreate}>
                Ajouter un document
              </Button>
            </Can>
            <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={refetch} aria-label="Actualiser">
              <span className="visually-hidden">Actualiser</span>
            </Button>
          </div>
        }
      />

      <PartnerDocumentStats stats={stats} loading={isLoading} />
      <PartnerDocumentAlerts counts={counts} onFilterStatus={handleAlertFilter} />

      <PartnerDocumentsTable
        documents={pageItems}
        sort={sort}
        onSortChange={handleSortChange}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        loading={isLoading}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onView={handleView}
        onDownload={handleDownload}
        onEdit={openEdit}
        onRenew={openRenew}
        onDelete={openDelete}
        header={
          <div className="navix-pdoc-toolbar">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Rechercher (nom, référence, client, véhicule, type…)"
              resultCount={totalItems}
              aria-label="Rechercher dans le centre documentaire"
            />
            <FilterBar
              fields={filterFields}
              values={filters}
              onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
              onReset={handleReset}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        }
        empty={
          <EmptyState
            compact
            icon="bi-file-earmark-text"
            title={hasActiveFilters ? 'Aucun document ne correspond' : 'Aucun document'}
            description={
              hasActiveFilters
                ? 'Modifiez vos critères de recherche ou réinitialisez les filtres.'
                : 'Ajoutez votre premier justificatif pour alimenter votre centre documentaire.'
            }
          />
        }
      />

      <PartnerDocumentUploadModal
        key={`${formTarget?.id ?? 'create'}-${formOpen}`}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        document={formTarget}
        onSubmit={handleFormSubmit}
        loading={isSaving}
        error={formError}
      />

      <ConfirmDialog
        open={Boolean(renewTarget)}
        onClose={() => setRenewTarget(null)}
        title="Renouveler ce document"
        icon="bi-arrow-counterclockwise"
        confirmLabel="Prolonger d’un an"
        confirmVariant="primary"
        loading={isRenewing}
        error={renewError}
        onConfirm={handleRenew}
        message={
          renewTarget ? (
            <>
              Prolonger la validité de{' '}
              <strong>
                {renewTarget.name} — {renewTarget.reference}
              </strong>{' '}
              d’une année supplémentaire à compter de la date d’expiration actuelle ?
            </>
          ) : null
        }
      />

      <DeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        entityName={deleteTarget?.name}
        title="Supprimer ce document"
        message={
          deleteTarget ? (
            <>
              Êtes-vous sûr de vouloir supprimer ce document :{' '}
              <strong>
                {deleteTarget.name} — {deleteTarget.reference}
              </strong>{' '}
              ? Cette action est irréversible.
            </>
          ) : undefined
        }
        loading={isDeleting}
        error={deleteError}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
};

export default PartnerDocumentsPage;
