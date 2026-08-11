/**
 * Navix Users — UsersPage
 * --------------------------------------------------------------------------
 * Liste des utilisateurs : indicateurs, recherche instantanée, filtres, tri,
 * pagination, états chargement / erreur / vide, création et actions
 * contextuelles (détail, modification, statut, invitation, réinitialisation du
 * mot de passe simulée, suppression). Multi-tenant simulé : la liste est bornée
 * à l'entreprise de l'utilisateur courant, sauf super_admin.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button, Alert, Card } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  Pagination,
  LoadingState,
  SearchBar,
  FilterBar,
  MetricCard,
  ConfirmDialog,
  DeleteModal,
} from '@/components/core';
import { ROUTES, userDetailPath, userEditPath } from '@/routes/route.constants';
import { useCan, PERMISSIONS } from '@/features/rbac';
import { useUserStore } from '../store';
import { useUserListData, useUserActions, useTenantScope } from '../hooks';
import { UsersTable } from '../components';
import {
  USERS_ICON,
  USER_STATUSES,
  USER_STATUS_VALUES,
  USER_SORT_OPTIONS,
  SORT_DIRECTIONS,
} from '../constants';
import './UsersPage.css';

const toLabelOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const UsersPage = () => {
  const navigate = useNavigate();
  const can = useCan();

  const error = useUserStore((state) => state.error);
  const search = useUserStore((state) => state.search);
  const filters = useUserStore((state) => state.filters);
  const sort = useUserStore((state) => state.sort);
  const stats = useUserStore((state) => state.stats);
  const page = useUserStore((state) => state.pagination.page);
  const pageSize = useUserStore((state) => state.pagination.pageSize);
  const fetchUsers = useUserStore((state) => state.fetchUsers);
  const setSearch = useUserStore((state) => state.setSearch);
  const setFilter = useUserStore((state) => state.setFilter);
  const resetFilters = useUserStore((state) => state.resetFilters);
  const setSort = useUserStore((state) => state.setSort);
  const setPage = useUserStore((state) => state.setPage);
  const setPageSize = useUserStore((state) => state.setPageSize);
  const clearError = useUserStore((state) => state.clearError);

  const { companies, agencies, roles } = useTenantScope();
  const { actions, isLoading, isSaving } = useUserActions();
  const { items, totalItems, totalPages } = useUserListData();

  const [dialog, setDialog] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        search.trim() ||
          filters.companyId ||
          filters.agencyId ||
          filters.roleId ||
          filters.status ||
          filters.createdAtFrom ||
          filters.createdAtTo ||
          filters.lastLoginFrom ||
          filters.lastLoginTo,
      ),
    [search, filters],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const agencyOptions = useMemo(
    () =>
      agencies
        .filter((agency) => !filters.companyId || agency.companyId === filters.companyId)
        .map((agency) => ({ value: agency.id, label: agency.name })),
    [agencies, filters.companyId],
  );

  const filterFields = [
    {
      key: 'companyId',
      type: 'select',
      label: 'Entreprise',
      options: companies.map((company) => ({ value: company.id, label: company.name })),
      allLabel: 'Toutes les entreprises',
    },
    {
      key: 'agencyId',
      type: 'select',
      label: 'Agence',
      options: agencyOptions,
      allLabel: 'Toutes les agences',
    },
    {
      key: 'roleId',
      type: 'select',
      label: 'Rôle',
      options: roles.map((role) => ({ value: role.id, label: role.name })),
      allLabel: 'Tous les rôles',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Statut',
      options: toLabelOptions(USER_STATUS_VALUES, USER_STATUSES),
      allLabel: 'Tous les statuts',
    },
    { key: 'createdAtFrom', type: 'date', label: 'Créé à partir du' },
    { key: 'createdAtTo', type: 'date', label: 'Créé jusqu’au' },
    { key: 'lastLoginFrom', type: 'date', label: 'Connexion à partir du' },
    { key: 'lastLoginTo', type: 'date', label: 'Connexion jusqu’au' },
  ];

  const handleAction = (key, user) => {
    if (key === 'view') {
      navigate(userDetailPath(user.id));
      return;
    }
    if (key === 'edit') {
      navigate(userEditPath(user.id));
      return;
    }
    if (key === 'delete') {
      setDeleteTarget(user);
      return;
    }
    if (key === 'resetPassword') {
      setResetTarget(user);
      return;
    }

    const statusMeta = {
      deactivate: {
        title: 'Désactiver le compte',
        message: `Désactiver le compte de ${user.fullName} ? Il ne pourra plus se connecter.`,
        confirmLabel: 'Désactiver',
        variant: 'warning',
        icon: 'bi-person-slash',
        action: () => actions.deactivateUser(user.id),
      },
      suspend: {
        title: 'Suspendre le compte',
        message: `Suspendre le compte de ${user.fullName} ? L’accès sera bloqué.`,
        confirmLabel: 'Suspendre',
        variant: 'warning',
        icon: 'bi-person-x',
        action: () => actions.suspendUser(user.id),
      },
      reactivate: {
        title: 'Réactiver le compte',
        message: `Réactiver le compte de ${user.fullName} ?`,
        confirmLabel: 'Réactiver',
        variant: 'success',
        icon: 'bi-person-check',
        action: () => actions.reactivateUser(user.id),
      },
      invite: {
        title: 'Inviter l’utilisateur',
        message: `Envoyer une invitation à ${user.fullName} ? (simulation — aucun email réel)`,
        confirmLabel: 'Inviter',
        variant: 'primary',
        icon: 'bi-envelope',
        action: () => actions.inviteUser(user.id),
      },
    }[key];

    if (statusMeta) setDialog(statusMeta);
  };

  const handleConfirmDialog = async () => {
    if (!dialog) return;
    const ok = await dialog.action();
    if (ok.success) setDialog(null);
  };

  const handleConfirmReset = async () => {
    if (!resetTarget) return;
    const ok = await actions.resetPassword(resetTarget.id);
    if (ok.success) setResetTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const ok = await actions.removeUser(deleteTarget.id);
    if (ok.success) setDeleteTarget(null);
  };

  return (
    <PageContainer>
      <Helmet>
        <title>Utilisateurs — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Utilisateurs"
        subtitle="Gérez les comptes, les rôles et les accès de votre organisation."
        icon={USERS_ICON}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Utilisateurs' },
        ]}
        actions={
          <div className="d-flex gap-2">
            <Button variant="outline" size="sm" icon="bi-arrow-clockwise" loading={isLoading} onClick={actions.refresh}>
              Rafraîchir
            </Button>
            {can(PERMISSIONS.USERS_CREATE) && (
              <Button
                variant="primary"
                size="sm"
                icon="bi-person-plus"
                onClick={() => navigate(ROUTES.USERS_CREATE)}
              >
                Créer un utilisateur
              </Button>
            )}
          </div>
        }
      />

      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard label="Utilisateurs" value={stats?.total ?? 0} icon="bi-people" variant="primary" loading={isLoading} />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard label="Comptes actifs" value={stats?.active ?? 0} icon="bi-person-check" variant="success" loading={isLoading} />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard label="Suspendus" value={stats?.byStatus?.suspended ?? 0} icon="bi-person-x" variant="danger" loading={isLoading} />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard label="En attente" value={stats?.byStatus?.pending ?? 0} icon="bi-hourglass-split" variant="warning" loading={isLoading} />
        </div>
      </div>

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <SearchBar value={search} onChange={setSearch} resultCount={totalItems} placeholder="Rechercher un nom, un email, un poste…" />

      <div className="navix-users-filters mb-3">
        <Card padding="sm">
          <FilterBar
            fields={filterFields}
            values={filters}
            onChange={setFilter}
            onReset={resetFilters}
            hasActiveFilters={hasActiveFilters}
          />
          <FilterBar
            fields={[
              {
                key: 'by',
                type: 'select',
                label: 'Trier par',
                options: USER_SORT_OPTIONS,
                allLabel: 'Tri : Créé le',
              },
              {
                key: 'direction',
                type: 'select',
                label: 'Sens du tri',
                options: SORT_DIRECTIONS,
                allLabel: 'Ordre : Décroissant',
              },
            ]}
            values={sort}
            onChange={(key, value) =>
              setSort(key === 'by' ? value : sort.by, key === 'direction' ? value : sort.direction)
            }
            hasActiveFilters={false}
          />
        </Card>
      </div>

      {isLoading && items.length === 0 ? (
        <LoadingState variant="table" rows={6} cols={6} label="Chargement des utilisateurs…" />
      ) : items.length === 0 ? (
        <div className="navix-users-empty">
          {hasActiveFilters ? (
            <>
              <p className="text-muted mb-0">Aucun utilisateur ne correspond aux critères.</p>
              <Button variant="ghost" size="sm" icon="bi-arrow-counterclockwise" onClick={resetFilters} className="mt-2">
                Réinitialiser les filtres
              </Button>
            </>
          ) : (
            <p className="text-muted mb-0">Aucun utilisateur pour le moment.</p>
          )}
        </div>
      ) : (
        <>
          <div className="text-muted mb-2">{totalItems} utilisateur{totalItems > 1 ? 's' : ''}</div>
          <UsersTable
            users={items}
            sort={sort}
            onSortChange={(by, direction) => setSort(by, direction)}
            onAction={handleAction}
            onView={(user) => navigate(userDetailPath(user.id))}
          />
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

      <ConfirmDialog
        open={Boolean(resetTarget)}
        onClose={() => setResetTarget(null)}
        title="Réinitialiser le mot de passe"
        message={
          resetTarget
            ? `Déclencher la réinitialisation du mot de passe de ${resetTarget.fullName} ? (simulation — aucun email réel)`
            : ''
        }
        confirmLabel="Réinitialiser"
        confirmVariant="warning"
        icon="bi-key"
        loading={isSaving}
        onConfirm={handleConfirmReset}
      />

      <DeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer l’utilisateur"
        message={
          deleteTarget
            ? `Supprimer définitivement le compte de ${deleteTarget.fullName} ? Cette action est irréversible.`
            : ''
        }
        confirmLabel="Supprimer"
        loading={isSaving}
        onConfirm={handleConfirmDelete}
      />
    </PageContainer>
  );
};

export default UsersPage;
