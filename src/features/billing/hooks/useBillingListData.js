/**
 * Navix Billing — Logique de liste (filtre, tri, pagination) + hooks
 * --------------------------------------------------------------------------
 * Fonctions pures (`filterInvoices`, `sortInvoices`, `filterPayments`,
 * `sortPayments`) testables, puis hooks `useInvoiceListData` et
 * `usePaymentListData` qui combinent l'état du store et la carte des sociétés
 * (companyById) pour produire la liste visible : items, totalItems,
 * totalPages, page et startIndex. `useBillingStats` dérive les indicateurs
 * financiers de la liste des factures.
 */
import { useMemo } from 'react';
import { getInvoiceStatus, getPaymentStatus, getPaymentMethod } from '../constants';
import { useBillingStore } from '../store';

const toQuery = (value) => String(value ?? '').trim().toLowerCase();

const companyName = (row, companyById) => companyById[row.companyId]?.name ?? '';

export const filterInvoices = (
  invoices = [],
  { search = '', filters = {}, companyById = {} } = {},
) => {
  const query = toQuery(search);

  return invoices.filter((invoice) => {
    const matchesSearch =
      !query ||
      [
        companyName(invoice, companyById),
        invoice.number,
        getInvoiceStatus(invoice.status).label,
        invoice.total,
        invoice.currency,
      ].some((field) => toQuery(field).includes(query));
    const matchesStatus = !filters.status || invoice.status === filters.status;
    const matchesCompany = !filters.companyId || invoice.companyId === filters.companyId;
    const matchesCurrency = !filters.currency || invoice.currency === filters.currency;

    return matchesSearch && matchesStatus && matchesCompany && matchesCurrency;
  });
};

export const sortInvoices = (
  invoices = [],
  { by = 'issuedDate', direction = 'desc', companyById = {} } = {},
) => {
  const factor = direction === 'desc' ? -1 : 1;
  const fallback = '1970-01-01T00:00:00.000Z';

  return [...invoices].sort((a, b) => {
    let result = 0;

    switch (by) {
      case 'companyName':
        result = toQuery(companyName(a, companyById)).localeCompare(
          toQuery(companyName(b, companyById)),
          'fr',
        );
        break;
      case 'number':
        result = a.number.localeCompare(b.number);
        break;
      case 'status':
        result =
          getInvoiceStatus(a.status).label.localeCompare(
            getInvoiceStatus(b.status).label,
            'fr',
          ) ||
          toQuery(companyName(a, companyById)).localeCompare(
            toQuery(companyName(b, companyById)),
            'fr',
          );
        break;
      case 'total':
        result = Number(a.total || 0) - Number(b.total || 0);
        break;
      case 'issuedDate':
        result = (a.issuedDate || fallback).localeCompare(b.issuedDate || fallback);
        break;
      case 'dueDate':
        result = (a.dueDate || fallback).localeCompare(b.dueDate || fallback);
        break;
      default:
        result = (a.issuedDate || fallback).localeCompare(b.issuedDate || fallback);
    }

    return result * factor;
  });
};

export const filterPayments = (
  payments = [],
  { search = '', filters = {}, companyById = {} } = {},
) => {
  const query = toQuery(search);

  return payments.filter((payment) => {
    const matchesSearch =
      !query ||
      [
        companyName(payment, companyById),
        payment.number,
        payment.transactionReference,
        getPaymentMethod(payment.method).label,
        getPaymentStatus(payment.status).label,
        payment.amount,
      ].some((field) => toQuery(field).includes(query));
    const matchesStatus = !filters.status || payment.status === filters.status;
    const matchesCompany = !filters.companyId || payment.companyId === filters.companyId;
    const matchesMethod = !filters.method || payment.method === filters.method;
    const matchesCurrency = !filters.currency || payment.currency === filters.currency;

    return matchesSearch && matchesStatus && matchesCompany && matchesMethod && matchesCurrency;
  });
};

