/**
 * Navix Partner Portal — Hook usePartnerFinance
 * --------------------------------------------------------------------------
 * Charge le portefeuille (Fonds FCFA), les statistiques et les transactions
 * du Partenaire. Expose les actions transactionnelles (dépôt, retrait,
 * transfert, transaction, annulation) toutes bornées au companyId partenaire.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  partnerWalletService,
  partnerTransactionService,
} from '../services/partnerFinanceService';

export const usePartnerFinance = () => {
  const [wallet, setWallet] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [walletResult, statsResult, transactionsResult] = await Promise.all([
        partnerWalletService.getWallet(),
        partnerWalletService.statistics(),
        partnerTransactionService.getAll(),
      ]);
      setWallet(walletResult);
      setStatistics(statsResult);
      setTransactions(transactionsResult || []);
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement de la finance partenaire.');
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
      partnerWalletService.statistics(),
      partnerTransactionService.getAll(),
    ]);
    setStatistics(statsResult);
    setTransactions(transactionsResult || []);
    setWallet((current) => ({ ...(current || {}), balance: statsResult?.balance ?? current?.balance }));
  }, []);

  const previewReference = useCallback(async () => {
    const result = await partnerTransactionService.previewReference();
    return result ?? '';
  }, []);

  const createDeposit = useCallback(async (payload) => {
    const result = await partnerTransactionService.createDeposit(payload);
    if (result) await refresh();
    return result;
  }, [refresh]);

  const createWithdrawal = useCallback(async (payload) => {
    const result = await partnerTransactionService.createWithdrawal(payload);
    if (result) await refresh();
    return result;
  }, [refresh]);

  const createTransfer = useCallback(async (payload) => {
    const result = await partnerTransactionService.createTransfer(payload);
    if (result) await refresh();
    return result;
  }, [refresh]);

  const createPayment = useCallback(async (payload) => {
    const result = await partnerTransactionService.createPayment(payload);
    if (result) await refresh();
    return result;
  }, [refresh]);

  const reverse = useCallback(async (id) => {
    const result = await partnerTransactionService.reverse(id);
    if (result) await refresh();
    return result;
  }, [refresh]);

  const getTransactionById = useCallback(async (id) => {
    const result = await partnerTransactionService.getById(id);
    return result;
  }, []);

  return {
    wallet,
    statistics,
    transactions,
    isLoading,
    error,
    refetch: fetchData,
    previewReference,
    createDeposit,
    createWithdrawal,
    createTransfer,
    createPayment,
    reverse,
    getTransactionById,
  };
};

export default usePartnerFinance;
