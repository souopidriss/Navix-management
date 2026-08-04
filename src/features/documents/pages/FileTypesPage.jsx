/**
 * Navix Documents — FileTypesPage
 * --------------------------------------------------------------------------
 * Gestion des types de fichiers : grille de cartes (titre, extensions,
 * taille maximale, nombre de documents qui l'utilisent), création, édition
 * et suppression via FormModal / DeleteModal. Un type utilisé par au moins
 * un document est verrouillé (bouton de suppression désactivé) ; le service
 * renvoie une erreur 409 si la suppression est tout de même tentée.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  FormModal,
  DeleteModal,
  LoadingState,
  EmptyState,
} from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { useZodForm } from '@/features/auth';
import { useDocumentsStore } from '../store';
import { FileTypeCard, FileTypeForm } from '../components';
import {
  fileTypeSchema,
  fileTypeDefaultValues,
  toFileTypeFormValues,
  toFileTypePayload,
} from '../schemas';

const FileTypesPage = () => {
  const navigate = useNavigate();

  const fileTypes = useDocumentsStore((state) => state.fileTypes);
  const documents = useDocumentsStore((state) => state.documents);
  const isLoading = useDocumentsStore((state) => state.isLoading);
  const isSaving = useDocumentsStore((state) => state.isSaving);
  const error = useDocumentsStore((state) => state.error);
  const fetchFileTypes = useDocumentsStore((state) => state.fetchFileTypes);
  const fetchDocuments = useDocumentsStore((state) => state.fetchDocuments);
  const createFileType = useDocumentsStore((state) => state.createFileType);
  const updateFileType = useDocumentsStore((state) => state.updateFileType);
  const deleteFileType = useDocumentsStore((state) => state.deleteFileType);
  const clearError = useDocumentsStore((state) => state.clearError);

  const [showCreate, setShowCreate] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchFileTypes();
    fetchDocuments();
  }, [fetchFileTypes, fetchDocuments]);

  const usageCounts = useMemo(() => {
    const counts = {};
    documents.forEach((document) => {
      counts[document.fileTypeId] = (counts[document.fileTypeId] || 0) + 1;
    });
    return counts;
  }, [documents]);

  const handleCreateSubmit = async (values) => {
    clearError();

    const result = await createFileType(toFileTypePayload(values));
    if (result.success) {
      toast.success(`Type de fichier « ${result.data.title} » créé.`);
      setShowCreate(false);
      createForm.reset();
    }
  };

  const handleEditSubmit = async (values) => {
    clearError();

    const result = await updateFileType(editingTarget.id, toFileTypePayload(values));
    if (result.success) {
      toast.success(`Type de fichier « ${result.data.title} » mis à jour.`);
      setEditingTarget(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteFileType(deleteTarget.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success(`Type de fichier « ${deleteTarget.title} » supprimé.`);
      setDeleteTarget(null);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer le type de fichier.');
    }
  };

  const closeDelete = () => {
    setDeleteTarget(null);
    setDeleteError('');
  };

  const createForm = useZodForm({
    schema: fileTypeSchema,
    defaultValues: fileTypeDefaultValues,
    onSubmit: handleCreateSubmit,
  });

  const editForm = useZodForm({
    schema: fileTypeSchema,
    defaultValues: fileTypeDefaultValues,
    onSubmit: handleEditSubmit,
  });

  useEffect(() => {
    if (editingTarget) {
      editForm.reset(toFileTypeFormValues(editingTarget));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTarget]);

  const headerActions = (
    <div className="d-flex gap-2 flex-wrap">
      <Button variant="outline" icon="bi-arrow-left" onClick={() => navigate(ROUTES.FILES)}>
        Documents
      </Button>
      <Button
        variant="primary"
        icon="bi-plus-lg"
        onClick={() => {
          clearError();
          createForm.reset();
          setShowCreate(true);
        }}
      >
        Nouveau type
      </Button>
    </div>
  );

  return (
    <PageContainer>
      <Helmet>
        <title>Types de fichiers — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Types de fichiers"
        subtitle="Définissez les formats acceptés, leurs extensions et leurs limites de taille."
        icon="bi-file-earmark-binary"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Documents', to: ROUTES.FILES },
          { label: 'Types de fichiers' },
        ]}
        actions={headerActions}
      />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      {isLoading && fileTypes.length === 0 ? (
        <LoadingState variant="cards" cols={3} label="Chargement des types de fichiers…" />
      ) : fileTypes.length === 0 ? (
        <EmptyState
          icon="bi-file-earmark-binary"
          title="Aucun type de fichier"
          description="Créez votre premier type de fichier pour commencer."
          action={
            <Button variant="primary" icon="bi-plus-lg" onClick={() => setShowCreate(true)}>
              Nouveau type
            </Button>
          }
        />
      ) : (
        <div className="row g-3">
          {fileTypes.map((fileType) => (
            <div key={fileType.id} className="col-12 col-sm-6 col-xl-4">
              <FileTypeCard
                fileType={fileType}
                usageCount={usageCounts[fileType.id] || 0}
                onEdit={(target) => {
                  clearError();
                  setEditingTarget(target);
                }}
                onDelete={setDeleteTarget}
              />
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <FormModal
          open
          onClose={() => setShowCreate(false)}
          title="Nouveau type de fichier"
          subtitle="Les extensions et la taille maximale détermineront la validation des fichiers."
          icon="bi-file-earmark-plus"
          onSubmit={createForm.handleSubmit}
          submitLabel="Créer le type"
          loading={isSaving}
          error={error}
        >
          <FileTypeForm
            values={createForm.values}
            errors={createForm.errors}
            setField={createForm.setField}
          />
        </FormModal>
      )}

      {editingTarget && (
        <FormModal
          open
          onClose={() => setEditingTarget(null)}
          title={`Modifier ${editingTarget.title}`}
          subtitle="Les limites de ce type s’appliqueront aux prochains fichiers téléversés."
          icon="bi-file-earmark-edit"
          onSubmit={editForm.handleSubmit}
          submitLabel="Enregistrer les modifications"
          loading={isSaving}
          error={error}
        >
          <FileTypeForm
            values={editForm.values}
            errors={editForm.errors}
            setField={editForm.setField}
          />
        </FormModal>
      )}

      <DeleteModal
        open={Boolean(deleteTarget)}
        onClose={closeDelete}
        entityName={deleteTarget?.title ?? 'type de fichier'}
        title="Supprimer le type de fichier"
        message="Les types utilisés par des documents ne peuvent pas être supprimés."
        confirmLabel="Supprimer"
        loading={isDeleting}
        error={deleteError}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
};

export default FileTypesPage;
