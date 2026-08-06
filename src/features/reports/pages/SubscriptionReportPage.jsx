/**
 * Navix Reports — Abonnements (subscriptions)
 * --------------------------------------------------------------------------
 * Plans, revenus récurrents et statuts des abonnements.
 */
import ReportContentView from './ReportContentView';
import { reportColumn, moneyColumn } from './reportColumns';
import { reportBadges } from '../constants';
import { SUBSCRIPTION_STATUS_OPTIONS } from './reportOptions';

const SubscriptionReportPage = () => {
  const columns = [
    reportColumn('companyName', 'Entreprise'),
    reportColumn('plan', 'Plan'),
    reportColumn('planCode', 'Code plan'),
    reportColumn('status', 'Statut', { badge: reportBadges.subscriptionStatus }),
    moneyColumn('price', 'Montant'),
    reportColumn('billingInterval', 'Facturation'),
    reportColumn('startDate', 'Début', { format: 'date' }),
    reportColumn('currentPeriodEnd', 'Fin de période', { format: 'date' }),
  ];

  return (
    <ReportContentView
      reportType="subscriptions"
      columns={columns}
      statusOptions={SUBSCRIPTION_STATUS_OPTIONS}
      breakdownTitle="Répartition par plan"
      exportFilename="rapport-abonnements"
    />
  );
};

export default SubscriptionReportPage;
