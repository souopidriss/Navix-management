/**
 * Navix Billing — BillingDashboardPage
 * --------------------------------------------------------------------------
 * Tableau de bord de facturation : indicateurs financiers simulés, factures
 * récentes, paiements récents, journal de facturation et avoirs / remises.
 */
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Alert, Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState } from '@/components/core';
import { ROUTES, invoiceDetailPath, paymentDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useBillingStore } from '../store';
import { BillingOverview, BillingHistory, CreditsPanel, InvoiceStatusBadge, PaymentStatusBadge, BillingAmount } from '../components';
import { formatBillingDate, BILLING_ICON } from '../constants';
import './BillingDashboardPage.css';

const BillingDashboardPage = () => {
  const navigate = useNavigate();

  const invoices = useBillingStore((state) => state.invoices);
  const payments = useBillingStore((state) => state.payments);
  const credits = useBillingStore((state) => state.credits);
  const discounts = useBillingStore((state) => state.discounts);
  const history = useBillingStore((state) => state.history);
  const statistics = useBillingStore((state) => state.statistics);
  const settings = useBillingStore((state) => state.settings);
  const isLoading = useBillingStore((state) => state.isLoading);
  const error = useBillingStore((state) => state.error);
  const fetchInvoices = useBillingStore((state) => state.fetchInvoices);
  const fetchPayments = useBillingStore((state) => state.fetchPayments);
  const fetchCredits = useBillingStore((state) => state.fetchCredits);
  const fetchDiscounts = useBillingStore((state) => state.fetchDiscounts);
  const fetchHistory = useBillingStore((state) => state.fetchHistory);
  const fetchStatistics = useBillingStore((state) => state.fetchStatistics);
  const fetchSettings = useBillingStore((state) => state.fetchSettings);
  const clearError = useBillingStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  useEffect(() => {
    fetchInvoices();
    fetchPayments();
    fetchCredits();
    fetchDiscounts();
    fetchHistory();
    fetchStatistics();
    fetchSettings();
    fetchCompanies();
  }, [
    fetchInvoices,
    fetchPayments,
    fetchCredits,
    fetchDiscounts,
    fetchHistory,
    fetchStatistics,
    fetchSettings,
    fetchCompanies,
  ]);

  const companyById = useMemo(
    () => Object.fromEntries(companies.map((company) => [company.id, company])),
    [companies],
  );

  const recentInvoices = invoices.slice(0, 5);
  const recentPayments = payments.slice(0, 5);
  const recentHistory = history.slice(0, 6);

  const currency = settings?.defaultCurrency || statistics?.currency || 'EUR';
  const loading = isLoading && invoices.length === 0;

  return (
    <PageContainer>
      <Helmet>
        <title>Facturation — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Facturation"
        subtitle="Vue d'ensemble de la facturation SaaS simulée."
        icon={BILLING_ICON}
        breadcrumbs={[{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Facturation' }]}
        actions={
          <div className="d-flex gap-2 flex-wrap">
            <Button variant="outline" icon="bi-cash-coin" onClick={() => navigate(ROUTES.BILLING_PAYMENTS)}>
              Paiements
            </Button>
            <Button variant="outline" icon="bi-clock-history" onClick={() => navigate(ROUTES.BILLING_HISTORY)}>
              Historique
            </Button>
            <Button variant="primary" icon="bi-receipt" onClick={() => navigate(ROUTES.BILLING_INVOICES)}>
              Voir les factures
            </Button>
          </div>
        }
      />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      {loading ? (
        <LoadingState variant="cards" count={4} label="Chargement des indicateurs…" />
      ) : (
        <BillingOverview stats={statistics} currency={currency} />
      )}

      <div className="row g-3 mt-1">
        <div className="col-lg-7">
          <Card
            title={
              <>
                <i className="bi bi-receipt me-1" aria-hidden="true" /> Dernières factures
              </>
            }
            actions={
              <Button variant="ghost" size="sm" icon="bi-arrow-right" onClick={() => navigate(ROUTES.BILLING_INVOICES)}>
                Tout voir
              </Button>
            }
          >
            {recentInvoices.length === 0 ? (
              <p className="text-secondary mb-0">Aucune facture récente.</p>
            ) : (
              <ul className="navix-billing-dashboard__list mb-0">
                {recentInvoices.map((invoice) => (
                  <li key={invoice.id}>
                    <button
                      type="button"
                      className="navix-billing-dashboard__row"
                      onClick={() => navigate(invoiceDetailPath(invoice.id))}
                      title={`Voir la facture ${invoice.number}`}
                    >
                      <span className="navix-billing-dashboard__row-main">
                        <code>{invoice.number}</code>
                        <span className="navix-billing-dashboard__row-sub">
                          {companyById[invoice.companyId]?.name ?? '—'} · {formatBillingDate(invoice.dueDate)}
                        </span>
                      </span>
                      <span className="navix-billing-dashboard__row-meta">
                        <InvoiceStatusBadge status={invoice.status} size="sm" />
                        <span className="tabular-nums">
                          <BillingAmount value={invoice.total} currency={invoice.currency} />
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            className="mt-3"
            title={
              <>
                <i className="bi bi-cash-coin me-1" aria-hidden="true" /> Derniers paiements
              </>
            }
            actions={
              <Button variant="ghost" size="sm" icon="bi-arrow-right" onClick={() => navigate(ROUTES.BILLING_PAYMENTS)}>
                Tout voir
              </Button>
            }
          >
            {recentPayments.length === 0 ? (
              <p className="text-secondary mb-0">Aucun paiement récent.</p>
            ) : (
              <ul className="navix-billing-dashboard__list mb-0">
                {recentPayments.map((payment) => (
                  <li key={payment.id}>
                    <button
                      type="button"
                      className="navix-billing-dashboard__row"
                      onClick={() => navigate(paymentDetailPath(payment.id))}
                      title={`Voir le paiement ${payment.number}`}
                    >
                      <span className="navix-billing-dashboard__row-main">
                        <code>{payment.number}</code>
                        <span className="navix-billing-dashboard__row-sub">
                          {companyById[payment.companyId]?.name ?? '—'} · {formatBillingDate(payment.paymentDate)}
                        </span>
                      </span>
                      <span className="navix-billing-dashboard__row-meta">
                        <PaymentStatusBadge status={payment.status} size="sm" />
                        <span className="tabular-nums">
                          <BillingAmount value={payment.amount} currency={payment.currency} />
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="col-lg-5">
          <Card
            title={
              <>
                <i className="bi bi-clock-history me-1" aria-hidden="true" /> Journal de facturation
              </>
            }
            actions={
              <Button variant="ghost" size="sm" icon="bi-arrow-right" onClick={() => navigate(ROUTES.BILLING_HISTORY)}>
                Tout voir
              </Button>
            }
          >
            {recentHistory.length === 0 ? (
              <p className="text-secondary mb-0">Aucune activité récente.</p>
            ) : (
              <BillingHistory history={recentHistory} />
            )}
          </Card>

          <div className="mt-3">
            <CreditsPanel credits={credits} discounts={discounts} companyById={companyById} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default BillingDashboardPage;
