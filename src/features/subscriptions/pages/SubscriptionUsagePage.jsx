/**
 * Navix Subscriptions — SubscriptionUsagePage
 * --------------------------------------------------------------------------
 * Utilisation des ressources plan par plan : consommation des entreprises
 * (véhicules, chauffeurs, stockage…) face aux limites de leur plan, avec
 * niveaux normal / attention / critique. Une entreprise précise peut être
 * affichée via le paramètre d'URL `companyId`.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Alert, Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, DataTable, LoadingState } from '@/components/core';
import { ROUTES, subscriptionDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useSubscriptionsStore } from '../store';
import { subscriptionService } from '../services';
import { buildUsageRows } from '../hooks';
import {
  SubscriptionStatusBadge,
  LimitAlert,
  SubscriptionUsage,
} from '../components';
import { getPlan } from '../constants';
import './SubscriptionUsagePage.css';

const SubscriptionUsagePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('companyId') || '';

  const plans = useSubscriptionsStore((state) => state.plans);
  const subscriptions = useSubscriptionsStore((state) => state.subscriptions);
  const isLoading = useSubscriptionsStore((state) => state.isLoading);
  const error = useSubscriptionsStore((state) => state.error);
  const fetchPlans = useSubscriptionsStore((state) => state.fetchPlans);
  const fetchSubscriptions = useSubscriptionsStore((state) => state.fetchSubscriptions);
  const clearError = useSubscriptionsStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const [entries, setEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchCompanies();
    fetchSubscriptions();
  }, [fetchPlans, fetchCompanies, fetchSubscriptions]);

  useEffect(() => {
    if (!subscriptions.length || !plans.length) return;
    let cancelled = false;

    const loadEntries = async () => {
      setEntriesLoading(true);
      try {
        const result = await Promise.all(
          subscriptions.map(async (subscription) => {
            const plan = plans.find((item) => item.id === subscription.planId);
            const company = companies.find((item) => item.id === subscription.companyId);
            const [usage, limits] = await Promise.all([
              subscriptionService.getUsage(subscription.companyId),
              subscriptionService.getPlanLimits(subscription.planId),
            ]);
            return {
              subscription,
              plan,
              company,
              rows: buildUsageRows({ plan, usage: usage || {}, limits: limits || {} }),
            };
          }),
        );
        if (!cancelled) setEntries(result);
      } finally {
        if (!cancelled) setEntriesLoading(false);
      }
    };

    loadEntries();
    return () => {
      cancelled = true;
    };
  }, [subscriptions, plans, companies]);

  const detailedEntry = useMemo(
    () => entries.find((entry) => entry.subscription.companyId === companyId) || null,
    [entries, companyId],
  );

  const summary = useMemo(
    () =>
      entries.map((entry) => {
        const maxRow = [...entry.rows].sort((a, b) => (b.ratio ?? 0) - (a.ratio ?? 0))[0];
        const alertCount = entry.rows.filter(
          (row) => row.ratio !== null && ['warning', 'critical'].includes(row.level.variant),
        ).length;
        return { entry, maxRow, alertCount };
      }),
    [entries],
  );

  const columns = [
    {
      key: 'company',
      label: 'Entreprise',
      sortable: false,
      render: ({ entry }) => (
        <button
          type="button"
          className="navix-usage-page__link"
          onClick={() => navigate(subscriptionDetailPath(entry.subscription.id))}
        >
          {entry.company?.name ?? '—'}
        </button>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: ({ entry }) => {
        const meta = getPlan(entry.plan?.code);
        return (
          <span className="navix-usage-page__plan">
            <i className={`bi ${meta.icon} me-1`} aria-hidden="true" />
            {entry.plan?.name ?? '—'}
          </span>
        );
      },
    },
    {
      key: 'maxUsage',
      label: 'Ressource la plus utilisée',
      render: ({ maxRow }) => (
        <div className="navix-usage-page__cell">
          {maxRow ? (
            <>
              <span className="navix-usage-page__cell-label">{maxRow.label}</span>
              <div className="progress" style={{ height: '0.5rem' }}>
                <div
                  className={`progress-bar bg-${maxRow.level.variant}`}
                  role="progressbar"
                  style={{ width: `${Math.min(100, Math.round((maxRow.ratio || 0) * 100))}%` }}
                  aria-valuenow={Math.round((maxRow.ratio || 0) * 100)}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </>
          ) : (
            '—'
          )}
        </div>
      ),
    },
    {
      key: 'alerts',
      label: 'Limites à surveiller',
      align: 'center',
      render: ({ alertCount }) =>
        alertCount > 0 ? (
          <span className={`badge rounded-pill text-bg-${alertCount > 2 ? 'danger' : 'warning'}`}>
            {alertCount}
          </span>
        ) : (
          <i className="bi bi-check-circle text-success" aria-label="Aucune limite atteinte" />
        ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: ({ entry }) => <SubscriptionStatusBadge status={entry.subscription.status} />,
    },
  ];

  const breadcrumbs = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Abonnements', to: ROUTES.SUBSCRIPTIONS },
    { label: 'Utilisation & limites' },
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>Utilisation & limites — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Utilisation & limites"
        subtitle="Suivez la consommation des ressources de chaque entreprise face aux plafonds de son plan."
        icon="bi-graph-up"
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

      {detailedEntry ? (
        <>
          {companyId && (
            <Button
              variant="ghost"
              size="sm"
              icon="bi-arrow-left"
              className="mb-3"
              onClick={() => navigate(ROUTES.SUBSCRIPTIONS_USAGE)}
            >
              Toutes les entreprises
            </Button>
          )}
          <LimitAlert rows={detailedEntry.rows} />
          <Card
            title={
              detailedEntry.company
                ? `Utilisation — ${detailedEntry.company.name} (${detailedEntry.plan?.name ?? '—'})`
                : 'Utilisation du plan'
            }
          >
            <SubscriptionUsage rows={detailedEntry.rows} />
          </Card>
        </>
      ) : isLoading || entriesLoading ? (
        <LoadingState variant="table" rows={6} cols={5} label="Chargement de l'utilisation…" />
      ) : summary.length === 0 ? (
        <Alert variant="info" icon="bi-info-circle">
          Aucun abonnement actif pour afficher l'utilisation des ressources.
        </Alert>
      ) : (
        <DataTable
          className="navix-usage-page"
          columns={columns}
          rows={summary}
          ariaLabel="Utilisation des ressources par entreprise"
          onRowClick={({ entry }) => navigate(subscriptionDetailPath(entry.subscription.id))}
          actions={[
            {
              key: 'detail',
              label: ({ entry }) => `Voir l'utilisation de ${entry.company?.name ?? 'l’entreprise'}`,
              title: "Voir l'utilisation",
              icon: 'bi-bar-chart-line',
              onClick: ({ entry }) => navigate(subscriptionDetailPath(entry.subscription.id)),
            },
          ]}
        />
      )}
    </PageContainer>
  );
};

export default SubscriptionUsagePage;
