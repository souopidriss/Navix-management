/**
 * Navix Users — RoleDetailsPage
 * --------------------------------------------------------------------------
 * Détail d'un rôle : identité + permissions regroupées (RoleDetails) et
 * éditeur de permissions (RolePermissionEditor) avec sauvegarde simulée des
 * attributions. Actions : modifier les informations, activer / désactiver,
 * supprimer (rôles système protégés côté service).
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button, Card } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  LoadingState,
  FormModal,
  ConfirmDialog,
  DeleteModal,
} from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { useRoleStore } from '../store';
import { useRoleActions, useRoleForm, usePermissionListData } from '../hooks';
import { RoleDetails, RolePermissionEditor, RoleForm } from '../components';
import { toRolePayload, toRoleFormValues } from '../schemas';
import { ROLES_ICON } from '../constants';

const WILDCARD = '*';

const RoleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedRole = useRoleStore((state) => state.selectedRole);
  const isLoading = useRoleStore((state) => state.isLoading);
  const isSaving = useRoleStore((state) => state.isSaving);
  const error = useRoleStore((state) => state.error);
  const fetchRole = useRoleStore((state) => state.fetchRole);
  const updateRole = useRoleStore((state) => state.updateRole);
  const clearError = useRoleStore((state) => state.clearError);

  const { groups, modules, refresh } = usePermissionListData();
  const { actions } = useRoleActions();

  const [selected, setSelected] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (id) fetchRole(id);
    refresh();
  }, [id, fetchRole, refresh]);

  const role = selectedRole?.id === id ? selectedRole : null;
  const isSuperAdmin = role?.code === WILDCARD || role?.permissions?.includes(WILDCARD);

  useEffect(() => {
    if (role && !isSuperAdmin) setSelected([...(role.permissions ?? [])]);
  }, [role, isSuperAdmin]);

  const handleSavePermissions = async () => {
    if (!role) return;
    const ok = await actions.assignPermissions(role.id, selected);
    if (ok.success) fetchRole(role.id);
  };

  const handleValidEdit = async (values) => {
    clearError();
    const result = await updateRole(role.id, toRolePayload(values));
    if (result.success) {
      toast.success(`Rôle « ${result.data.name} » mis à jour.`);
      setEditOpen(false);
    }
  };

  const { values, errors, setField, reset, handleSubmit } = useRoleForm({ role, onSubmit: handleValidEdit });

  const openEdit = () => {
    if (!role) return;
    reset(toRoleFormValues(role));
    clearError();
    setEditOpen(true);
  };

  const handleConfirmDialog = async () => {
    if (!dialog) return;
    const ok = await dialog.action();
    if (ok.success) setDialog(null);
  };

  const handleConfirmDelete = async () => {
    const ok = await actions.removeRole(role.id);
    if (ok.success) {
      setDeleteOpen(false);
      navigate(ROUTES.ROLES);
    }
  };

  if (!role) {
    return (
      <PageContainer>
        <Helmet>
          <title>Rôle — Navix Management</title>
        </Helmet>
        {isLoading ? (
          <LoadingState variant="text" lines={6} label="Chargement du rôle…" />
        ) : (
          <Alert variant="danger" closable onClose={clearError} className="mb-3">
            {error || 'Rôle introuvable.'}
          </Alert>
        )}
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>{`${role.name} — Rôles — Navix Management`}</title>
      </Helmet>

      <PageHeader
        title={role.name}
        subtitle={role.description || 'Rôle et permissions'}
        icon={ROLES_ICON}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Rôles', to: ROUTES.ROLES },
          { label: role.name },
        ]}
        actions={
          <div className="d-flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" icon="bi-arrow-left" onClick={() => navigate(ROUTES.ROLES)}>
              Retour
            </Button>
            <Button variant="outline" size="sm" icon="bi-pencil" onClick={openEdit} disabled={role.isSystem}>
              Modifier
            </Button>
            {role.isActive ? (
              <Button
                variant="outline"
                size="sm"
                icon="bi-toggle-off"
                onClick={() =>
                  setDialog({
                    title: 'Désactiver le rôle',
                    message: `Désactiver le rôle « ${role.name} » ? Les utilisateurs rattachés perdront ses permissions.`,
                    confirmLabel: 'Désactiver',
                    variant: 'warning',
                    icon: 'bi-toggle-off',
                    action: () => actions.deactivateRole(role.id),
                  })
                }
              >
                Désactiver
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                icon="bi-toggle-on"
                onClick={() =>
                  setDialog({
                    title: 'Activer le rôle',
                    message: `Activer le rôle « ${role.name} » ?`,
                    confirmLabel: 'Activer',
                    variant: 'success',
                    icon: 'bi-toggle-on',
                    action: () => actions.activateRole(role.id),
                  })
                }
              >
                Activer
              </Button>
            )}
            {!role.isSystem && (
              <Button variant="outline" size="sm" icon="bi-trash3" className="text-danger" onClick={() => setDeleteOpen(true)}>
                Supprimer
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <RoleDetails role={role} />

      <div className="mt-4">
        <Card
          title="Permissions"
          subtitle={
            role.isSystem && !isSuperAdmin
              ? 'Rôle système — les permissions sont définies par l’application.'
              : 'Cochez les actions autorisées pour ce rôle puis enregistrez.'
          }
          icon="bi-key"
          actions={
            !isSuperAdmin && (
              <Button variant="primary" size="sm" icon="bi-save" loading={isSaving} onClick={handleSavePermissions}>
                Enregistrer les permissions
              </Button>
            )
          }
        >
          <RolePermissionEditor
            modules={modules}
            groups={groups}
            selected={selected}
            onChange={setSelected}
            readOnly={isSuperAdmin}
          />
        </Card>
      </div>

      <FormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Modifier ${role.name}`}
        subtitle="Les champs sont validés avant enregistrement."
        icon={ROLES_ICON}
        size="lg"
        onSubmit={handleSubmit}
        submitLabel="Enregistrer"
        loading={isSaving}
        error={error}
      >
        <RoleForm values={values} errors={errors} setField={setField} isEdit />
      </FormModal>

      <ConfirmDialog
        open={Boolean(dialog)}
        onClose={() => setDialog(null)}
        title={dialog?.title}
        message={dialog?.message}
        confirmLabel={dialog?.confirmLabel}
        confirmVariant={dialog?.variant}
        icon={dialog?.icon}
        loading={isSaving}
        onConfirm={handleConfirmDialog}
      />

      <DeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Supprimer le rôle"
        message={`Supprimer définitivement le rôle « ${role.name} » ? Les utilisateurs qui en dépendent perdront ses permissions.`}
        confirmLabel="Supprimer"
        loading={isSaving}
        onConfirm={handleConfirmDelete}
      />
    </PageContainer>
  );
};

export default RoleDetailsPage;
