/**
 * Navix Partner Portal — PartnerSupportTicketDetailPage (PROMPT 077)
 * ───────────────────────────────────────────────────────────────────
 * Page de détail d'un ticket de support : infos, conversation, réponse.
 */
import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ROUTES } from '@/routes/route.constants';
import { PageContainer, LoadingState, ErrorState, StatusBadge } from '@/components/core';
import { usePartnerTicket } from '../hooks/usePartnerSupport';
import {
  getTicketStatus,
  getTicketPriority,
  getTicketCategory,
} from '../schemas/partnerSupport.schema';
import '../components/PartnerSupport/PartnerSupport.css';

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }) + ' — ' + d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const entityTypeRoutes = {
  vehicle: () => ROUTES.PARTNER_VEHICLES,
  mission: (entityId) => `${ROUTES.PARTNER_MISSIONS}/${entityId}`,
  invoice: (entityId) => `${ROUTES.PARTNER_FINANCE_INVOICES}/${entityId}`,
  contract: (entityId) => `${ROUTES.PARTNER_CONTRACTS}/${entityId}`,
  document: (entityId) => `${ROUTES.PARTNER_DOCUMENTS}/${entityId}`,
  client: (entityId) => `${ROUTES.PARTNER_CLIENTS}/${entityId}`,
  company: () => ROUTES.PARTNER_PROFILE,
  request: (entityId) => `${ROUTES.PARTNER_REQUESTS}/${entityId}`,
};

const entityTypeLabels = {
  vehicle: 'Véhicule',
  mission: 'Mission',
  invoice: 'Facture',
  contract: 'Contrat',
  document: 'Document',
  client: 'Client',
  company: 'Entreprise',
  request: 'Demande',
};

