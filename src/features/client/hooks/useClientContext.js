/**
 * Navix Client — Hook custom useClientContext
 * --------------------------------------------------------------------------
 * Fournit le contexte entreprise / multi-tenant du Client (companyId,
 * tenantId, companyName, companyLogo, companyStatus) chargé depuis
 * clientPortalService via le store Client.
 */
import { useEffect } from 'react';
import { useClientStore } from '../store/client.store';

export const useClientContext = () => {
  const companyContext = useClientStore((state) => state.companyContext);
  const fetchContext = useClientStore((state) => state.fetchContext);

  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  return {
    companyId: companyContext?.companyId ?? '',
    tenantId: companyContext?.tenantId ?? '',
    companyName: companyContext?.companyName ?? '',
    companyLogo: companyContext?.companyLogo ?? null,
    companyStatus: companyContext?.companyStatus ?? 'active',
    companyContext,
    refetch: fetchContext,
  };
};

export default useClientContext;
