/**
 * Navix Partners — PartnerListPage
 * --------------------------------------------------------------------------
 * Liste des partenaires : statistiques, recherche instantanée, filtres, tri,
 * pagination, états chargement / erreur / vide et suppression.
 * Responsive : tableau sur desktop, cartes sur tablette / mobile.
 * Les actions de création / modification / suppression sont filtrées par
 * permission (RBAC).
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button } from '@/components/ui';
import { PageContainer, PageHeader, Pagination, LoadingState } from '@/components/core';
import { ROUTES, partnerDetailPath, partnerEditPath } from '@/routes/route.constants';
import { useMediaQuery } from '@/hooks';
import { useCompaniesStore } from '@/features/companies';
import { useCan, PERMISSIONS } from '@/features/rbac';
import { usePartnersStore } from '../store';
import { usePartnerListData } from '../hooks';
import {
  PartnerStatsCards,
  PartnerSearchBar,
  PartnerFilters,
  PartnerTable,
  PartnerCard,
  PartnerEmptyState,
  DeletePartnerModal,
} from '../components';

const PartnerListPage = () => {
  const navigate = useNavigate();

  const partnerRecords = usePartnersStore((state) => state.partnerRecords);
  const search = usePartnersStore((state) => state.search);
  const filters = usePartnersStore((state) => state.filters);
  const sort = usePartnersStore((state) => state.sort);
  const pageSize = usePartnersStore((state) => state.pagination.pageSize);
  const isLoading = usePartnersStore((state) => state.isLoading);
  const error = usePartnersStore((state) => state.error);
  const fetchPartnerRecords = usePartnersStore((state) => state.fetchPartnerRecords);
  const setSearch = usePartnersStore((state) => state.setSearch);
  const setFilter = usePartnersStore((state) => state.setFilter);
  const resetFilters = usePartnersStore((state) => state.resetFilters);
  const setSort = usePartnersStore((state) => state.setSort);
  const setPage = usePartnersStore((state) => state.setPage);
  const setPageSize = usePartnersStore((state) => state.setPageSize);
  const deletePartner = usePartnersStore((state) => state.deletePartner);
  const clearError = usePartnersStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const isCompact = useMediaQuery('(max-width: 991.98px)');

  const can = useCan();
  const canCreate = can(PERMISSIONS.PARTNERS_CREATE);
  const canEdit = can(PERMISSIONS.PARTNERS_UPDATE);
  const canDelete = can(PERMISSIONS.PARTNERS_DELETE);

  const companyById = useMemo(
    () => Object.fromEntries(companies.map((company) => [company.id, company])),
    [companies],
  );

  const { items, totalItems, totalPages, page } = usePartnerListData(companyById);

  useEffect(() => {
    fetchPartnerRecords();
    fetchCompanies();
  }, [fetchPartnerRecords, fetchCompanies]);

  const hasActiveFilters = Boolean(
    search.trim() || filters.companyId || filters.type || filters.status || filters.country,
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deletePartner(deleteTarget.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success(`Le partenaire « ${deleteTarget.name} » a été supprimé.`);
      setDeleteTarget(null);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer le partenaire.');
    }
  };

  const closeDelete = () => {
    setDeleteTarget(null);
    setDeleteError('');
  };

  const breadcrumbs = [{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Partenaires' }];

  const headerActions = canCreate ? (
    <Button variant="primary" icon="bi-plus-lg" onClick={() => navigate(ROUTES.PARTNERS_CREATE)}>
      Nouveau partenaire
    </Button>
  ) : undefined;

  return (
    <PageContainer>
      <Helmet>
        <title>Partenaires — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Partenaires"
        subtitle="Gérez vos prestataires, fournisseurs et assureurs."
        icon="bi-handshake"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      <PartnerStatsCards partnerRecords={partnerRecords} />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <PartnerSearchBar value={search} onChange={setSearch} resultCount={totalItems} />

      <PartnerFilters
        filters={filters}
        companies={companies}
        onChange={setFilter}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isLoading && partnerRecords.length === 0 ? (
        <LoadingState variant="table" rows={6} cols={6} label="Chargement des partenaires…" />
      ) : items.length === 0 ? (
        <PartnerEmptyState
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
          onCreate={() => navigate(ROUTES.PARTNERS_CREATE)}
        />
      ) : (
        <>
          {isCompact ? (
            <div className="row g-3">
              {items.map((partner) => (
                <div key={partner.id} className="col-12 col-sm-6 col-xl-4">
                  <PartnerCard
                    partner={partner}
                    company={companyById[partner.companyId]}
                    onView={(id) => navigate(partnerDetailPath(id))}
                    onEdit={(id) => navigate(partnerEditPath(id))}
                    onDelete={setDeleteTarget}
                    canEdit={canEdit}
                    canDelete={canDelete}
                  />
                </div>
              ))}
            </div>
          ) : (
            <PartnerTable
              partnerRecords={items}
              companyById={companyById}
              sort={sort}
              onSortChange={(by, direction) => setSort(by, direction)}
              onView={(id) => navigate(partnerDetailPath(id))}
              onEdit={(id) => navigate(partnerEditPath(id))}
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

      <DeletePartnerModal
        partner={deleteTarget}
        open={Boolean(deleteTarget)}
        loading={isDeleting}
        error={deleteError}
        onConfirm={handleDelete}
        onClose={closeDelete}
      />
    </PageContainer>
  );
};

export default PartnerListPage;
