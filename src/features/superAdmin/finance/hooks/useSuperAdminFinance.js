/**
 * Navix Super Admin — Hook useSuperAdminFinance
 * --------------------------------------------------------------------------
 * Charge le fonds plateforme, les statistiques et les transactions
 * du Super Admin. Expose les actions transactionnelles (dépôt, retrait,
 * transfert, paiement, commission, frais, ajustement, annulation).
 *
 * Pattern : useState + useEffect + useCallback (pas de React Query).
 * Le hook suit exactement le pattern de usePartnerFinance.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  platformFundService,
  superAdminTransactionService,
} from '../services/superAdminFinanceService';

export const useSuperAdminFinance = () => {
  const [fund, setFund] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fundResult, statsResult, transactionsResult] = await Promise.all([
        platformFundService.getFund(),
        platformFundService.statistics(),
        superAdminTransactionService.getAll(),
      ]);
      setFund(fundResult);
      setStatistics(statsResult);
      setTransactions(transactionsResult || []);
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement de la finance plateforme.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /** Recharge les données après une opération. */
  const refresh = useCallback(async () => {
    const [statsResult, transactionsResult] = await Promise.all([
      platformFundService.statistics(),
      superAdminTransactionService.getAll(),
    ]);
    setStatistics(statsResult);
    setTransactions(transactionsResult || []);
    setFund((current) => ({ ...(current || {}), balance: statsResult?.balance ?? current?.balance }));
  }, []);

  const previewReference = useCallback(async () => {
    const result = await superAdminTransactionService.previewReference();
    return result ?? '';
  }, []);

  const createDeposit = useCallback(async (payload) => {
    const result = await superAdminTransactionService.createDeposit(payload);
    if (result) await refresh();
    return result;
  }, [refresh]);

  const createWithdrawal = useCallback(async (payload) => {
    const result = await superAdminTransactionService.createWithdrawal(payload);
    if (result) await refresh();
    return result;
  }, [refresh]);

  const createTransferIn = useCallback(async (payload) => {
    const result = await superAdminTransactionService.createTransferIn(payload);
    if (result) await refresh();
    return result;
  }, [refresh]);

  const createTransferOut = useCallback(async (payload) => {
    const result = await superAdminTransactionService.createTransferOut(payload);
    if (result) await refresh();
    return result;
  }, [refresh]);

  const createPayment = useCallback(async (payload) => {
    const result = await superAdminTransactionService.createPayment(payload);
    if (result) await refresh();
    return result;
  }, [refresh]);

  const createCommission = useCallback(async (payload) => {
    const result = await superAdminTransactionService.createCommission(payload);
    if (result) await refresh();
    return result;
  }, [refresh]);

  const createFee = useCallback(async (payload) => {
    const result = await superAdminTransactionService.createFee(payload);
    if (result) await refresh();
    return result;
  }, [refresh]);

  const createAdjustment = useCallback(async (payload) => {
    const result = await superAdminTransactionService.createAdjustment(payload);
    if (result) await refresh();
    return result;
  }, [refresh]);

  const reverse = useCallback(async (id) => {
    const result = await superAdminTransactionService.reverse(id);
    if (result) await refresh();
    return result;
  }, [refresh]);

  const getTransactionById = useCallback(async (id) => {
    const result = await superAdminTransactionService.getById(id);
    return result;
  }, []);

  return {
    fund,
    statistics,
    transactions,
    isLoading,
    error,
    refetch: fetchData,
    previewReference,
    createDeposit,
    createWithdrawal,
    createTransferIn,
    createTransferOut,
    createPayment,
    createCommission,
    createFee,
    createAdjustment,
    reverse,
    getTransactionById,
  };
};

export default useSuperAdminFinance;
