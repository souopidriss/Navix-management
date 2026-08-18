/**
 * Navix Partner Portal — Hook usePartnerDocument (PROMPT 066)
 * --------------------------------------------------------------------------
 * Charge le détail d'un document partenaire (isolé multi-tenant) : fiche
 * complète, jours restants avant expiration et opérations de mise à jour,
 * renouvellement, suppression et téléchargement simulé.
 */
import { useState, useEffect, useCallback } from 'react';
import { getPartnerDocumentDaysLeft } from '../constants/partner.constants';
import { partnerDocumentService } from '../services/partnerDocumentService';

export const usePartnerDocument = (documentId) => {
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await partnerDocumentService.getDocumentById(documentId);
      setDocument(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const daysLeft = document?.expiresAt ? getPartnerDocumentDaysLeft(document.expiresAt) : null;

  const updateDocument = useCallback(
    (payload) => partnerDocumentService.updateDocument(documentId, payload),
    [documentId],
  );
  const renewDocument = useCallback(
    (expiresAt) => partnerDocumentService.renewDocument(documentId, expiresAt),
    [documentId],
  );
  const deleteDocument = useCallback(() => partnerDocumentService.deleteDocument(documentId), [documentId]);
  const downloadDocument = useCallback(() => partnerDocumentService.downloadDocument(documentId), [documentId]);

  return {
    document,
    daysLeft,
    isLoading,
    error,
    refetch,
    updateDocument,
    renewDocument,
    deleteDocument,
    downloadDocument,
  };
};

export default usePartnerDocument;
