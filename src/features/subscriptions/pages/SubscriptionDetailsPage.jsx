/**
 * Navix Subscriptions — SubscriptionDetailsPage
 * --------------------------------------------------------------------------
 * Détail d'un abonnement : en-tête (entreprise, plan, statut, prix),
 * informations de facturation, fonctionnalités incluses, utilisation des
 * ressources et chronologie du cycle de vie. Actions : changement de plan,
 * résiliation, reprise, renouvellement et suppression.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Badge, Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useSubscriptionsStore } from '../store';
import { buildUsageRows } from '../hooks';
import {
  SubscriptionStatusBadge,
  FeatureList,
  SubscriptionUsage,
  SubscriptionTimeline,
  TrialBanner,
  LimitAlert,
  UpgradePlanModal,
  CancelSubscriptionModal,
  DeleteSubscriptionModal,
} from '../components';
import {
  getPlan,
  getBillingInterval,
  formatSubscriptionMoney,
  formatSubscriptionDate,
  formatSubscriptionDateTime,
  MONTHS_PER_BILLING_INTERVAL,
} from '../constants';
import './SubscriptionDetailsPage.css';

const InfoRow = ({ icon, label, children }) => (
  <div className="d-flex align-items-start gap-3 py-2">
    <span className="navix-subscription-detail__icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <div className="min-w-0">
      <dt className="navix-subscription-detail__label">{label}</dt>
      <dd className="navix-subscription-detail__value mb-0">{children}</dd>
    </div>
  </div>
);

const StatBox = ({ icon, label, value }) => (
  <div className="navix-subscription-detail__stat">
    <span className="navix-subscription-detail__stat-icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <span className="navix-subscription-detail__stat-body">
      <span className="navix-subscription-detail__stat-value">{value}</span>
      <span className="navix-subscription-detail__stat-label">{label}</span>
    </span>
  </div>
);

const SubscriptionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedSubscription = useSubscriptionsStore((state) => state.selectedSubscription);
  const selectedPlan = useSubscriptionsStore((state) => state.selectedPlan);
  const selectedPlanFeatures = useSubscriptionsStore((state) => state.selectedPlanFeatures);
  const selectedPlanLimits = useSubscriptionsStore((state) => state.selectedPlanLimits);
  const selectedUsage = useSubscriptionsStore((state) => state.selectedUsage);
  const plans = useSubscriptionsStore((state) => state.plans);
  const features = useSubscriptionsStore((state) => state.features);
  const isLoading = useSubscriptionsStore((state) => state.isLoading);
  const isSaving = useSubscriptionsStore((state) => state.isSaving);
  const error = useSubscriptionsStore((state) => state.error);
  const fetchSubscription = useSubscriptionsStore((state) => state.fetchSubscription);
  const fetchPlans = useSubscriptionsStore((state) => state.fetchPlans);
  const fetchFeatures = useSubscriptionsStore((state) => state.fetchFeatures);
  const changePlan = useSubscriptionsStore((state) => state.changePlan);
  const cancelSubscription = useSubscriptionsStore((state) => state.cancelSubscription);
  const resumeSubscription = useSubscriptionsStore((state) => state.resumeSubscription);
  const renewSubscription = useSubscriptionsStore((state) => state.renewSubscription);
  const deleteSubscription = useSubscriptionsStore((state) => state.deleteSubscription);
  const clearError = useSubscriptionsStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isActing, setIsActing] = useState(false);

  useEffect(() => {
    if (id) fetchSubscription(id);
    fetchPlans();
    fetchFeatures();
    fetchCompanies();
  }, [id, fetchSubscription, fetchPlans, fetchFeatures, fetchCompanies]);

  const subscription = selectedSubscription?.id === id ? selectedSubscription : null;
  const company = useMemo(
    () => (subscription ? companies.find((item) => item.id === subscription.companyId) : null),
    [companies, subscription],
  );

  const usageRows = useMemo(
    () =>
      buildUsageRows({
        plan: selectedPlan,
        usage: selectedUsage || {},
        limits: selectedPlanLimits || {},
      }),
    [selectedPlan, selectedUsage, selectedPlanLimits],
  );

  const planMeta = selectedPlan ? getPlan(selectedPlan.code) : null;
  const billingMeta = subscription ? getBillingInterval(subscription.billingInterval) : null;

  const closeModals = () => {
    setUpgradeOpen(false);
    setCancelOpen(false);
    setDeleteOpen(false);
    setModalError('');
  };

  const runAction = async (action, successMessage, then) => {
    if (!id) return;
    setIsActing(true);
    setModalError('');
    const result = await action();
    setIsActing(false);
    if (result.success) {
      toast.success(successMessage);
      then?.();
    } else {
      setModalError(result.error || 'L’opération a échoué.');
    }
  };

  const handleUpgrade = (planId) =>
    runAction(
      () => changePlan(id, planId),
      'Plan mis à jour.',
      () => fetchSubscription(id),
    );

  const handleCancel = () =>
    runAction(
      () => cancelSubscription(id),
      'Résiliation programmée en fin de période.',
      () => fetchSubscription(id),
    );

  const handleResume = () =>
    runAction(() => resumeSubscription(id), 'Abonnement repris.', () => fetchSubscription(id));

  const handleRenew = () =>
    runAction(() => renewSubscription(id), 'Abonnement renouvelé.', () => fetchSubscription(id));

  const handleDelete = () =>
    runAction(
      () => deleteSubscription(id),
      'Abonnement supprimé.',
      () => navigate(ROUTES.SUBSCRIPTIONS),
    );

  if (!subscription) {
    return (
      <PageContainer>
        {isLoading ? (
          <LoadingState variant="text" lines={6} label="Chargement de l’abonnement…" />
        ) : (
          <Alert variant="danger" closable onClose={clearError} className="mb-3">
            {error || 'Abonnement introuvable.'}
          </Alert>
        )}
      </PageContainer>
    );
  }

  const price = subscription.billingInterval === 'yearly'
    ? Math.round(Number(subscription.price || 0) * MONTHS_PER_BILLING_INTERVAL.yearly * 0.833)
    : Number(subscription.price || 0);

  const breadcrumbs = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Abonnements', to: ROUTES.SUBSCRIPTIONS },
    { label: company ? company.name : '…' },
  ];

  const actions = (
    <div className="d-flex gap-2 flex-wrap">
      {subscription.status === 'paused' && (
        <Button variant="outline" icon="bi-play-circle" loading={isActing} onClick={handleResume}>
          Reprendre
        </Button>
      )}
      {['cancelled', 'expired'].includes(subscription.status) && (
        <Button variant="outline" icon="bi-arrow-clockwise" loading={isActing} onClick={handleRenew}>
          Renouveler
        </Button>
      )}
      {!['cancelled', 'expired'].includes(subscription.status) && (
        <Button variant="outline" icon="bi-arrow-repeat" loading={isActing} onClick={() => setUpgradeOpen(true)}>
          Changer de plan
        </Button>
      )}
      {!['cancelled', 'expired'].includes(subscription.status) && (
        <Button variant="outline" icon="bi-x-circle" loading={isActing} onClick={() => setCancelOpen(true)}>
          Résilier
        </Button>
      )}
      <Button variant="outline" icon="bi-trash3" loading={isActing} onClick={() => setDeleteOpen(true)}>
        Supprimer
      </Button>
    </div>
  );

  return (
    <PageContainer>
      <Helmet>
        <title>{company ? `${company.name} — Abonnement — Navix Management` : 'Abonnement — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title={company ? company.name : 'Abonnement'}
        subtitle={planMeta ? `Plan ${planMeta.label}` : undefined}
        icon="bi-credit-card"
        breadcrumbs={breadcrumbs}
        actions={actions}
      />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <TrialBanner
        subscription={subscription}
        plan={selectedPlan}
        onUpgrade={() => setUpgradeOpen(true)}
      />

      <LimitAlert rows={usageRows} />

      <div className="card mb-3">
        <div className="card-body d-flex flex-wrap align-items-center gap-3">
          <div className="flex-grow-1 min-w-0">
            <div className="d-flex flex-wrap gap-2">
              <SubscriptionStatusBadge status={subscription.status} />
              {planMeta && (
                <Badge variant={planMeta.variant} icon={planMeta.icon} label={planMeta.label} />
              )}
              {billingMeta && (
                <Badge variant={billingMeta.variant} icon={billingMeta.icon} label={billingMeta.label} />
              )}
              {company && (
                <Badge variant="dark" soft>
                  {company.name}
                </Badge>
              )}
            </div>
            <p className="text-secondary mb-0 mt-2">
              <code>{subscription.id}</code>
              {selectedPlan ? ` · ${selectedPlan.name}` : ''}
            </p>
          </div>
          <div className="navix-subscription-detail__stats d-flex gap-2 flex-wrap">
            <StatBox icon="bi-cash-stack" label="Prix" value={formatSubscriptionMoney(price, subscription.currency)} />
            <StatBox
              icon="bi-calendar-range"
              label="Échéance"
              value={formatSubscriptionDate(subscription.currentPeriodEnd)}
            />
            <StatBox icon="bi-check-circle" label="Fonctionnalités" value={selectedPlanFeatures.length} />
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <Card title="Informations">
            <dl className="mb-0">
              <InfoRow icon="bi-buildings" label="Entreprise">
                {company ? company.name : '—'}
              </InfoRow>
              <InfoRow icon="bi-stars" label="Plan">
                {planMeta ? (
                  <Badge variant={planMeta.variant} icon={planMeta.icon} label={planMeta.label} />
                ) : (
                  '—'
                )}
              </InfoRow>
              <InfoRow icon="bi-credit-card" label="Statut">
                <SubscriptionStatusBadge status={subscription.status} />
              </InfoRow>
              <InfoRow icon="bi-calendar-month" label="Facturation">
                {billingMeta ? `${billingMeta.label} · ${formatSubscriptionMoney(price, subscription.currency)}` : '—'}
              </InfoRow>
              <InfoRow icon="bi-calendar-plus" label="Début d’abonnement">
                {formatSubscriptionDate(subscription.startDate)}
              </InfoRow>
              <InfoRow icon="bi-calendar-range" label="Période courante">
                {formatSubscriptionDate(subscription.currentPeriodStart)} →{' '}
                {formatSubscriptionDate(subscription.currentPeriodEnd)}
              </InfoRow>
              <InfoRow icon="bi-arrow-clockwise" label="Renouvellement">
                {formatSubscriptionDate(subscription.renewalDate)}
              </InfoRow>
              <InfoRow icon="bi-calendar-check" label="Essai gratuit">
                {subscription.trialEndDate
                  ? `Jusqu’au ${formatSubscriptionDate(subscription.trialEndDate)}`
                  : 'Non concerné'}
              </InfoRow>
              <InfoRow icon="bi-clock" label="Créée le">
                {formatSubscriptionDateTime(subscription.createdAt)}
              </InfoRow>
              <InfoRow icon="bi-arrow-repeat" label="Mis à jour le">
                {formatSubscriptionDateTime(subscription.updatedAt)}
              </InfoRow>
            </dl>
          </Card>

          <Card title={`Fonctionnalités incluses (${selectedPlanFeatures.length})`} className="mt-3">
            <FeatureList
              features={selectedPlanFeatures}
              allFeatures={features}
              columns={selectedPlanFeatures.length > 8 ? 3 : 2}
            />
          </Card>
        </div>

        <div className="col-lg-5">
          <Card title="Utilisation du plan">
            <SubscriptionUsage rows={usageRows} compact />
          </Card>

          <Card title="Historique" className="mt-3">
            <SubscriptionTimeline subscription={subscription} plan={selectedPlan} />
          </Card>
        </div>
      </div>

      <UpgradePlanModal
        open={upgradeOpen}
        onClose={closeModals}
        subscription={subscription}
        plans={plans}
        loading={isSaving}
        error={modalError}
        onConfirm={handleUpgrade}
      />

      <CancelSubscriptionModal
        open={cancelOpen}
        onClose={closeModals}
        subscription={subscription}
        loading={isSaving}
        error={modalError}
        onConfirm={handleCancel}
      />

      <DeleteSubscriptionModal
        open={deleteOpen}
        onClose={closeModals}
        subscription={subscription}
        loading={isSaving}
        error={modalError}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
};

export default SubscriptionDetailsPage;
