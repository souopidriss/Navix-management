/**
 * Navix Super Admin — SuperAdminTransactionDetailPage (SA-FIN-03)
 * --------------------------------------------------------------------------
 * Détail complet d'une transaction financière plateforme : référence, type,
 * direction, statut, montant, solde avant/après, source, destination,
 * description, entité liée, métadonnées, créateur et cohérence financière.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState, ErrorState, StatusBadge, ConfirmDialog } from '@/components/core';
import { superAdminTransactionService } from '../services/superAdminFinanceService';
import {
  getSaTransactionType,
  getTransactionStatus,
  transactionDirectionOf,
  getSourceLabel,
  FCFA_LABEL,
} from '../constants/superAdminFinance.constants';
import { formatDateTime, formatNumber } from '@/utils/format';
import { ROUTES } from '@/routes/route.constants';
import './SuperAdminTransactionDetailPage.css';

const SuperAdminTransactionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reverseTarget, setReverseTarget] = useState(null);
  const [isReversing, setIsReversing] = useState(false);
  const [reverseError, setReverseError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await superAdminTransactionService.getById(id);
        if (active) setTransaction(result);
      } catch (err) {
        if (active) setError(err?.message || 'Transaction introuvable.');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id]);

  const handleReverse = async () => {
    if (!reverseTarget) return;
    setIsReversing(true);
    setReverseError('');
    try {
      await superAdminTransactionService.reverse(reverseTarget.id);
      toast.success('Transaction annulée et remboursée.');
      setReverseTarget(null);
      const updated = await superAdminTransactionService.getById(id);
      setTransaction(updated);
    } catch (err) {
      setReverseError(err?.message || 'Impossible d\u2019annuler la transaction.');
    } finally {
      setIsReversing(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={3} label="Chargement de la transaction…" />
      </PageContainer>
    );
  }

  if (error || !transaction) {
    return (
      <PageContainer>
        <ErrorState
          title="Transaction introuvable"
          description={error || 'Cette transaction n\u2019existe pas ou a été supprimée.'}
          retry={() => navigate(ROUTES.SA_FINANCE_TRANSACTIONS)}
        />
      </PageContainer>
    );
  }

  const type = getSaTransactionType(transaction.type);
  const status = getTransactionStatus(transaction.status);
  const dir = transactionDirectionOf(transaction);
  const isIn = dir === 'in';
  const amount = Number(transaction.amount) || 0;
  const balBefore = Number(transaction.balanceBefore);
  const balAfter = Number(transaction.balanceAfter);
  const hasCoherenceData = balBefore != null && balAfter != null;
  const expectedAfter = isIn ? balBefore + amount : balBefore - amount;
  const isCoherent = !hasCoherenceData || expectedAfter === balAfter;
  const canBeReversed = transaction.status === 'success' && !transaction.reversedRef;

  return (
    <PageContainer>
      <Helmet>
        <title>{transaction.reference || 'Transaction'} — Navix Super Admin</title>
      </Helmet>

      <PageHeader
        title={`Transaction ${transaction.reference}`}
        subtitle={`${type.label} — ${formatDateTime(transaction.createdAt)}`}
        icon={type.icon}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Finance', to: ROUTES.SA_FINANCE },
          { label: 'Transactions', to: ROUTES.SA_FINANCE_TRANSACTIONS },
          { label: transaction.reference },
        ]}
        actions={
          <div className="d-flex align-items-center gap-2">
            {canBeReversed && (
              <Button
                variant="danger"
                size="sm"
                icon="bi-arrow-counterclockwise"
                onClick={() => setReverseTarget(transaction)}
              >
                Annuler
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              icon="bi-arrow-left"
              onClick={() => navigate(ROUTES.SA_FINANCE_TRANSACTIONS)}
            >
              Retour
            </Button>
          </div>
        }
      />

      {!isCoherent && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
          <span>
            <strong>Incohérence détectée :</strong> le solde après ({formatNumber(balAfter)} {FCFA_LABEL}) ne
            correspond pas au calcul attendu ({formatNumber(expectedAfter)} {FCFA_LABEL}).
          </span>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card navix-sa-detail-card mb-4">
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2" aria-hidden="true" />
                Informations générales
              </h5>
              <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-sm-6">
                  <span className="navix-sa-detail__label">Référence</span>
                  <span className="navix-sa-detail__value font-monospace fw-bold">{transaction.reference}</span>
                </div>
                <div className="col-sm-6">
                  <span className="navix-sa-detail__label">Identifiant</span>
                  <span className="navix-sa-detail__value font-monospace">{transaction.id}</span>
                </div>
                <div className="col-sm-6">
                  <span className="navix-sa-detail__label">Type</span>
                  <span className="navix-sa-detail__value">
                    <i className={`bi ${type.icon} me-1`} aria-hidden="true" />
                    {type.label}
                  </span>
                </div>
                <div className="col-sm-6">
                  <span className="navix-sa-detail__label">Direction</span>
                  <span className={`navix-sa-detail__value fw-semibold ${isIn ? 'text-success' : 'text-danger'}`}>
                    <i className={`bi ${isIn ? 'bi-arrow-down-circle' : 'bi-arrow-up-circle'} me-1`} aria-hidden="true" />
                    {isIn ? 'Entrée' : 'Sortie'}
                  </span>
                </div>
                <div className="col-sm-6">
                  <span className="navix-sa-detail__label">Montant</span>
                  <span className={`navix-sa-detail__value fw-bold fs-5 ${isIn ? 'text-success' : 'text-danger'}`}>
                    {isIn ? '+' : '−'} {formatNumber(amount)} {FCFA_LABEL}
                  </span>
                </div>
                <div className="col-sm-6">
                  <span className="navix-sa-detail__label">Devise</span>
                  <span className="navix-sa-detail__value">{transaction.currency || 'XAF'}</span>
                </div>
                <div className="col-12">
                  <span className="navix-sa-detail__label">Description</span>
                  <span className="navix-sa-detail__value">{transaction.description || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card navix-sa-detail-card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-bank me-2" aria-hidden="true" />
                Détails financiers
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-sm-6">
                  <span className="navix-sa-detail__label">Solde avant</span>
                  <span className="navix-sa-detail__value fw-semibold">
                    {hasCoherenceData ? `${formatNumber(balBefore)} ${FCFA_LABEL}` : '—'}
                  </span>
                </div>
                <div className="col-sm-6">
                  <span className="navix-sa-detail__label">Solde après</span>
                  <span className="navix-sa-detail__value fw-semibold">
                    {hasCoherenceData ? `${formatNumber(balAfter)} ${FCFA_LABEL}` : '—'}
                  </span>
                </div>
                <div className="col-sm-6">
                  <span className="navix-sa-detail__label">Source</span>
                  <span className="navix-sa-detail__value">{transaction.source || '—'}</span>
                </div>
                <div className="col-sm-6">
                  <span className="navix-sa-detail__label">Destination</span>
                  <span className="navix-sa-detail__value">{transaction.destination || '—'}</span>
                </div>
                <div className="col-sm-6">
                  <span className="navix-sa-detail__label">Type de source</span>
                  <span className="navix-sa-detail__value">{getSourceLabel(transaction.sourceType)}</span>
                </div>
                <div className="col-sm-6">
                  <span className="navix-sa-detail__label">Portefeuille</span>
                  <span className="navix-sa-detail__value font-monospace">{transaction.fundId || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card navix-sa-detail-card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-person me-2" aria-hidden="true" />
                Traçabilité
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column gap-3">
                <div>
                  <span className="navix-sa-detail__label">Créé le</span>
                  <span className="navix-sa-detail__value">{formatDateTime(transaction.createdAt)}</span>
                </div>
                <div>
                  <span className="navix-sa-detail__label">Modifié le</span>
                  <span className="navix-sa-detail__value">{formatDateTime(transaction.updatedAt)}</span>
                </div>
                <div>
                  <span className="navix-sa-detail__label">Créé par</span>
                  <span className="navix-sa-detail__value font-monospace">{transaction.createdBy || '—'}</span>
                </div>
                <div>
                  <span className="navix-sa-detail__label">Rôle du créateur</span>
                  <span className="navix-sa-detail__value">
                    <span className="badge bg-primary-subtle text-primary">{transaction.createdByRole || '—'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {transaction.relatedEntityType && (
            <div className="card navix-sa-detail-card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-link-45deg me-2" aria-hidden="true" />
                  Entité liée
                </h5>
              </div>
              <div className="card-body">
                <div className="d-flex flex-column gap-3">
                  <div>
                    <span className="navix-sa-detail__label">Type</span>
                    <span className="navix-sa-detail__value">{transaction.relatedEntityType}</span>
                  </div>
                  <div>
                    <span className="navix-sa-detail__label">Identifiant</span>
                    <span className="navix-sa-detail__value font-monospace">{transaction.relatedEntityId || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {transaction.reversedRef && (
            <div className="card navix-sa-detail-card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-arrow-counterclockwise me-2" aria-hidden="true" />
                  Annulation
                </h5>
              </div>
              <div className="card-body">
                <div>
                  <span className="navix-sa-detail__label">Annulée par</span>
                  <span className="navix-sa-detail__value font-monospace fw-semibold">{transaction.reversedRef}</span>
                </div>
              </div>
            </div>
          )}

          {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
            <div className="card navix-sa-detail-card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-braces me-2" aria-hidden="true" />
                  Métadonnées
                </h5>
              </div>
              <div className="card-body">
                <dl className="row mb-0 navix-sa-meta">
                  {Object.entries(transaction.metadata).map(([key, value]) => (
                    <div key={key} className="col-12">
                      <dt className="navix-sa-detail__label">{key}</dt>
                      <dd className="navix-sa-detail__value font-monospace">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(reverseTarget)}
        onClose={() => setReverseTarget(null)}
        title="Annuler cette transaction"
        icon="bi-arrow-counterclockwise"
        confirmLabel="Annuler et rembourser"
        confirmVariant="danger"
        loading={isReversing}
        error={reverseError}
        onConfirm={handleReverse}
        message={
          reverseTarget ? (
            <>
              <p className="mb-2">
                Vous êtes sur le point d'annuler la transaction{' '}
                <strong className="font-monospace">{reverseTarget.reference}</strong> ({formatNumber(reverseTarget.amount)} {FCFA_LABEL}).
              </p>
              <p className="mb-0 small text-secondary">
                Un remboursement compensatoire sera créé. L'historique reste intact.
              </p>
            </>
          ) : null
        }
      />
    </PageContainer>
  );
};

export default SuperAdminTransactionDetailPage;
