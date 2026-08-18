/**
 * Navix Partner Portal — PartnerRequestsPage
 * --------------------------------------------------------------------------
 * Page principale Demandes : KPI + tableau + actions (accepter / refuser / convertir).
 */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState, ErrorState, ConfirmDialog } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { usePartnerContext } from '../hooks/usePartnerContext';
import { usePartnerRequests } from '../hooks/usePartnerRequests';
import PartnerRequestStats from '../components/PartnerRequests/PartnerRequestStats';
import PartnerRequestsTable from '../components/PartnerRequests/PartnerRequestsTable';
import '../components/PartnerRequests/PartnerRequests.css';
import '@/features/client/components/ClientFinance/ClientFinance.css';

const PartnerRequestsPage = () => {
  const { companyName } = usePartnerContext();
  const {
    requests, stats, isLoading, error, refetch,
    acceptRequest, rejectRequest, convertToMission,
  } = usePartnerRequests();
  const [showConfirm, setShowConfirm] = useState({ type: null, request: null, isOpen: false });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleAccept = (request) => {
    setShowConfirm({ type: 'accept', request, isOpen: true });
  };

  const handleReject = (request) => {
    setShowConfirm({ type: 'reject', request, isOpen: true });
  };

  const handleConvert = (request) => {
    setShowConfirm({ type: 'convert', request, isOpen: true });
  };

  const getConfirmConfig = () => {
    if (showConfirm.type === 'accept') {
      return {
        title: 'Accepter la demande',
        message: <>Accepter la demande <strong>{showConfirm.request?.reference}</strong> de <strong>{showConfirm.request?.clientName}</strong> ?</>,
        confirmLabel: 'Accepter',
        confirmVariant: 'primary',
        icon: 'bi-check-lg',
      };
    }
    if (showConfirm.type === 'reject') {
      return {
        title: 'Refuser la demande',
        message: <>Refuser la demande <strong>{showConfirm.request?.reference}</strong> ?</>,
        confirmLabel: 'Refuser',
        confirmVariant: 'danger',
        icon: 'bi-x-lg',
      };
    }
    return {
      title: 'Convertir en mission',
      message: <>Convertir la demande <strong>{showConfirm.request?.reference}</strong> en mission ?</>,
      confirmLabel: 'Convertir',
      confirmVariant: 'primary',
      icon: 'bi-arrow-right-circle',
    };
  };

  const confirmConfig = showConfirm.isOpen ? getConfirmConfig() : {};

  const handleConfirmAction = async () => {
    setConfirmLoading(true);
    try {
      if (showConfirm.type === 'accept') {
        await acceptRequest(showConfirm.request.id);
        toast.success('Demande acceptée avec succès.');
      } else if (showConfirm.type === 'reject') {
        await rejectRequest(showConfirm.request.id);
        toast.success('Demande refusée.');
      } else if (showConfirm.type === 'convert') {
        await convertToMission(showConfirm.request.id);
        toast.success('Demande convertie en mission.');
      }
      setShowConfirm({ type: null, request: null, isOpen: false });
      refetch();
    } catch (err) {
      toast.error(err?.message || 'Une erreur est survenue.');
    } finally {
      setConfirmLoading(false);
    }
  };

  if (isLoading && !stats) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement des demandes..." />
      </PageContainer>
    );
  }

  if (error && !stats) {
    return (
      <PageContainer>
        <ErrorState
          title="Impossible de charger les demandes"
          description="Les données sont temporairement indisponibles."
          retry={() => refetch()}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Demandes — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title="Demandes"
        subtitle={`Gérez les demandes de vos clients et suivez leur traitement — ${companyName || 'votre entreprise partenaire'}.`}
        icon="bi-inbox"
        breadcrumbs={[
          { label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD },
          { label: 'Exploitation', to: ROUTES.PARTNER_MISSIONS },
          { label: 'Demandes' },
        ]}
        actions={
          <div className="d-flex gap-2">
            <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={() => refetch()} aria-label="Actualiser">
              <span className="visually-hidden">Actualiser</span>
            </Button>
          </div>
        }
      />

      <PartnerRequestStats stats={stats} />
      <PartnerRequestsTable
        requests={requests}
        onAccept={handleAccept}
        onReject={handleReject}
        onConvert={handleConvert}
      />

      <ConfirmDialog
        open={showConfirm.isOpen}
        onClose={() => setShowConfirm({ type: null, request: null, isOpen: false })}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        cancelLabel="Annuler"
        confirmVariant={confirmConfig.confirmVariant}
        icon={confirmConfig.icon}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
      />
    </PageContainer>
  );
};

export default PartnerRequestsPage;
