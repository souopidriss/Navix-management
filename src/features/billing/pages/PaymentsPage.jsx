/**
 * Navix Billing — PaymentsPage
 * --------------------------------------------------------------------------
 * Liste des paiements simulés : recherche instantanée, filtres, tri,
 * pagination, états chargement / erreur / vide et actions (détail,
 * remboursement). Responsive : tableau sur desktop, cartes sur mobile.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert } from '@/components/ui';
import { PageContainer, PageHeader, Pagination, LoadingState, ConfirmDialog } from '@/components/core';
import { ROUTES, paymentDetailPath } from '@/routes/route.constants';
import { useMediaQuery } from '@/hooks';
import { useCompaniesStore } from '@/features/companies';
import { useBillingStore } from '../store';
import { usePaymentListData } from '../hooks';
import { PaymentSearchBar, PaymentFilters, PaymentTable, PaymentCard, PaymentEmptyState } from '../components';
import { BILLING_ICON } from '../constants';

const PaymentsPage = () => {
  const navigate = useNavigate();

  const payments = useBillingStore((state) => state.payments);
  const invoices = useBillingStore((state) => state.invoices);
  const search = useBillingStore((state) => state.search);
  const filters = useBillingStore((state) => state.filters);
  const sort = useBillingStore((state) => state.sort);
  const pageSize = useBillingStore((state) => state.pagination.pageSize);
  const isLoading = useBillingStore((state) => state.isLoading);
  const isSaving = useBillingStore((state) => state.isSaving);
  const error = useBillingStore((state) => state.error);
  const fetchPayments = useBillingStore((state) => state.fetchPayments);
  const fetchInvoices = useBillingStore((state) => state.fetchInvoices);
  const refundPayment = useBillingStore((state) => state.refundPayment);
  const setSearch = useBillingStore((state) => state.setSearch);
  const setFilter = useBillingStore((state) => state.setFilter);
  const resetFilters = useBillingStore((state) => state.resetFilters);
  const setSort = useBillingStore((state) => state.setSort);
  const setPage = useBillingStore((state) => state.setPage);
  const setPageSize = useBillingStore((state) => state.setPageSize);
  const clearError = useBillingStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const [refundTarget, setRefundTarget] = useState(null);
  const [modalError, setModalError] = useState('');

  const isCompact = useMediaQuery('(max-width: 991.98px)');

  const companyById = useMemo(
    () => Object.fromEntries(companies.map((company) => [company.id, company])),
    [companies],
  );
  const invoiceById = useMemo(
    () => Object.fromEntries(invoices.map((invoice) => [invoice.id, invoice])),
    [invoices],
  );

  const { items, totalItems, totalPages, page } = usePaymentListData(companyById);

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
    fetchCompanies();
  }, [fetchPayments, fetchInvoices, fetchCompanies]);

  const hasActiveFilters = Boolean(
    search.trim() || filters.status || filters.companyId || filters.method || filters.currency,
  );

  const closeModals = () => {
    setRefundTarget(null);
    setModalError('');
  };

  const handleRefund = async () => {
    setModalError('');
    const result = await refundPayment(refundTarget.id);
    if (result.success) {
      toast.success(`Le paiement ${refundTarget.number} a été remboursé (simulation).`);
      closeModals();
    } else {
      setModalError(result.error || 'L’opération a échoué.');
    }
  };

  return (
    <PageContainer>
      <Helmet>
        <title>Paiements — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Paiements"
        subtitle="Transactions simulées — aucun encaissement réel."
        icon="bi-cash-coin"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Facturation', to: ROUTES.BILLING },
          { label: 'Paiements' },
        ]}
      />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <PaymentSearchBar value={search} onChange={setSearch} resultCount={totalItems} />

      <PaymentFilters
        filters={filters}
        companies={companies}
        sort={sort}
        onChange={setFilter}
        onSortChange={(by, direction) => setSort(by, direction)}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isLoading && payments.length === 0 ? (
        <LoadingState variant="table" rows={6} cols={7} label="Chargement des paiements…" />
      ) : items.length === 0 ? (
        <PaymentEmptyState hasQuery={hasActiveFilters} onReset={hasActiveFilters ? resetFilters : undefined} />
      ) : (
        <>
          {isCompact ? (
            <div className="row g-3">
              {items.map((payment) => (
                <div key={payment.id} className="col-12 col-sm-6 col-xl-4">
                  <PaymentCard
                    payment={payment}
                    company={companyById[payment.companyId]}
                    invoice={invoiceById[payment.invoiceId]}
                    onView={(id) => navigate(paymentDetailPath(id))}
                  />
                </div>
              ))}
            </div>
          ) : (
            <PaymentTable
              payments={items}
              companyById={companyById}
              invoiceById={invoiceById}
              sort={sort}
              onSortChange={(by, direction) => setSort(by, direction)}
              onView={(id) => navigate(paymentDetailPath(id))}
              onRefund={setRefundTarget}
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
        open={Boolean(refundTarget)}
        onClose={closeModals}
        title="Rembourser le paiement"
        message={
          refundTarget
            ? `Le paiement ${refundTarget.number} sera marqué comme remboursé et la facture ${invoiceById[refundTarget.invoiceId]?.number ?? 'associée'} sera mise à jour. Simulation uniquement.`
            : ''
        }
        confirmLabel="Rembourser"
        confirmVariant="danger"
        icon="bi-arrow-counterclockwise"
        loading={isSaving}
        error={modalError}
        onConfirm={handleRefund}
      />
    </PageContainer>
  );
};

export default PaymentsPage;
