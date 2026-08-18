/**
 * Navix Partner Portal — PartnerAlertsPage (PROMPT 075)
 * ─────────────────────────────────────────────────────
 * Centre de Pilotage : Alertes & Échéances
 * Page de suivi des alertes, notifications d'échéances et délais critiques.
 *
 * Architecture :
 *   - KPI : 5 cartes (total, urgent, attention, info, action requise)
 *   - Échéances : prochaines échéances triées par urgence
 *   - Filtres : recherche, sévérité, statut, type
 *   - Tableau : alertes avec actions (acknowledge, resolve, dismiss)
 *   - Pagination côté client
 */
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { PageContainer, PageHeader, LoadingState, ErrorState } from '@/components/core';
import { usePartnerAlerts } from '../hooks/usePartnerAlerts';
import {
  PartnerAlertStats,
  PartnerAlertFilters,
  PartnerAlertTable,
  PartnerAlertEcheances,
} from '../components/PartnerAlerts';
import '../components/PartnerAlerts/PartnerAlerts.css';

const PartnerAlertsPage = () => {
  const {
    alerts,
    stats,
    total,
    totalPages,
    isLoading,
    error,
    filters,
    setFilters,
    acknowledgeAlert,
    resolveAlert,
    dismissAlert,
    acknowledgeAll,
    refetch,
  } = usePartnerAlerts({ pageSize: 10 });

  const handleAcknowledge = async (alertId) => {
    const ok = await acknowledgeAlert(alertId);
    if (ok) toast.success('Alerte prise en compte');
  };

  const handleResolve = async (alertId) => {
    const ok = await resolveAlert(alertId);
    if (ok) toast.success('Alerte marquée comme traitée');
  };

  const handleDismiss = async (alertId) => {
    const ok = await dismissAlert(alertId);
    if (ok) toast.success('Alerte ignorée');
  };

  const handleAcknowledgeAll = async () => {
    const ok = await acknowledgeAll();
    if (ok) toast.success('Toutes les alertes prises en compte');
  };

  const handleRetry = () => {
    refetch();
  };

  return (
    <PageContainer>
      <Helmet>
        <title>Alertes & Échéances — Espace Partenaire</title>
      </Helmet>

      <PageHeader
        title="Alertes & Échéances"
        subtitle="Centre de pilotage pour le suivi des alertes, échéances et délais critiques"
        actions={[
          {
            label: 'Tout prendre en compte',
            icon: 'bi-check-all',
            onClick: handleAcknowledgeAll,
            variant: 'secondary',
          },
          {
            label: 'Actualiser',
            icon: 'bi-arrow-clockwise',
            onClick: handleRetry,
            variant: 'secondary',
          },
        ]}
      />

      {isLoading && <LoadingState label="Chargement des alertes..." />}
      {error && !isLoading && (
        <ErrorState
          title="Erreur de chargement"
          description={error}
          retry={handleRetry}
        />
      )}

      {!isLoading && !error && (
        <>
          <PartnerAlertStats stats={stats} />

          <PartnerAlertEcheances alerts={alerts} />

          <PartnerAlertFilters
            filters={filters}
            onFilterChange={setFilters}
          />

          <PartnerAlertTable
            alerts={alerts}
            total={total}
            totalPages={totalPages}
            filters={filters}
            onFilterChange={setFilters}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
            onDismiss={handleDismiss}
            isLoading={isLoading}
          />
        </>
      )}
    </PageContainer>
  );
};

export default PartnerAlertsPage;
