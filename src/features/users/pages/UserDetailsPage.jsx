/**
 * Navix Users — UserDetailsPage
 * --------------------------------------------------------------------------
 * Détail d'un utilisateur : identité, statut, rattachements, rôles,
 * coordonnées et dates. Actions : modifier, statut, réinitialisation du mot de
 * passe (simulée) et suppression. Rechargée depuis le store pour rester
 * cohérente avec la liste.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Alert, Button } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState, ConfirmDialog, DeleteModal } from '@/components/core';
import { ROUTES, userEditPath } from '@/routes/route.constants';
import { useUserStore } from '../store';
import { useUserActions, useTenantScope } from '../hooks';
import { UserDetails } from '../components';
import { USERS_ICON } from '../constants';

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedUser = useUserStore((state) => state.selectedUser);
  const isLoading = useUserStore((state) => state.isLoading);
  const isSaving = useUserStore((state) => state.isSaving);
  const error = useUserStore((state) => state.error);
  const fetchUser = useUserStore((state) => state.fetchUser);
  const clearError = useUserStore((state) => state.clearError);

  const { enrichUsers } = useTenantScope();
  const { actions } = useUserActions();

  const [dialog, setDialog] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (id) fetchUser(id);
  }, [id, fetchUser]);

  const user = selectedUser?.id === id ? selectedUser : null;
  const enriched = user ? enrichUsers([user])[0] : null;

  const handleConfirmDialog = async () => {
    if (!dialog) return;
    const ok = await dialog.action();
    if (ok.success) setDialog(null);
  };

  const handleConfirmDelete = async () => {
    const ok = await actions.removeUser(id);
    if (ok.success) {
      setDeleteOpen(false);
      navigate(ROUTES.USERS);
    }
  };

  if (!enriched) {
    return (
      <PageContainer>
        <Helmet>
          <title>Utilisateur — Navix Management</title>
        </Helmet>
        {isLoading ? (
          <LoadingState variant="text" lines={6} label="Chargement de l'utilisateur…" />
        ) : (
          <Alert variant="danger" closable onClose={clearError} className="mb-3">
            {error || 'Utilisateur introuvable.'}
          </Alert>
        )}
      </PageContainer>
    );
  }

  const statusActions = [
    { key: 'deactivate', label: 'Désactiver', show: enriched.status === 'active' },
    { key: 'suspend', label: 'Suspendre', show: enriched.status === 'active' },
    { key: 'reactivate', label: 'Réactiver', show: enriched.status === 'inactive' || enriched.status === 'suspended' },
    { key: 'invite', label: 'Inviter', show: enriched.status === 'pending' || enriched.status === 'invited' },
  ]
    .filter((item) => item.show)
    .map((item) => ({
      ...item,
      dialog: {
        deactivate: {
          title: 'Désactiver le compte',
          message: `Désactiver le compte de ${enriched.fullName} ?`,
          confirmLabel: 'Désactiver',
          variant: 'warning',
          icon: 'bi-person-slash',
          action: () => actions.deactivateUser(enriched.id),
        },
        suspend: {
          title: 'Suspendre le compte',
          message: `Suspendre le compte de ${enriched.fullName} ?`,
          confirmLabel: 'Suspendre',
          variant: 'warning',
          icon: 'bi-person-x',
          action: () => actions.suspendUser(enriched.id),
        },
        reactivate: {
          title: 'Réactiver le compte',
          message: `Réactiver le compte de ${enriched.fullName} ?`,
          confirmLabel: 'Réactiver',
          variant: 'success',
          icon: 'bi-person-check',
          action: () => actions.reactivateUser(enriched.id),
        },
        invite: {
          title: 'Inviter l’utilisateur',
          message: `Envoyer une invitation à ${enriched.fullName} ? (simulation — aucun email réel)`,
          confirmLabel: 'Inviter',
          variant: 'primary',
          icon: 'bi-envelope',
          action: () => actions.inviteUser(enriched.id),
        },
      }[item.key],
    }));

  return (
    <PageContainer>
      <Helmet>
        <title>{`${enriched.fullName} — Utilisateurs — Navix Management`}</title>
      </Helmet>

      <PageHeader
        title={enriched.fullName}
        subtitle={enriched.jobTitle || enriched.email}
        icon={USERS_ICON}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Utilisateurs', to: ROUTES.USERS },
          { label: enriched.fullName },
        ]}
        actions={
          <div className="d-flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" icon="bi-arrow-left" onClick={() => navigate(ROUTES.USERS)}>
              Retour
            </Button>
            {statusActions.map((item) => (
              <Button
                key={item.key}
                variant="outline"
                size="sm"
                icon={item.dialog.icon}
                onClick={() => setDialog(item.dialog)}
              >
                {item.label}
              </Button>
            ))}
            <Button
              variant="primary"
              size="sm"
              icon="bi-pencil"
              onClick={() => navigate(userEditPath(enriched.id))}
            >
              Modifier
            </Button>
          </div>
        }
      />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <UserDetails user={enriched} />

      <div className="mt-3 d-flex justify-content-end">
        <Button
          variant="outline"
          size="sm"
          icon="bi-key"
          className="me-2 text-danger"
          onClick={() =>
            setDialog({
              title: 'Réinitialiser le mot de passe',
              message: `Déclencher la réinitialisation du mot de passe de ${enriched.fullName} ? (simulation — aucun email réel)`,
              confirmLabel: 'Réinitialiser',
              variant: 'warning',
              icon: 'bi-key',
              action: () => actions.resetPassword(enriched.id),
            })
          }
        >
          Réinitialiser le mot de passe
        </Button>
        {enriched.id !== 'usr_001' && (
          <Button variant="outline" size="sm" icon="bi-trash3" className="text-danger" onClick={() => setDeleteOpen(true)}>
            Supprimer
          </Button>
        )}
      </div>

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
        title="Supprimer l’utilisateur"
        message={`Supprimer définitivement le compte de ${enriched.fullName} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        loading={isSaving}
        onConfirm={handleConfirmDelete}
      />
    </PageContainer>
  );
};

export default UserDetailsPage;
