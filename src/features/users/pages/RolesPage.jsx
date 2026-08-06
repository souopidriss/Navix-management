/**
 * Navix Users — RolesPage
 * --------------------------------------------------------------------------
 * Liste des rôles : indicateurs, recherche, filtres (entreprise, type,
 * statut), tri, création (FormModal + validation Zod), activation /
 * désactivation et suppression (rôles système protégés). Les permissions
 * s'éditent sur la page de détail.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Alert, Button, Card } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  LoadingState,
  SearchBar,
  FilterBar,
  MetricCard,
  FormModal,
  ConfirmDialog,
  DeleteModal,
} from '@/components/core';
import { ROUTES, roleDetailPath } from '@/routes/route.constants';
import { useRoleStore } from '../store';
import { useRoleListData, useRoleActions, useRoleForm, useTenantScope } from '../hooks';
import { RolesTable, RoleForm } from '../components';
import { toRolePayload, roleDefaultValues } from '../schemas';
import {
  ROLES_ICON,
  ROLE_TYPES,
  ROLE_TYPE_VALUES,
  ROLE_STATUSES,
  ROLE_STATUS_VALUES,
  SORT_DIRECTIONS,
} from '../constants';
import './RolesPage.css';

const toLabelOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const RolesPage = () => {
  const navigate = useNavigate();

  const roles = useRoleStore((state) => state.roles);
  const isSaving = useRoleStore((state) => state.isSaving);
  const error = useRoleStore((state) => state.error);
  const createRole = useRoleStore((state) => state.createRole);
  const clearError = useRoleStore((state) => state.clearError);

  const { scopeCompanyId, companies } = useTenantScope();
  const { actions, isLoading } = useRoleActions();
  const { items, totalItems } = useRoleListData();

  const [createOpen, setCreateOpen] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const search = useRoleStore((state) => state.search);
  const filters = useRoleStore((state) => state.filters);
  const sort = useRoleStore((state) => state.sort);
  const setSearch = useRoleStore((state) => state.setSearch);
  const setFilter = useRoleStore((state) => state.setFilter);
  const resetFilters = useRoleStore((state) => state.resetFilters);
  const setSort = useRoleStore((state) => state.setSort);

  const hasActiveFilters = Boolean(search.trim() || filters.companyId || filters.type || filters.status);

  useEffect(() => {
    actions.refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(
    () => ({
      total: roles.length,
      system: roles.filter((role) => role.isSystem).length,
      active: roles.filter((role) => role.isActive).length,
    }),
    [roles],
  );

  const filterFields = [
    ...(scopeCompanyId === ''
      ? [
          {
            key: 'companyId',
            type: 'select',
            label: 'Entreprise',
            options: companies.map((company) => ({ value: company.id, label: company.name })),
            allLabel: 'Toutes les entreprises',
          },
        ]
      : []),
    {
      key: 'type',
      type: 'select',
      label: 'Type',
      options: toLabelOptions(ROLE_TYPE_VALUES, ROLE_TYPES),
      allLabel: 'Tous les types',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Statut',
      options: toLabelOptions(ROLE_STATUS_VALUES, ROLE_STATUSES),
      allLabel: 'Tous les statuts',
    },
  ];

  const handleValidCreate = async (values) => {
    clearError();
    const result = await createRole(toRolePayload(values));
    if (result.success) {
      setCreateOpen(false);
    }
  };

  const { values, errors, setField, reset, handleSubmit } = useRoleForm({ onSubmit: handleValidCreate });

  const openCreate = () => {
    reset({ ...roleDefaultValues, companyId: scopeCompanyId || '' });
    clearError();
    setCreateOpen(true);
  };

  const handleAction = (key, role) => {
    if (key === 'view' || key === 'permissions') {
      navigate(roleDetailPath(role.id));
      return;
    }
    if (key === 'delete') {
      setDeleteTarget(role);
      return;
    }
    if (key === 'activate') {
      setDialog({
        title: 'Activer le rôle',
        message: `Activer le rôle « ${role.name} » ?`,
        confirmLabel: 'Activer',
        variant: 'success',
        icon: 'bi-toggle-on',
        action: () => actions.activateRole(role.id),
      });
    }
    if (key === 'deactivate') {
      setDialog({
        title: 'Désactiver le rôle',
        message: `Désactiver le rôle « ${role.name} » ? Les utilisateurs rattachés perdront ses permissions.`,
        confirmLabel: 'Désactiver',
        variant: 'warning',
        icon: 'bi-toggle-off',
        action: () => actions.deactivateRole(role.id),
      });
    }
  };

  const handleConfirmDialog = async () => {
    if (!dialog) return;
    const ok = await dialog.action();
    if (ok.success) setDialog(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const ok = await actions.removeRole(deleteTarget.id);
    if (ok.success) setDeleteTarget(null);
  };

  return (
    <PageContainer>
      <Helmet>
        <title>Rôles — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Rôles"
        subtitle="Définissez les rôles et leurs permissions pour contrôler les accès."
        icon={ROLES_ICON}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Rôles' },
        ]}
        actions={
          <div className="d-flex gap-2">
            <Button variant="outline" size="sm" icon="bi-arrow-clockwise" loading={isLoading} onClick={actions.refresh}>
              Rafraîchir
            </Button>
            <Button variant="primary" size="sm" icon="bi-plus-lg" onClick={openCreate}>
              Créer un rôle
            </Button>
          </div>
        }
      />

      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-xl-4">
          <MetricCard label="Rôles" value={stats.total} icon={ROLES_ICON} variant="primary" loading={isLoading} />
        </div>
        <div className="col-12 col-sm-6 col-xl-4">
          <MetricCard label="Rôles système" value={stats.system} icon="bi-shield-check" variant="info" loading={isLoading} />
        </div>
        <div className="col-12 col-sm-6 col-xl-4">
          <MetricCard label="Rôles actifs" value={stats.active} icon="bi-toggle-on" variant="success" loading={isLoading} />
        </div>
      </div>

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <SearchBar value={search} onChange={setSearch} resultCount={totalItems} placeholder="Rechercher un rôle…" />

      <div className="navix-roles-filters mb-3">
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
                options: [
                  { value: 'name', label: 'Nom' },
                  { value: 'code', label: 'Code' },
                  { value: 'usersCount', label: 'Utilisateurs' },
                  { value: 'createdAt', label: 'Date de création' },
                ],
                allLabel: 'Tri : Nom',
              },
              {
                key: 'direction',
                type: 'select',
                label: 'Sens du tri',
                options: SORT_DIRECTIONS,
                allLabel: 'Ordre : Croissant',
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
        <LoadingState variant="table" rows={5} cols={6} label="Chargement des rôles…" />
      ) : items.length === 0 ? (
        <div className="navix-roles-empty">
          {hasActiveFilters ? (
            <>
              <p className="text-muted mb-0">Aucun rôle ne correspond aux critères.</p>
              <Button variant="ghost" size="sm" icon="bi-arrow-counterclockwise" onClick={resetFilters} className="mt-2">
                Réinitialiser les filtres
              </Button>
            </>
          ) : (
            <p className="text-muted mb-0">Aucun rôle pour le moment.</p>
          )}
        </div>
      ) : (
        <>
          <div className="text-muted mb-2">{totalItems} rôle{totalItems > 1 ? 's' : ''}</div>
          <RolesTable
            roles={items}
            sort={sort}
            onSortChange={(by, direction) => setSort(by, direction)}
            onAction={handleAction}
            onView={(role) => navigate(roleDetailPath(role.id))}
          />
        </>
      )}

      <FormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nouveau rôle"
        subtitle="Un rôle regroupe des permissions attribuées aux utilisateurs."
        icon={ROLES_ICON}
        size="lg"
        onSubmit={handleSubmit}
        submitLabel="Créer le rôle"
        loading={isSaving}
        error={error}
      >
        <RoleForm
          values={values}
          errors={errors}
          setField={setField}
          companies={companies}
          showCompany={scopeCompanyId === ''}
        />
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
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer le rôle"
        message={
          deleteTarget
            ? `Supprimer définitivement le rôle « ${deleteTarget.name} » ? Les utilisateurs qui en dépendent perdront ses permissions.`
            : ''
        }
        confirmLabel="Supprimer"
        loading={isSaving}
        onConfirm={handleConfirmDelete}
      />
    </PageContainer>
  );
};

export default RolesPage;
