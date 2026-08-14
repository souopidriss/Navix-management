/**
 * Navix Billing — InvoicesPage
 * --------------------------------------------------------------------------
 * Liste des factures : indicateurs, recherche instantanée, filtres, tri,
 * pagination, états chargement / erreur / vide et actions (détail, émettre
 * un brouillon, annuler, simuler un paiement). Responsive : tableau sur
 * desktop, cartes sur tablette / mobile.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert } from '@/components/ui';
import { PageContainer, PageHeader, Pagination, LoadingState, ConfirmDialog } from '@/components/core';
import { ROUTES, invoiceDetailPath } from '@/routes/route.constants';
import { useMediaQuery } from '@/hooks';
import { useCompaniesStore } from '@/features/companies';
import { useBillingStore } from '../store';
import { useInvoiceListData, useBillingStats } from '../hooks';
import { BillingOverview, InvoiceSearchBar, InvoiceFilters, InvoiceTable, InvoiceCard, InvoiceEmptyState, PaymentSimulationModal } from '../components';
import { formatBillingMoney, BILLING_ICON } from '../constants';

const InvoicesPage = () => {
  const navigate = useNavigate();

  const invoices = useBillingStore((state) => state.invoices);
  const search = useBillingStore((state) => state.search);
  const filters = useBillingStore((state) => state.filters);
  const sort = useBillingStore((state) => state.sort);
  const pageSize = useBillingStore((state) => state.pagination.pageSize);
  const isLoading = useBillingStore((state) => state.isLoading);
  const isSaving = useBillingStore((state) => state.isSaving);
  const error = useBillingStore((state) => state.error);
  const fetchInvoices = useBillingStore((state) => state.fetchInvoices);
  const issueInvoice = useBillingStore((state) => state.issueInvoice);
  const cancelInvoice = useBillingStore((state) => state.cancelInvoice);
  const simulatePayment = useBillingStore((state) => state.simulatePayment);
  const setSearch = useBillingStore((state) => state.setSearch);
  const setFilter = useBillingStore((state) => state.setFilter);
  const resetFilters = useBillingStore((state) => state.resetFilters);
  const setSort = useBillingStore((state) => state.setSort);
  const setPage = useBillingStore((state) => state.setPage);
  const setPageSize = useBillingStore((state) => state.setPageSize);
  const clearError = useBillingStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const [issueTarget, setIssueTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [payTarget, setPayTarget] = useState(null);
  const [modalError, setModalError] = useState('');

  const isCompact = useMediaQuery('(max-width: 991.98px)');

  const companyById = useMemo(
    () => Object.fromEntries(companies.map((company) => [company.id, company])),
    [companies],
  );

  const stats = useBillingStats(invoices);
  const { items, totalItems, totalPages, page } = useInvoiceListData(companyById);

  useEffect(() => {
    fetchInvoices();
    fetchCompanies();
  }, [fetchInvoices, fetchCompanies]);

  const hasActiveFilters = Boolean(search.trim() || filters.status || filters.companyId || filters.currency);

  const closeModals = () => {
    setIssueTarget(null);
    setCancelTarget(null);
    setPayTarget(null);
    setModalError('');
  };

  const runAction = async (action, successMessage) => {
    setModalError('');
    const result = await action();
    if (result.success) {
      toast.success(successMessage);
      closeModals();
    } else {
      setModalError(result.error || 'L’opération a échoué.');
    }
  };

  const handleIssue = () =>
    runAction(() => issueInvoice(issueTarget.id), `La facture ${issueTarget.number} a été émise.`);

  const handleCancel = () =>
    runAction(() => cancelInvoice(cancelTarget.id), `La facture ${cancelTarget.number} a été annulée.`);

  const handlePay = (payload) =>
    runAction(
      () => simulatePayment(payload),
      `Paiement simulé enregistré pour la facture ${payTarget.number}.`,
    );

  return (
    <PageContainer>
      <Helmet>
        <title>Factures — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Factures"
        subtitle="Facturation SaaS simulée — aucun paiement réel."
        icon={BILLING_ICON}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Facturation', to: ROUTES.BILLING },
          { label: 'Factures' },
        ]}
      />

      <BillingOverview stats={stats} currency={stats.currency || 'XAF'} />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <InvoiceSearchBar value={search} onChange={setSearch} resultCount={totalItems} />

      <InvoiceFilters
        filters={filters}
        companies={companies}
        sort={sort}
        onChange={setFilter}
        onSortChange={(by, direction) => setSort(by, direction)}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isLoading && invoices.length === 0 ? (
        <LoadingState variant="table" rows={6} cols={8} label="Chargement des factures…" />
      ) : items.length === 0 ? (
        <InvoiceEmptyState hasQuery={hasActiveFilters} onReset={hasActiveFilters ? resetFilters : undefined} />
      ) : (
        <>
          {isCompact ? (
            <div className="row g-3">
              {items.map((invoice) => (
                <div key={invoice.id} className="col-12 col-sm-6 col-xl-4">
                  <InvoiceCard
                    invoice={invoice}
                    company={companyById[invoice.companyId]}
                    onView={(id) => navigate(invoiceDetailPath(id))}
                  />
                </div>
              ))}
            </div>
          ) : (
            <InvoiceTable
              invoices={items}
              companyById={companyById}
              sort={sort}
              onSortChange={(by, direction) => setSort(by, direction)}
              onView={(id) => navigate(invoiceDetailPath(id))}
              onIssue={setIssueTarget}
              onCancel={setCancelTarget}
              onPay={setPayTarget}
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

      <ConfirmDialog
        open={Boolean(issueTarget)}
        onClose={closeModals}
        title="Émettre la facture"
        message={
          issueTarget
            ? `La facture ${issueTarget.number} (${formatBillingMoney(issueTarget.total, issueTarget.currency)}) sera émise avec une échéance de 15 jours.`
            : ''
        }
        confirmLabel="Émettre"
        confirmVariant="primary"
        icon="bi-send"
        loading={isSaving}
        error={modalError}
        onConfirm={handleIssue}
      />

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={closeModals}
        title="Annuler la facture"
        message={
          cancelTarget
            ? `La facture ${cancelTarget.number} sera annulée et son solde dû passera à zéro. Cette action est simulée.`
            : ''
        }
        confirmLabel="Annuler"
        confirmVariant="danger"
        icon="bi-x-circle"
        loading={isSaving}
        error={modalError}
        onConfirm={handleCancel}
      />

      <PaymentSimulationModal
        open={Boolean(payTarget)}
        onClose={closeModals}
        invoice={payTarget}
        loading={isSaving}
        error={modalError}
        onConfirm={handlePay}
      />
    </PageContainer>
  );
};

export default InvoicesPage;
