/**
 * Navix Partner Portal — usePartnerContracts Hook (PROMPT 073)
 * ───────────────────────────────────────────────────────────────
 * Hook pour les opérations sur les contrats.
 * Suit le pattern useState/useEffect/useCallback du projet.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import * as contractService from '../services/partnerContractService';

/**
 * Liste des contrats avec filtres/pagination.
 */
export const usePartnerContracts = (filters = {}) => {
  const [data, setData] = useState({ contracts: [], total: 0, totalPages: 0, page: 1, pageSize: 10 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await contractService.listContracts(filtersRef.current);
      setData(result);
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement des contrats.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};

/**
 * Statistiques des contrats.
 */
export const usePartnerContractStats = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await contractService.getContractStats();
      setData(result);
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement des statistiques.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};

/**
 * Détail d'un contrat.
 */
export const usePartnerContractDetail = (contractId) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!contractId) { setIsLoading(false); return; }
    setIsLoading(true);
    setError(null);
    try {
      const result = await contractService.getContractDetail(contractId);
      setData(result);
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement du contrat.');
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};

/**
 * Mutation : créer un contrat.
 */
export const useCreateContract = () => {
  const [loading, setLoading] = useState(false);

  const mutateAsync = useCallback(async (values) => {
    setLoading(true);
    try {
      return await contractService.createContract(values);
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutateAsync, loading };
};

/**
 * Mutation : modifier un contrat.
 */
export const useUpdateContract = () => {
  const [loading, setLoading] = useState(false);

  const mutateAsync = useCallback(async ({ contractId, data: values }) => {
    setLoading(true);
    try {
      return await contractService.updateContract(contractId, values);
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutateAsync, loading };
};

/**
 * Mutation : renouveler un contrat.
 */
export const useRenewContract = () => {
  const [loading, setLoading] = useState(false);

  const mutateAsync = useCallback(async ({ contractId, options } = {}) => {
    setLoading(true);
    try {
      return await contractService.renewContract(contractId, options);
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutateAsync, loading };
};

/**
 * Mutation : résilier un contrat.
 */
export const useTerminateContract = () => {
  const [loading, setLoading] = useState(false);

  const mutateAsync = useCallback(async ({ contractId, reason }) => {
    setLoading(true);
    try {
      return await contractService.terminateContract(contractId, { reason });
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutateAsync, loading };
};

/**
 * Mutation : suspendre/réactiver un contrat.
 */
export const useToggleSuspendContract = () => {
  const [loading, setLoading] = useState(false);

  const mutateAsync = useCallback(async (contractId) => {
    setLoading(true);
    try {
      return await contractService.toggleSuspendContract(contractId);
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutateAsync, loading };
};
