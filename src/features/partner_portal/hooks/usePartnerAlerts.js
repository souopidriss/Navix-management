/**
 * Navix Partner Portal — usePartnerAlerts (PROMPT 075)
 * ──────────────────────────────────────────────────────
 * Hook central pour la gestion des alertes et échéances.
 * Fournit : alertes, stats, filtres, actions (acknowledge, resolve).
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  getAlerts,
  getAlertStats,
  updateAlertStatus,
  acknowledgeAllAlerts,
} from '../services/partnerAlertService';

const INITIAL_FILTERS = {
  search: '',
  severity: 'all',
  status: 'all',
  type: 'all',
  sortBy: 'createdAt',
  sortDirection: 'desc',
  page: 1,
  pageSize: 10,
};

export const usePartnerAlerts = (initialFilters = {}) => {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const filtersRef = useRef({ ...INITIAL_FILTERS, ...initialFilters });
  const [filters, setFiltersState] = useState(filtersRef.current);

  const setFilters = useCallback((updates) => {
    setFiltersState((prev) => {
      const next = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      filtersRef.current = next;
      return next;
    });
  }, []);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [alertsResult, statsResult] = await Promise.all([
        getAlerts(filtersRef.current),
        getAlertStats(),
      ]);
      setAlerts(alertsResult.data);
      setTotal(alertsResult.total);
      setTotalPages(alertsResult.totalPages);
      setStats(statsResult);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des alertes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Re-fetch when filters change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAlerts();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, fetchAlerts]);

  const acknowledgeAlert = useCallback(async (alertId) => {
    try {
      await updateAlertStatus(alertId, 'acknowledged');
      await fetchAlerts();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [fetchAlerts]);

  const resolveAlert = useCallback(async (alertId) => {
    try {
      await updateAlertStatus(alertId, 'resolved');
      await fetchAlerts();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [fetchAlerts]);

  const dismissAlert = useCallback(async (alertId) => {
    try {
      await updateAlertStatus(alertId, 'dismissed');
      await fetchAlerts();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [fetchAlerts]);

  const acknowledgeAll = useCallback(async () => {
    try {
      await acknowledgeAllAlerts();
      await fetchAlerts();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [fetchAlerts]);

  const refetch = useCallback(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const paginatedAlerts = useMemo(() => alerts, [alerts]);

  return {
    alerts: paginatedAlerts,
    stats,
    total,
    totalPages,
    isLoading,
    error,
    filters,
    setFilters,
    acknowledgeAlert,
    resolveAlert,
    dismissAlert,
    acknowledgeAll,
    refetch,
  };
};
