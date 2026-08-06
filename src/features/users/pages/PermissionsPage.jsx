/**
 * Navix Users — PermissionsPage
 * --------------------------------------------------------------------------
 * Catalogue des permissions (lecture seule) : indicateurs (total, modules,
 * permissions sensibles), matrice Module × Action et cartes par module avec le
 * détail des permissions. Le catalogue est défini par l'application — aucune
 * modification possible ici.
 */
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Alert, Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState, MetricCard } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { usePermissionStore } from '../store';
import { usePermissionListData, usePermissionsByModule } from '../hooks';
import { PermissionsMatrix, PermissionBadge } from '../components';
import { PERMISSIONS_ICON, getPermissionModule } from '../constants';
import './PermissionsPage.css';

const PermissionsPage = () => {
  const fetchAll = usePermissionStore((state) => state.fetchAll);
  const clearError = usePermissionStore((state) => state.clearError);

  const { groups, stats, isLoading, error, refresh } = usePermissionListData();
  const { modules } = usePermissionsByModule();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <PageContainer>
      <Helmet>
        <title>Permissions — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Permissions"
        subtitle="Catalogue complet des permissions de la plateforme — lecture seule."
        icon={PERMISSIONS_ICON}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Permissions' },
        ]}
        actions={
          <div className="d-flex gap-2">
            <Button variant="outline" size="sm" icon="bi-arrow-clockwise" loading={isLoading} onClick={refresh}>
              Rafraîchir
            </Button>
          </div>
        }
      />

      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-xl-4">
          <MetricCard label="Permissions" value={stats?.total ?? 0} icon={PERMISSIONS_ICON} variant="primary" loading={isLoading} />
        </div>
        <div className="col-12 col-sm-6 col-xl-4">
          <MetricCard label="Modules" value={stats?.modules ?? 0} icon="bi-puzzle" variant="info" loading={isLoading} />
        </div>
        <div className="col-12 col-sm-6 col-xl-4">
          <MetricCard label="Permissions sensibles" value={stats?.sensitive ?? 0} icon="bi-shield-exclamation" variant="danger" loading={isLoading} />
        </div>
      </div>

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      {isLoading && !stats ? (
        <LoadingState variant="table" rows={6} cols={8} label="Chargement du catalogue des permissions…" />
      ) : (
        <>
          <div className="mb-3">
            <Card title="Matrice des permissions" subtitle="Une ligne par module, une colonne par action." icon="bi-grid-3x3-gap">
              <PermissionsMatrix modules={modules} groups={groups} />
            </Card>
          </div>

          <Card title="Détail par module" subtitle="Liste exhaustive des permissions du catalogue." icon="bi-list-ul">
            {modules.length === 0 ? (
              <p className="text-muted mb-0">Aucun module dans le catalogue.</p>
            ) : (
              <div className="navix-permissions-page__groups">
                {modules.map((module) => {
                  const meta = getPermissionModule(module);
                  const permissions = groups[module] ?? [];
                  return (
                    <section className="navix-permissions-page__group" key={module}>
                      <h3 className="navix-permissions-page__group-title">
                        {meta.icon && <i className={`bi ${meta.icon} me-2`} aria-hidden="true" />}
                        {meta.label}
                        <span className="navix-permissions-page__group-count">{permissions.length}</span>
                      </h3>
                      <div className="d-flex flex-wrap gap-1">
                        {permissions.map((permission) => (
                          <PermissionBadge key={permission.code} code={permission.code} />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      )}
    </PageContainer>
  );
};

export default PermissionsPage;
