/**
 * Navix Partner Portal — PartnerSupportPage (PROMPT 077)
 * ──────────────────────────────────────────────────────
 * Centre de Support & Assistance Partenaire.
 * Page principale : KPI, filtres, liste des tickets, création.
 */
import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { PageContainer, PageHeader, LoadingState, ErrorState } from '@/components/core';
import { usePartnerSupport } from '../hooks/usePartnerSupport';
import { createTicket } from '../services/partnerSupportService';
import {
  PartnerSupportStats,
  PartnerSupportFilters,
  PartnerSupportTicketsTable,
  PartnerSupportTicketModal,
} from '../components/PartnerSupport';
import '../components/PartnerSupport/PartnerSupport.css';

const PartnerSupportPage = () => {
  const {
    tickets,
    stats,
    total,
    totalPages,
    isLoading,
    error,
    filters,
    setFilters,
    refetch,
  } = usePartnerSupport({ pageSize: 10 });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const handleCreateTicket = useCallback(async (payload) => {
    try {
      setCreating(true);
      setCreateError(null);
      await createTicket(payload);
      toast.success('Votre demande a été créée avec succès.');
      setShowCreateModal(false);
      refetch();
    } catch (err) {
      setCreateError(err?.message || 'Erreur lors de la création du ticket.');
    } finally {
      setCreating(false);
    }
  }, [refetch]);

  return (
    <PageContainer>
      <Helmet>
        <title>Support & Assistance — Espace Partenaire</title>
      </Helmet>

      <PageHeader
        title="Support & Assistance"
        subtitle="Besoin d'aide ? Consultez vos demandes ou contactez notre équipe."
        actions={[
          {
            label: 'Nouvelle demande',
            icon: 'bi-plus-circle',
            onClick: () => setShowCreateModal(true),
            variant: 'primary',
          },
          {
            label: 'Actualiser',
            icon: 'bi-arrow-clockwise',
            onClick: refetch,
            variant: 'secondary',
          },
        ]}
      />

      {isLoading && <LoadingState label="Chargement des demandes de support..." />}
      {error && !isLoading && (
        <ErrorState
          title="Erreur de chargement"
          description={error}
          retry={refetch}
        />
      )}

      {!isLoading && !error && (
        <>
          <PartnerSupportStats stats={stats} />

          <PartnerSupportFilters
            filters={filters}
            onFilterChange={setFilters}
          />

          <PartnerSupportTicketsTable
            tickets={tickets}
            total={total}
            totalPages={totalPages}
            filters={filters}
            onFilterChange={setFilters}
            onCreateTicket={() => setShowCreateModal(true)}
            isLoading={isLoading}
          />
        </>
      )}

      <PartnerSupportTicketModal
        open={showCreateModal}
        onClose={() => { setShowCreateModal(false); setCreateError(null); }}
        onSubmit={handleCreateTicket}
        loading={creating}
        error={createError}
      />
    </PageContainer>
  );
};

export default PartnerSupportPage;