const PartnerSupportTicketDetailPage = () => {
  const { ticketId: ticketIdParam } = useParams();
  const ticketId = ticketIdParam;
  const navigate = useNavigate();

  const {
    ticket,
    isLoading,
    error,
    replying,
    reply,
    closeTicket,
    refetch,
  } = usePartnerTicket(ticketId);

  const [replyContent, setReplyContent] = useState('');
  const [replyError, setReplyError] = useState(null);

  const handleReply = useCallback(async () => {
    const trimmed = replyContent.trim();
    if (!trimmed || trimmed.length < 5) {
      setReplyError('La réponse doit contenir au moins 5 caractères.');
      return;
    }

    setReplyError(null);
    const ok = await reply(trimmed);
    if (ok) {
      setReplyContent('');
      toast.success('Votre réponse a été envoyée.');
    } else {
      toast.error('Impossible d\'envoyer la réponse.');
    }
  }, [replyContent, reply]);

  const handleClose = useCallback(async () => {
    const ok = await closeTicket();
    if (ok) {
      toast.success('Le ticket a été fermé.');
    }
  }, [closeTicket]);

  const handleNavigateEntity = useCallback(() => {
    if (!ticket?.entityType || !ticket?.entityId) return;
    const routeFn = entityTypeRoutes[ticket.entityType];
    if (routeFn) {
      navigate(routeFn(ticket.entityId));
    }
  }, [ticket, navigate]);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState label="Chargement du ticket..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState
          title="Erreur de chargement"
          description={error}
          retry={refetch}
        />
      </PageContainer>
    );
  }

  if (!ticket) {
    return (
      <PageContainer>
        <ErrorState
          title="Ticket introuvable"
          description="Ce ticket n'existe pas ou vous n'avez pas les droits d'accès."
          variant="warning"
          retry={() => navigate(ROUTES.PARTNER_SUPPORT)}
          retryLabel="Retour au support"
        />
      </PageContainer>
    );
  }

  const st = getTicketStatus(ticket.status);
  const pr = getTicketPriority(ticket.priority);
  const cat = getTicketCategory(ticket.category);
  const canReply = ticket.status !== 'closed' && ticket.status !== 'resolved';

  return (
    <PageContainer>
      <Helmet>
        <title>{ticket.reference} — Support — Espace Partenaire</title>
      </Helmet>

      <div className="ps-detail">
        <div style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => navigate(ROUTES.PARTNER_SUPPORT)}
          >
            <i className="bi bi-arrow-left me-1" />
            Retour aux demandes
          </button>
        </div>

        {/* Header */}
        <div className="ps-detail-header">
          <div className="ps-detail-header__info">
            <div className="ps-detail-header__reference">{ticket.reference}</div>
            <h1 className="ps-detail-header__subject">{ticket.subject}</h1>
            <div className="ps-detail-header__meta">
              <span className="ps-detail-header__meta-item">
                <i className="bi bi-calendar3" />
                Créé le {formatDateTime(ticket.createdAt)}
              </span>
              <span className="ps-detail-header__meta-item">
                <i className="bi bi-clock-history" />
                Activité le {formatDateTime(ticket.updatedAt)}
              </span>
              <span className="ps-detail-header__meta-item">
                <span className="ps-category">
                  <i className={`bi ${cat.icon}`} />
                  {cat.label}
                </span>
              </span>
            </div>
          </div>
          <div className="ps-detail-header__badges">
            <StatusBadge
              variant={pr.variant}
              label={pr.label}
              icon={pr.icon}
              dot
              soft
            />
            <StatusBadge
              variant={st.variant}
              label={st.label}
              icon={st.icon}
              dot
              soft
            />
          </div>
        </div>

        {/* Entity link */}
        {ticket.entityType && ticket.entityId && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              type="button"
              className="ps-entity-link"
              onClick={handleNavigateEntity}
            >
              <i className={`bi ${
                ticket.entityType === 'vehicle' ? 'bi-truck' :
                ticket.entityType === 'mission' ? 'bi-signpost-split' :
                ticket.entityType === 'invoice' ? 'bi-receipt' :
                ticket.entityType === 'contract' ? 'bi-file-earmark-text' :
                'bi-folder2-open'
              }`} />
              {entityTypeLabels[ticket.entityType]} : {ticket.entityLabel || ticket.entityId}
              <i className="bi bi-box-arrow-up-right" style={{ fontSize: '0.7rem' }} />
            </button>
          </div>
        )}

        {/* Conversation */}
        <div className="ps-thread">
          <h3 className="ps-thread__title">Conversation</h3>
          <div className="ps-thread__messages">
            {ticket.messages.map((msg) => (
              <div
                key={msg.id}
                className={`ps-message ps-message--${msg.authorRole}`}
              >
                <div className={`ps-message__avatar ps-message__avatar--${msg.authorRole}`}>
                  {msg.authorRole === 'partner' ? 'P' : 'S'}
                </div>
                <div className="ps-message__body">
                  <div className="ps-message__header">
                    <span className="ps-message__author">{msg.author}</span>
                    <span className={`ps-message__role ps-message__role--${msg.authorRole}`}>
                      {msg.authorRole === 'partner' ? 'Partenaire' : 'Support Navix'}
                    </span>
                    <span className="ps-message__time">{formatDateTime(msg.createdAt)}</span>
                  </div>
                  <div className="ps-message__content">{msg.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reply form */}
        {canReply && (
          <div className="ps-reply">
            <h3 className="ps-reply__title">Votre réponse</h3>
            <textarea
              className="ps-reply__textarea"
              placeholder="Écrivez votre réponse ici..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              disabled={replying}
              aria-label="Votre réponse"
            />
            {replyError && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-danger, #ef4444)', marginTop: '0.35rem' }}>
                {replyError}
              </div>
            )}
            <div className="ps-reply__actions">
              {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleClose}
                  disabled={replying}
                >
                  <i className="bi bi-lock me-1" />
                  Fermer le ticket
                </button>
              )}
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleReply}
                disabled={replying || !replyContent.trim()}
              >
                {replying ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send me-1" />
                    Envoyer la réponse
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {!canReply && (
          <div className="ps-reply" style={{ textAlign: 'center', color: 'var(--color-text-secondary, #6b7280)' }}>
            <i className="bi bi-lock" style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'block' }} />
            Ce ticket est {ticket.status === 'closed' ? 'fermé' : 'résolu'}. Vous ne pouvez plus y répondre.
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default PartnerSupportTicketDetailPage;
