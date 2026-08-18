/**
 * Navix Client — Hook useClientDocuments
 * --------------------------------------------------------------------------
 * Charge les documents du Client (isolés multi-tenant) via
 * `clientDocumentService` et expose les opérations : création, téléversement
 * simulé, mise à jour, téléchargement et suppression.
 */
import { useState, useEffect, useCallback } from 'react';
import { useClientStore } from '../store/client.store';
import { clientDocumentService } from '../services/clientDocumentService';

export const useClientDocuments = () => {
  const clientType = useClientStore((state) => state.clientType);

  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await clientDocumentService.getAll(clientType);
      setDocuments(result);
    } catch (err) {
      setError(err?.message || 'Impossible de charger vos documents.');
    } finally {
      setIsLoading(false);
    }
  }, [clientType]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const createDocument = useCallback((payload) => clientDocumentService.create(payload), []);
  const uploadDocument = useCallback((payload) => clientDocumentService.upload(payload), []);
  const updateDocument = useCallback((id, payload) => clientDocumentService.update(id, payload), []);
  const downloadDocument = useCallback((id) => clientDocumentService.download(id), []);
  const deleteDocument = useCallback((id) => clientDocumentService.remove(id), []);

  return {
    documents,
    isLoading,
    error,
    refetch: fetchDocuments,
    createDocument,
    uploadDocument,
    updateDocument,
    downloadDocument,
    deleteDocument,
  };
};

export default useClientDocuments;
