/**
 * Navix Partner Portal — PartnerInvoicesPage (PROMPT 071 §4)
 * --------------------------------------------------------------------------
 * Page principale Facturation : KPI + alertes + tableau + création.
 * Réutilise l'infrastructure existante — NE PAS créer un 2e système financier.
 */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState, ErrorState } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { usePartnerContext } from '../hooks/usePartnerContext';
import { usePartnerInvoices } from '../hooks/usePartnerInvoices';
import PartnerInvoiceStats from '../components/PartnerInvoices/PartnerInvoiceStats';
import PartnerInvoiceAlerts from '../components/PartnerInvoices/PartnerInvoiceAlerts';
import PartnerInvoicesTable from '../components/PartnerInvoices/PartnerInvoicesTable';
import PartnerInvoiceCreateModal from '../components/PartnerInvoices/PartnerInvoiceCreateModal';
import '../components/PartnerInvoices/PartnerInvoices.css';
import '@/features/client/components/ClientFinance/ClientFinance.css';

const PartnerInvoicesPage = () => {
  const { companyName } = usePartnerContext();
  const {
    invoices, stats, overdueInvoices, dueSoonInvoices,
    isLoading, error, refetch, createInvoice,
  } = usePartnerInvoices();
  const [showCreate, setShowCreate] = useState(false);

  const handleCreateInvoice = async (values) => {
    try {
      await createInvoice(values);
      toast.success('Facture créée avec succès.');
      setShowCreate(false);
      refetch();
    } catch (err) {
      toast.error(err?.message || 'Une erreur est survenue lors de la création.');
    }
  };

  if (isLoading && !stats) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement des factures..." />
      </PageContainer>
    );
  }

  if (error && !stats) {
    return (
      <PageContainer>
        <ErrorState
          title="Impossible de charger les factures"
          description="Les données sont temporairement indisponibles."
          retry={() => refetch()}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Facturation — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title="Facturation"
        subtitle={`Gérez vos factures et suivez leur règlement — ${companyName || 'votre entreprise partenaire'}.`}
        icon="bi-receipt"
        breadcrumbs={[
          { label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD },
          { label: 'Finances', to: ROUTES.PARTNER_FINANCE },
          { label: 'Factures' },
        ]}
        actions={
          <div className="d-flex gap-2">
            <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={() => refetch()} aria-label="Actualiser">
              <span className="visually-hidden">Actualiser</span>
            </Button>
            <Button variant="primary" size="sm" icon="bi-plus-lg" onClick={() => setShowCreate(true)}>
              Nouvelle facture
            </Button>
          </div>
        }
      />

      <PartnerInvoiceStats stats={stats} />
      <PartnerInvoiceAlerts overdueInvoices={overdueInvoices} dueSoonInvoices={dueSoonInvoices} />
      <PartnerInvoicesTable invoices={invoices} />

      <PartnerInvoiceCreateModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreateInvoice}
      />
    </PageContainer>
  );
};

export default PartnerInvoicesPage;
