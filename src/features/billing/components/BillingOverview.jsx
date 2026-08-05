/**
 * Navix Billing — BillingOverview
 * --------------------------------------------------------------------------
 * Indicateurs financiers de la facturation (montants facturés, encaissés,
 * restants, en retard + volume de factures) rendus via StatsCards de Core UI.
 * Les montants sont formatés selon la devise par défaut des paramètres.
 */
import { StatsCards } from '@/components/core';
import { formatBillingMoney } from '../constants';

const toPercent = (rate) => `${(Number(rate) * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;

const BillingOverview = ({ stats, loading = false, currency }) => {
  if (!stats) return null;

  const cards = [
    {
      key: 'totalBilled',
      label: 'Facturé (encaissable)',
      value: formatBillingMoney(stats.totalBilled, currency),
      icon: 'bi-receipt',
      variant: 'primary',
    },
    {
      key: 'collected',
      label: 'Encaissé',
      value: formatBillingMoney(stats.collected, currency),
      icon: 'bi-cash-stack',
      variant: 'success',
      variation: toPercent(stats.collectionRate),
      trend: stats.collectionRate >= 0.75 ? 'up' : 'down',
      trendLabel: 'taux de recouvrement',
    },
    {
      key: 'outstanding',
      label: 'Reste à encaisser',
      value: formatBillingMoney(stats.outstanding, currency),
      icon: 'bi-hourglass-split',
      variant: 'warning',
      variation: `${stats.unpaidInvoices} facture${stats.unpaidInvoices > 1 ? 's' : ''}`,
      trend: 'neutral',
      trendLabel: 'factures non soldées',
    },
    {
      key: 'overdue',
      label: 'En retard',
      value: formatBillingMoney(stats.overdue, currency),
      icon: 'bi-exclamation-triangle',
      variant: 'danger',
      variation: `${stats.overdueInvoices} facture${stats.overdueInvoices > 1 ? 's' : ''}`,
      trend: stats.overdueInvoices > 0 ? 'down' : 'neutral',
      trendLabel: 'factures en retard',
    },
  ];

  return <StatsCards stats={cards} loading={loading} columns={4} />;
};

export default BillingOverview;
