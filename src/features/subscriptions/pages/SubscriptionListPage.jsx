/**
 * Navix Subscriptions — SubscriptionListPage
 * --------------------------------------------------------------------------
 * Liste des abonnements : statistiques, recherche instantanée, filtres, tri,
 * pagination, états chargement / erreur / vide et actions (changement de
 * plan, résiliation, suppression). Responsive : tableau sur desktop, cartes
 * sur tablette / mobile.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button } from '@/components/ui';
import { PageContainer, PageHeader, Pagination, LoadingState } from '@/components/core';
import { ROUTES, subscriptionDetailPath } from '@/routes/route.constants';
import { useMediaQuery } from '@/hooks';
import { useCompaniesStore } from '@/features/companies';
import { useSubscriptionsStore } from '../store';
import { useSubscriptionListData } from '../hooks';
import {
  SubscriptionStatsCards,
  SubscriptionSearchBar,
  SubscriptionFilters,
  SubscriptionTable,
  SubscriptionCard,
  SubscriptionEmptyState,
  UpgradePlanModal,
  CancelSubscriptionModal,
  DeleteSubscriptionModal,
} from '../components';

const SubscriptionListPage = () => {
  const navigate = useNavigate();

  const subscriptions = useSubscriptionsStore((state) => state.subscriptions);
  const plans = useSubscriptionsStore((state) => state.plans);
  const search = useSubscriptionsStore((state) => state.search);
  const filters = useSubscriptionsStore((state) => state.filters);
  const sort = useSubscriptionsStore((state) => state.sort);
  const pageSize = useSubscriptionsStore((state) => state.pagination.pageSize);
  const isLoading = useSubscriptionsStore((state) => state.isLoading);
  const isSaving = useSubscriptionsStore((state) => state.isSaving);
  const error = useSubscriptionsStore((state) => state.error);
  const fetchSubscriptions = useSubscriptionsStore((state) => state.fetchSubscriptions);
  const fetchPlans = useSubscriptionsStore((state) => state.fetchPlans);
  const setSearch = useSubscriptionsStore((state) => state.setSearch);
  const setFilter = useSubscriptionsStore((state) => state.setFilter);
  const resetFilters = useSubscriptionsStore((state) => state.resetFilters);
  const setSort = useSubscriptionsStore((state) => state.setSort);
  const setPage = useSubscriptionsStore((state) => state.setPage);
  const setPageSize = useSubscriptionsStore((state) => state.setPageSize);
  const changePlan = useSubscriptionsStore((state) => state.changePlan);
  const cancelSubscription = useSubscriptionsStore((state) => state.cancelSubscription);
  const deleteSubscription = useSubscriptionsStore((state) => state.deleteSubscription);
  const clearError = useSubscriptionsStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const [upgradeTarget, setUpgradeTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modalError, setModalError] = useState('');

  const isCompact = useMediaQuery('(max-width: 991.98px)');

  const companyById = useMemo(
    () => Object.fromEntries(companies.map((company) => [company.id, company])),
    [companies],
  );

  const planById = useMemo(
    () => Object.fromEntries(plans.map((plan) => [plan.id, plan])),
    [plans],
  );

  const { items, totalItems, totalPages, page } = useSubscriptionListData(companyById);

  useEffect(() => {
    fetchSubscriptions();
    fetchPlans();
    fetchCompanies();
  }, [fetchSubscriptions, fetchPlans, fetchCompanies]);

  const hasActiveFilters = Boolean(
    search.trim() ||
      filters.companyId ||
      filters.status ||
      filters.planId ||
      filters.billingInterval,
  );

  const runModalAction = async (action, successMessage) => {
    setModalError('');
    const result = await action();
    if (result.success) {
      toast.success(successMessage);
      setUpgradeTarget(null);
      setCancelTarget(null);
      setDeleteTarget(null);
    } else {
      setModalError(result.error || 'L’opération a échoué.');
    }
  };

  const handleUpgrade = (planId) =>
    runModalAction(
      () => changePlan(upgradeTarget.id, planId),
      `L’abonnement de ${companyById[upgradeTarget.companyId]?.name ?? 'l’entreprise'} est passé au nouveau plan.`,
    );

  const handleCancel = () =>
    runModalAction(
      () => cancelSubscription(cancelTarget.id),
      `L’abonnement de ${companyById[cancelTarget.companyId]?.name ?? 'l’entreprise'} sera résilié en fin de période.`,
    );

  const handleDelete = () =>
    runModalAction(
      () => deleteSubscription(deleteTarget.id),
      `L’abonnement de ${companyById[deleteTarget.companyId]?.name ?? 'l’entreprise'} a été supprimé.`,
    );

  const closeModals = () => {
    setUpgradeTarget(null);
    setCancelTarget(null);
    setDeleteTarget(null);
    setModalError('');
  };

  const breadcrumbs = [{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Abonnements' }];

  const headerActions = (
    <Button variant="primary" icon="bi-stars" onClick={() => navigate(ROUTES.SUBSCRIPTIONS_PLANS)}>
      Voir les plans
    </Button>
  );

  return (
    <PageContainer>
      <Helmet>
        <title>Abonnements — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Abonnements"
        subtitle="Suivez les plans souscrits, la facturation et l'utilisation des ressources."
        icon="bi-credit-card"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      <SubscriptionStatsCards subscriptions={subscriptions} />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <SubscriptionSearchBar value={search} onChange={setSearch} resultCount={totalItems} />

      <SubscriptionFilters
        filters={filters}
        companies={companies}
        plans={plans}
        sort={sort}
        onChange={setFilter}
        onSortChange={(by, direction) => setSort(by, direction)}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isLoading && subscriptions.length === 0 ? (
        <LoadingState variant="table" rows={6} cols={6} label="Chargement des abonnements…" />
      ) : items.length === 0 ? (
        <SubscriptionEmptyState
          hasQuery={hasActiveFilters}
          onReset={hasActiveFilters ? resetFilters : undefined}
          onBrowse={() => navigate(ROUTES.SUBSCRIPTIONS_PLANS)}
        />
      ) : (
        <>
          {isCompact ? (
            <div className="row g-3">
              {items.map((subscription) => (
                <div key={subscription.id} className="col-12 col-sm-6 col-xl-4">
                  <SubscriptionCard
                    subscription={subscription}
                    company={companyById[subscription.companyId]}
                    plan={planById[subscription.planId]}
                    onView={(id) => navigate(subscriptionDetailPath(id))}
                  />
                </div>
              ))}
            </div>
          ) : (
            <SubscriptionTable
              subscriptions={items}
              companyById={companyById}
              planById={planById}
              sort={sort}
              onSortChange={(by, direction) => setSort(by, direction)}
              onView={(id) => navigate(subscriptionDetailPath(id))}
              onUpgrade={setUpgradeTarget}
              onCancel={setCancelTarget}
              onDelete={setDeleteTarget}
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

      <UpgradePlanModal
        open={Boolean(upgradeTarget)}
        onClose={closeModals}
        subscription={upgradeTarget}
        plans={plans}
        loading={isSaving}
        error={modalError}
        onConfirm={handleUpgrade}
      />

      <CancelSubscriptionModal
        open={Boolean(cancelTarget)}
        onClose={closeModals}
        subscription={cancelTarget}
        loading={isSaving}
        error={modalError}
        onConfirm={handleCancel}
      />

      <DeleteSubscriptionModal
        open={Boolean(deleteTarget)}
        onClose={closeModals}
        subscription={deleteTarget}
        loading={isSaving}
        error={modalError}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
};

export default SubscriptionListPage;
