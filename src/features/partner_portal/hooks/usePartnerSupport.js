/**
 * Navix Partner Portal — Hook Support & Assistance (PROMPT 077)
 * ────────────────────────────────────────────────────────────────
 * Gestion de l'état des tickets de support partenaire.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import * as supportService from '../services/partnerSupportService';
import { ticketFiltersSchema } from '../schemas/partnerSupport.schema';

/**
 * Hook principal pour la liste des tickets + KPI + filtres.
 */
export const usePartnerSupport = ({ pageSize = 10 } = {}) => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    waitingForPartner: 0,
    waitingForSupport: 0,
    resolved: 0,
    closed: 0,
    awaitingResponse: 0,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFiltersState] = useState(() => {
    const defaults = ticketFiltersSchema.parse({});
    return { ...defaults, pageSize };
  });

  const mountedRef = useRef(true);

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [ticketResult, statsResult] = await Promise.all([
        supportService.getTickets({
          search: filters.search,
          status: filters.status,
          priority: filters.priority,
          category: filters.category,
          sortBy: filters.sortBy,
          sortDirection: filters.sortDirection,
          page: filters.page,
          pageSize: filters.pageSize,
        }),
        supportService.getTicketStats(),
      ]);

      if (!mountedRef.current) return;

      setTickets(ticketResult.items);
      setTotal(ticketResult.total);
      setTotalPages(ticketResult.totalPages);
      setStats(statsResult);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err?.message || 'Impossible de charger vos demandes de support.');
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    mountedRef.current = true;
    fetchTickets();
    return () => { mountedRef.current = false; };
  }, [fetchTickets]);

  const setFilters = useCallback((updater) => {
    setFiltersState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const safe = { ...prev, ...next, page: next.page ?? 1 };
      return safe;
    });
  }, []);

  const refetch = useCallback(() => {
    fetchTickets();
  }, [fetchTickets]);

  return {
    tickets,
    stats,
    total,
    totalPages,
    isLoading,
    error,
    filters,
    setFilters,
    refetch,
  };
};

/**
 * Hook pour les détails d'un ticket + conversation + reply.
 */
export const usePartnerTicket = (ticketId) => {
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replying, setReplying] = useState(false);

  const mountedRef = useRef(true);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await supportService.getTicketById(ticketId);

      if (!mountedRef.current) return;

      if (!result) {
        setError('Ticket introuvable ou accès non autorisé.');
      } else {
        setTicket(result);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err?.message || 'Impossible de charger les détails du ticket.');
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    mountedRef.current = true;
    fetchTicket();
    return () => { mountedRef.current = false; };
  }, [fetchTicket]);

  const reply = useCallback(
    async (content) => {
      if (!ticketId || !content?.trim()) return false;

      try {
        setReplying(true);
        const updated = await supportService.replyToTicket(ticketId, { content });

        if (!mountedRef.current) return false;

        if (updated) {
          setTicket(updated);
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        if (mountedRef.current) setReplying(false);
      }
    },
    [ticketId],
  );

  const closeTicket = useCallback(async () => {
    if (!ticketId) return false;

    try {
      const updated = await supportService.updateTicketStatus(ticketId, 'closed');
      if (!mountedRef.current) return false;

      if (updated) {
        setTicket(updated);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [ticketId]);

  const refetch = useCallback(() => {
    fetchTicket();
  }, [fetchTicket]);

  return {
    ticket,
    isLoading,
    error,
    replying,
    reply,
    closeTicket,
    refetch,
  };
};
