/**
 * Navix Client — Hook useClientAssignments
 * --------------------------------------------------------------------------
 * Charge les affectations du Client (isolées multi-tenant) via
 * `clientAssignmentService` et expose les opérations CRUD + clôture.
 */
import { useState, useEffect, useCallback } from 'react';
import { useClientStore } from '../store/client.store';
import { clientAssignmentService } from '../services/clientAssignmentService';

export const useClientAssignments = () => {
  const clientType = useClientStore((state) => state.clientType);

  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await clientAssignmentService.getAll(clientType);
      setAssignments(result);
    } catch (err) {
      setError(err?.message || 'Impossible de charger vos affectations.');
    } finally {
      setIsLoading(false);
    }
  }, [clientType]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const createAssignment = useCallback((payload) => clientAssignmentService.create(payload), []);
  const updateAssignment = useCallback((id, payload) => clientAssignmentService.update(id, payload), []);
  const finishAssignment = useCallback((id, payload) => clientAssignmentService.finish(id, payload), []);
  const deleteAssignment = useCallback((id) => clientAssignmentService.remove(id), []);

  return {
    assignments,
    isLoading,
    error,
    refetch: fetchAssignments,
    createAssignment,
    updateAssignment,
    finishAssignment,
    deleteAssignment,
  };
};

export default useClientAssignments;
