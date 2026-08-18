/**
 * Navix Partner Portal — PartnerRevenuePage (PROMPT 070)
 * --------------------------------------------------------------------------
 * Page principale Revenus & Commissions : KPI + graphique + tableau.
 * Réutilise l'infrastructure existante — NE PAS créer un 2e système financier.
 */
import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState, ErrorState } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { FCFA_LABEL } from '../constants/partner.constants';
import { usePartnerContext } from '../hooks/usePartnerContext';
import { usePartnerRevenue } from '../hooks/usePartnerRevenue';
import PartnerRevenueStats from '../components/PartnerRevenue/PartnerRevenueStats';
import PartnerRevenueChart from '../components/PartnerRevenue/PartnerRevenueChart';
import PartnerRevenueTable from '../components/PartnerRevenue/PartnerRevenueTable';
import '@/features/client/components/ClientFinance/ClientFinance.css';

const PartnerRevenuePage = () => {
  const { companyName } = usePartnerContext();
  const { revenues, stats, evolution, isLoading, error, refetch } = usePartnerRevenue();
  const [period, setPeriod] = useState('all');

  const handlePeriodChange = useCallback((value) => {
    setPeriod(value);
    refetch({ period: value });
  }, [refetch]);

  if (isLoading && !stats) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement des revenus…" />
      </PageContainer>
    );
  }

  if (error && !stats) {
    return (
      <PageContainer>
        <ErrorState
          title="Impossible de charger les revenus"
          description="Les données sont temporairement indisponibles."
          retry={() => refetch({ period })}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Revenus — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title="Revenus"
        subtitle={`Suivez les revenus générés par vos prestations et missions — ${companyName || 'votre entreprise partenaire'}.`}
        icon="bi-cash-coin"
        breadcrumbs={[
          { label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD },
          { label: 'Finances', to: ROUTES.PARTNER_FINANCE },
          { label: 'Revenus' },
        ]}
        actions={
          <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={() => refetch({ period })} aria-label="Actualiser">
            <span className="visually-hidden">Actualiser</span>
          </Button>
        }
      />

      <PartnerRevenueStats stats={stats} period={period} onPeriodChange={handlePeriodChange} />

      <div className="row g-3 mb-4">
        <div className="col-12">
          <PartnerRevenueChart evolution={evolution} />
        </div>
      </div>

      <PartnerRevenueTable revenues={revenues} />
    </PageContainer>
  );
};

export default PartnerRevenuePage;
