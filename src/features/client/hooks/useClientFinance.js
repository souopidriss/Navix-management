/**
 * Navix Client — Hook useClientFinance (PROMPT 059)
 * --------------------------------------------------------------------------
 * Charge le portefeuille (fonds FCFA) et l'historique des transactions du
 * Client (isolés multi-tenant) via `clientFinanceService`, puis expose les
 * opérations financières : dépôt, retrait, transfert, transaction sortante,
 * annulation (remboursement) et la synthèse statistique.
 */
import { useState, useEffect, useCallback } from 'react';
import { useClientStore } from '../store/client.store';
import {
  clientWalletService,
  clientTransactionService,
} from '../services/clientFinanceService';

export const useClientFinance = () => {
  const clientType = useClientStore((state) => state.clientType);

  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFinance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [walletResult, transactionResult, statisticsResult] = await Promise.all([
        clientWalletService.getWallet(clientType),
        clientTransactionService.getAll(clientType),
        clientWalletService.statistics(clientType),
      ]);
      setWallet(walletResult);
      setTransactions(transactionResult);
      setStatistics(statisticsResult);
    } catch (err) {
      setError(err?.message || 'Impossible de charger vos données financières.');
    } finally {
      setIsLoading(false);
    }
  }, [clientType]);

  useEffect(() => {
    fetchFinance();
  }, [fetchFinance]);

  const createDeposit = useCallback((payload) => clientTransactionService.createDeposit(payload, clientType), [clientType]);
  const createWithdrawal = useCallback((payload) => clientTransactionService.createWithdrawal(payload, clientType), [clientType]);
  const createTransfer = useCallback((payload) => clientTransactionService.createTransfer(payload, clientType), [clientType]);
  const createPayment = useCallback((payload) => clientTransactionService.createPayment(payload, clientType), [clientType]);
  const reverseTransaction = useCallback((id) => clientTransactionService.reverse(id, clientType), [clientType]);
  const getTransactionById = useCallback((id) => clientTransactionService.getById(id, clientType), [clientType]);
  const previewReference = useCallback(
    () => clientTransactionService.previewReference(clientType),
    [clientType],
  );

  return {
    wallet,
    transactions,
    statistics,
    isLoading,
    error,
    refetch: fetchFinance,
    createDeposit,
    createWithdrawal,
    createTransfer,
    createPayment,
    reverseTransaction,
    getTransactionById,
    previewReference,
  };
};

export default useClientFinance;
