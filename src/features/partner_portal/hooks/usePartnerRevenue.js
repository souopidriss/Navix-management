/**
 * Navix Partner Portal — Hook usePartnerRevenue (PROMPT 070)
 * --------------------------------------------------------------------------
 * Charge les revenus, statistiques et évolution du Partenaire.
 * Expose les données et les actions de consultation (read-only).
 */
import { useState, useEffect, useCallback } from 'react';
import { partnerRevenueService } from '../services/partnerRevenueService';

export const usePartnerRevenue = () => {
  const [revenues, setRevenues] = useState([]);
  const [stats, setStats] = useState(null);
  const [evolution, setEvolution] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (query = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsResult, evolutionResult, revenuesResult] = await Promise.all([
        partnerRevenueService.getRevenueStats(query),
        partnerRevenueService.getRevenueEvolution(),
        partnerRevenueService.getRevenues(query),
      ]);
      setStats(statsResult);
      setEvolution(evolutionResult);
      setRevenues(revenuesResult || []);
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement des revenus.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async (query = {}) => {
    const [statsResult, revenuesResult] = await Promise.all([
      partnerRevenueService.getRevenueStats(query),
      partnerRevenueService.getRevenues(query),
    ]);
    setStats(statsResult);
    setRevenues(revenuesResult || []);
  }, []);

  const getRevenueById = useCallback(async (id) => {
    const result = await partnerRevenueService.getRevenueById(id);
    return result;
  }, []);

  const getRevenueByMissionId = useCallback(async (missionId) => {
    const result = await partnerRevenueService.getRevenueByMissionId(missionId);
    return result;
  }, []);

  return {
    revenues,
    stats,
    evolution,
    isLoading,
    error,
    refetch: fetchData,
    refresh,
    getRevenueById,
    getRevenueByMissionId,
  };
};

export default usePartnerRevenue;
