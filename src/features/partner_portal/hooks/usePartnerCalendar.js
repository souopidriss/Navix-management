/**
 * Navix Partner Portal — usePartnerCalendar (PROMPT 076)
 * ──────────────────────────────────────────────────────
 * Hook central pour le calendrier opérationnel.
 * Gère : currentDate, view (month), filtres, événements, loading, error.
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getCalendarEvents, EVENT_TYPES } from '../services/partnerCalendarService';

const INITIAL_STATE = {
  currentDate: new Date(),
  type: 'all',
  search: '',
};

export const usePartnerCalendar = () => {
  const [currentDate, setCurrentDate] = useState(INITIAL_STATE.currentDate);
  const [type, setType] = useState(INITIAL_STATE.type);
  const [search, setSearch] = useState(INITIAL_STATE.search);
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const stateRef = useRef({ currentDate, type, search });

  // Update ref
  useEffect(() => {
    stateRef.current = { currentDate, type, search };
  }, [currentDate, type, search]);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { currentDate: date, type: t, search: s } = stateRef.current;
      const year = date.getFullYear();
      const month = date.getMonth();
      const from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const result = await getCalendarEvents({ from, to, type: t, search: s });
      setEvents(result.events);
      setSummary(result.summary);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement du calendrier');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Re-fetch on state change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentDate, type, search, fetchEvents]);

  const goToPrevMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const monthTitle = useMemo(() => {
    return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  const refetch = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    currentDate,
    type,
    setType,
    search,
    setSearch,
    events,
    summary,
    isLoading,
    error,
    monthTitle,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    refetch,
  };
};
