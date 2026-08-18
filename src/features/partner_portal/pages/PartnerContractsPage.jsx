/**
 * Navix Partner Portal — PartnerContractsPage (PROMPT 073)
 * --------------------------------------------------------------------------
 * Page principale Contrats & Engagements :
 * KPI + alertes + tableau + actions (renouveler, résilier, suspendre).
 */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState, ErrorState, ConfirmDialog } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { usePartnerContext } from '../hooks/usePartnerContext';
import {
  usePartnerContracts,
  usePartnerContractStats,
  useCreateContract,
  useRenewContract,
  useTerminateContract,
  useToggleSuspendContract,
} from '../hooks/usePartnerContracts';
import PartnerContractStats from '../components/PartnerContracts/PartnerContractStats';
import PartnerContractAlerts from '../components/PartnerContracts/PartnerContractAlerts';
import PartnerContractsTable from '../components/PartnerContracts/PartnerContractsTable';
import PartnerContractFormModal from '../components/PartnerContracts/PartnerContractFormModal';
import '../components/PartnerContracts/PartnerContracts.css';
import '@/features/client/components/ClientFinance/ClientFinance.css';

const PartnerContractsPage = () => {
  const { companyName } = usePartnerContext();
  const { data: statsData, isLoading: statsLoading, error: statsError, refetch: refetchStats } = usePartnerContractStats();
  const [filters] = useState({
    page: 1,
    pageSize: 100,
    status: 'all',
    type: 'all',
    search: '',
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });
  const { data: contractsData, refetch } = usePartnerContracts(filters);
  const renewMutation = useRenewContract();
  const terminateMutation = useTerminateContract();
  const suspendMutation = useToggleSuspendContract();
  const createMutation = useCreateContract();

  const [modal, setModal] = useState({ type: null, contract: null, isOpen: false });
  const [formOpen, setFormOpen] = useState(false);

  const handleRenew = (contract) => setModal({ type: 'renew', contract, isOpen: true });
  const handleTerminate = (contract) => setModal({ type: 'terminate', contract, isOpen: true });
  const handleSuspend = (contract) => setModal({ type: 'suspend', contract, isOpen: true });

  const handleConfirm = async () => {
    try {
      if (modal.type === 'renew') {
        await renewMutation.mutateAsync({ contractId: modal.contract.id });
        toast.success('Contrat renouvelé avec succès.');
      } else if (modal.type === 'terminate') {
        await terminateMutation.mutateAsync({ contractId: modal.contract.id, reason: 'Résiliation depuis le tableau de bord' });
        toast.success('Contrat résilié avec succès.');
      } else if (modal.type === 'suspend') {
        await suspendMutation.mutateAsync(modal.contract.id);
        toast.success('Statut du contrat mis à jour.');
      }
      setModal({ type: null, contract: null, isOpen: false });
      refetch();
      refetchStats();
    } catch (err) {
      toast.error(err?.message || 'Une erreur est survenue.');
    }
  };

  const modalLoading = renewMutation.loading || terminateMutation.loading || suspendMutation.loading;

  const getModalConfig = () => {
    if (modal.type === 'renew') {
      return {
        title: 'Renouveler le contrat',
        message: <>Renouveler le contrat <strong>{modal.contract?.reference}</strong> ? La date de fin sera prolongée d'un an.</>,
        confirmLabel: 'Renouveler',
        confirmVariant: 'primary',
        icon: 'bi-arrow-clockwise',
      };
    }
    if (modal.type === 'terminate') {
      return {
        title: 'Résilier le contrat',
        message: <>Résilier le contrat <strong>{modal.contract?.reference}</strong> de <strong>{modal.contract?.clientName}</strong> ? Cette action est irréversible.</>,
        confirmLabel: 'Résilier',
        confirmVariant: 'danger',
        icon: 'bi-x-lg',
      };
    }
    if (modal.contract?.status === 'suspended') {
      return {
        title: 'Réactiver le contrat',
        message: <>Réactiver le contrat <strong>{modal.contract?.reference}</strong> ?</>,
        confirmLabel: 'Réactiver',
        confirmVariant: 'primary',
        icon: 'bi-play-circle',
      };
    }
    return {
      title: 'Suspendre le contrat',
      message: <>Suspendre le contrat <strong>{modal.contract?.reference}</strong> ? Les missions liées seront mises en pause.</>,
      confirmLabel: 'Suspendre',
      confirmVariant: 'warning',
      icon: 'bi-pause-circle',
    };
  };

  const modalConfig = modal.isOpen ? getModalConfig() : {};

  const handleCreate = async (values) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success('Contrat créé avec succès.');
      setFormOpen(false);
      refetch();
      refetchStats();
    } catch (err) {
      toast.error(err?.message || 'Une erreur est survenue lors de la création.');
    }
  };

  if (statsLoading && !statsData) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement des contrats..." />
      </PageContainer>
    );
  }

  if (statsError && !statsData) {
    return (
      <PageContainer>
        <ErrorState
          title="Impossible de charger les contrats"
          description="Les données sont temporairement indisponibles."
          retry={() => refetchStats()}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Contrats — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title="Contrats & Engagements"
        subtitle={`Gérez les contrats de prestation et suivez leur cycle de vie — ${companyName || 'votre entreprise partenaire'}.`}
        icon="bi-file-earmark-text"
        breadcrumbs={[
          { label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD },
          { label: 'Exploitation', to: ROUTES.PARTNER_MISSIONS },
          { label: 'Contrats' },
        ]}
        actions={
          <div className="d-flex gap-2">
            <Button variant="primary" size="sm" icon="bi-plus-lg" onClick={() => setFormOpen(true)}>
              Nouveau contrat
            </Button>
            <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={() => { refetch(); refetchStats(); }} aria-label="Actualiser">
              <span className="visually-hidden">Actualiser</span>
            </Button>
          </div>
        }
      />

      <PartnerContractStats stats={statsData} />
      <PartnerContractAlerts contracts={contractsData?.contracts || []} />
      <PartnerContractsTable
        contracts={contractsData?.contracts || []}
        onRenew={handleRenew}
        onTerminate={handleTerminate}
        onSuspend={handleSuspend}
      />

      <ConfirmDialog
        open={modal.isOpen}
        onClose={() => setModal({ type: null, contract: null, isOpen: false })}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmLabel={modalConfig.confirmLabel}
        cancelLabel="Annuler"
        confirmVariant={modalConfig.confirmVariant}
        icon={modalConfig.icon}
        loading={modalLoading}
        onConfirm={handleConfirm}
      />

      <PartnerContractFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        loading={createMutation.loading}
      />
    </PageContainer>
  );
};

export default PartnerContractsPage;
