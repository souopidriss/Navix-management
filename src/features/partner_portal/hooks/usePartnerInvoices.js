/**
 * Navix Partner Portal — Hook usePartnerInvoices (PROMPT 071)
 * --------------------------------------------------------------------------
 * Charge les factures, statistiques et alertes du Partenaire.
 * Expose les données et les actions CRUD (read + create + cancel).
 */
import { useState, useEffect, useCallback } from 'react';
import { partnerInvoiceService } from '../services/partnerInvoiceService';

export const usePartnerInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const [dueSoonInvoices, setDueSoonInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (query = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsResult, invoicesResult, overdueResult, dueSoonResult] = await Promise.all([
        partnerInvoiceService.getInvoiceStats(query),
        partnerInvoiceService.getInvoices(query),
        partnerInvoiceService.getOverdueInvoices(),
        partnerInvoiceService.getDueSoonInvoices(),
      ]);
      setStats(statsResult);
      setInvoices(invoicesResult || []);
      setOverdueInvoices(overdueResult || []);
      setDueSoonInvoices(dueSoonResult || []);
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement des factures.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async (query = {}) => {
    const [statsResult, invoicesResult] = await Promise.all([
      partnerInvoiceService.getInvoiceStats(query),
      partnerInvoiceService.getInvoices(query),
    ]);
    setStats(statsResult);
    setInvoices(invoicesResult || []);
  }, []);

  const getInvoiceById = useCallback(async (id) => {
    const result = await partnerInvoiceService.getInvoiceById(id);
    return result;
  }, []);

  const createInvoice = useCallback(async (payload) => {
    const result = await partnerInvoiceService.createInvoice(payload);
    await fetchData();
    return result;
  }, [fetchData]);

  const cancelInvoice = useCallback(async (id) => {
    const result = await partnerInvoiceService.cancelInvoice(id);
    await fetchData();
    return result;
  }, [fetchData]);

  return {
    invoices,
    stats,
    overdueInvoices,
    dueSoonInvoices,
    isLoading,
    error,
    refetch: fetchData,
    refresh,
    getInvoiceById,
    createInvoice,
    cancelInvoice,
  };
};

export default usePartnerInvoices;
