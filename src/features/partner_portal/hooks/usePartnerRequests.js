/**
 * Navix Partner Portal — Hook usePartnerRequests
 * --------------------------------------------------------------------------
 * Charge les demandes, statistiques du Partenaire.
 * Expose les données et les actions CRUD.
 */
import { useState, useEffect, useCallback } from 'react';
import { partnerRequestService } from '../services/partnerRequestService';

export const usePartnerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (query = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsResult, requestsResult] = await Promise.all([
        partnerRequestService.getRequestStats(query),
        partnerRequestService.getRequests(query),
      ]);
      setStats(statsResult);
      setRequests(requestsResult || []);
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement des demandes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async (query = {}) => {
    const [statsResult, requestsResult] = await Promise.all([
      partnerRequestService.getRequestStats(query),
      partnerRequestService.getRequests(query),
    ]);
    setStats(statsResult);
    setRequests(requestsResult || []);
  }, []);

  const getRequestById = useCallback(async (id) => {
    const result = await partnerRequestService.getRequestById(id);
    return result;
  }, []);

  const acceptRequest = useCallback(async (id) => {
    const result = await partnerRequestService.acceptRequest(id);
    await fetchData();
    return result;
  }, [fetchData]);

  const rejectRequest = useCallback(async (id) => {
    const result = await partnerRequestService.rejectRequest(id);
    await fetchData();
    return result;
  }, [fetchData]);

  const startReview = useCallback(async (id) => {
    const result = await partnerRequestService.startReview(id);
    await fetchData();
    return result;
  }, [fetchData]);

  const cancelRequest = useCallback(async (id) => {
    const result = await partnerRequestService.cancelRequest(id);
    await fetchData();
    return result;
  }, [fetchData]);

  const convertToMission = useCallback(async (id) => {
    const result = await partnerRequestService.convertToMission(id);
    await fetchData();
    return result;
  }, [fetchData]);

  return {
    requests,
    stats,
    isLoading,
    error,
    refetch: fetchData,
    refresh,
    getRequestById,
    acceptRequest,
    rejectRequest,
    startReview,
    cancelRequest,
    convertToMission,
  };
};

export default usePartnerRequests;