export const sortPayments = (
  payments = [],
  { by = 'paymentDate', direction = 'desc', companyById = {} } = {},
) => {
  const factor = direction === 'desc' ? -1 : 1;
  const fallback = '1970-01-01T00:00:00.000Z';

  return [...payments].sort((a, b) => {
    let result = 0;

    switch (by) {
      case 'companyName':
        result = toQuery(companyName(a, companyById)).localeCompare(
          toQuery(companyName(b, companyById)),
          'fr',
        );
        break;
      case 'method':
        result = getPaymentMethod(a.method).label.localeCompare(
          getPaymentMethod(b.method).label,
          'fr',
        );
        break;
      case 'status':
        result =
          getPaymentStatus(a.status).label.localeCompare(
            getPaymentStatus(b.status).label,
            'fr',
          ) ||
          toQuery(companyName(a, companyById)).localeCompare(
            toQuery(companyName(b, companyById)),
            'fr',
          );
        break;
      case 'amount':
        result = Number(a.amount || 0) - Number(b.amount || 0);
        break;
      case 'paymentDate':
      default:
        result = (a.paymentDate || fallback).localeCompare(b.paymentDate || fallback);
    }

    return result * factor;
  });
};

const paginate = (items, { page, pageSize }) => {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    totalItems,
    totalPages,
    page: currentPage,
    startIndex,
  };
};

/**
 * Hook de liste visible des factures.
 * @param {object} companyById — carte id → entreprise
 */
export const useInvoiceListData = (companyById = {}) => {
  const invoices = useBillingStore((state) => state.invoices);
  const search = useBillingStore((state) => state.search);
  const filters = useBillingStore((state) => state.filters);
  const sort = useBillingStore((state) => state.sort);
  const page = useBillingStore((state) => state.pagination.page);
  const pageSize = useBillingStore((state) => state.pagination.pageSize);

  return useMemo(() => {
    const filtered = sortInvoices(
      filterInvoices(invoices, { search, filters, companyById }),
      { ...sort, companyById },
    );
    return paginate(filtered, { page, pageSize });
  }, [invoices, search, filters, sort, page, pageSize, companyById]);
};

/**
 * Hook de liste visible des paiements.
 * @param {object} companyById — carte id → entreprise
 */
export const usePaymentListData = (companyById = {}) => {
  const payments = useBillingStore((state) => state.payments);
  const search = useBillingStore((state) => state.search);
  const filters = useBillingStore((state) => state.filters);
  const sort = useBillingStore((state) => state.sort);
  const page = useBillingStore((state) => state.pagination.page);
  const pageSize = useBillingStore((state) => state.pagination.pageSize);

  return useMemo(() => {
    const filtered = sortPayments(
      filterPayments(payments, { search, filters, companyById }),
      { ...sort, companyById },
    );
    return paginate(filtered, { page, pageSize });
  }, [payments, search, filters, sort, page, pageSize, companyById]);
};

/**
 * Indicateurs financiers dérivés de la liste des factures (pour les pages
 * qui ne chargent pas les statistiques du service).
 */
export const useBillingStats = (invoices = []) =>
  useMemo(() => {
    const billedStatuses = new Set(['issued', 'paid', 'partially_paid', 'overdue']);
    const billed = invoices.filter((invoice) => billedStatuses.has(invoice.status));
    const outstandingList = invoices.filter((invoice) =>
      ['issued', 'partially_paid', 'overdue'].includes(invoice.status),
    );
    const overdueList = invoices.filter((invoice) => invoice.status === 'overdue');

    const totalBilled = billed.reduce((total, invoice) => total + Number(invoice.total || 0), 0);
    const collected = billed.reduce(
      (total, invoice) => total + Number(invoice.amountPaid || 0),
      0,
    );
    const outstanding = outstandingList.reduce(
      (total, invoice) => total + Number(invoice.amountDue || 0),
      0,
    );
    const overdue = overdueList.reduce(
      (total, invoice) => total + Number(invoice.amountDue || 0),
      0,
    );

    return {
      totalInvoices: invoices.length,
      paidInvoices: invoices.filter((invoice) => invoice.status === 'paid').length,
      unpaidInvoices: outstandingList.length,
      overdueInvoices: overdueList.length,
      draftInvoices: invoices.filter((invoice) => invoice.status === 'draft').length,
      cancelledInvoices: invoices.filter((invoice) => invoice.status === 'cancelled').length,
      refundedInvoices: invoices.filter((invoice) => invoice.status === 'refunded').length,
      totalBilled,
      collected,
      outstanding,
      overdue,
      collectionRate: totalBilled > 0 ? collected / totalBilled : 0,
    };
  }, [invoices]);
