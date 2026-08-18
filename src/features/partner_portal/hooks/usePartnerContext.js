/**
 * Navix Partner Portal — Hook custom usePartnerContext
 * --------------------------------------------------------------------------
 * Fournit le contexte multi-tenant du Partenaire (companyId, tenantId,
 * companyName, companyLogo, companyStatus, partnerId) chargé depuis
 * partnerPortalService via le store Partenaire.
 */
import { useEffect } from 'react';
import { usePartnerStore } from '../store/partner.store';

export const usePartnerContext = () => {
  const companyContext = usePartnerStore((state) => state.companyContext);
  const fetchContext = usePartnerStore((state) => state.fetchContext);

  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  return {
    companyId: companyContext?.companyId ?? '',
    tenantId: companyContext?.tenantId ?? '',
    partnerId: companyContext?.partnerId ?? '',
    companyName: companyContext?.companyName ?? '',
    companyLogo: companyContext?.companyLogo ?? null,
    companyStatus: companyContext?.companyStatus ?? 'active',
    companyContext,
    refetch: fetchContext,
  };
};

export default usePartnerContext;
