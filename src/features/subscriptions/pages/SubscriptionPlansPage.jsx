/**
 * Navix Subscriptions — SubscriptionPlansPage
 * --------------------------------------------------------------------------
 * Catalogue des plans d'abonnement : cartes des offres (prix, essai,
 * fonctionnalités) et table comparative complète par catégorie. Le plan le
 * plus souscrit est signalé comme « plan actuel ».
 */
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Alert, Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { useSubscriptionsStore } from '../store';
import { subscriptionService } from '../services';
import { PlanCard, PlanComparison } from '../components';

const SubscriptionPlansPage = () => {
  const navigate = useNavigate();

  const plans = useSubscriptionsStore((state) => state.plans);
  const features = useSubscriptionsStore((state) => state.features);
  const subscriptions = useSubscriptionsStore((state) => state.subscriptions);
  const isLoading = useSubscriptionsStore((state) => state.isLoading);
  const error = useSubscriptionsStore((state) => state.error);
  const fetchPlans = useSubscriptionsStore((state) => state.fetchPlans);
  const fetchFeatures = useSubscriptionsStore((state) => state.fetchFeatures);
  const fetchSubscriptions = useSubscriptionsStore((state) => state.fetchSubscriptions);
  const clearError = useSubscriptionsStore((state) => state.clearError);

  useEffect(() => {
    fetchPlans();
    fetchFeatures();
    fetchSubscriptions();
  }, [fetchPlans, fetchFeatures, fetchSubscriptions]);

  const planById = useMemo(
    () => Object.fromEntries(plans.map((plan) => [plan.id, plan])),
    [plans],
  );

  const planFeaturesByCode = useMemo(() => {
    const map = {};
    plans.forEach((plan) => {
      map[plan.code] = features.filter((feature) =>
        subscriptionService.hasFeature(feature.code, plan.code),
      );
    });
    return map;
  }, [plans, features]);

  const mostUsedPlanCode = useMemo(() => {
    const counts = subscriptions.reduce((acc, subscription) => {
      const code = planById[subscription.planId]?.code;
      if (code) acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  }, [subscriptions, planById]);

  const breadcrumbs = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Abonnements', to: ROUTES.SUBSCRIPTIONS },
    { label: 'Plans' },
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>Plans d'abonnement — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Plans d'abonnement"
        subtitle="Choisissez l'offre adaptée à vos besoins : fonctionnalités, limites et prix simulés."
        icon="bi-stars"
        breadcrumbs={breadcrumbs}
        actions={
          <Button variant="outline" icon="bi-credit-card" onClick={() => navigate(ROUTES.SUBSCRIPTIONS)}>
            Retour aux abonnements
          </Button>
        }
      />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      {isLoading && plans.length === 0 ? (
        <LoadingState variant="cards" rows={4} label="Chargement des plans…" />
      ) : (
        <>
          <div className="row g-3">
            {plans.map((plan) => (
              <div key={plan.id} className="col-12 col-md-6 col-xl-3">
                <PlanCard
                  plan={plan}
                  features={planFeaturesByCode[plan.code] || []}
                  active={plan.code === mostUsedPlanCode}
                  onSelect={() => navigate(ROUTES.SUBSCRIPTIONS)}
                />
              </div>
            ))}
          </div>

          <Card title="Comparer les plans" className="mt-4">
            <PlanComparison
              plans={plans}
              features={features}
              planFeatures={planFeaturesByCode}
            />
          </Card>
        </>
      )}
    </PageContainer>
  );
};

export default SubscriptionPlansPage;
