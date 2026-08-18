import { ConfirmDialog } from '@/components/core';
import { formatNumber } from '@/utils/format';
import { FCFA_LABEL, getSaTransactionType } from '../constants/superAdminFinance.constants';

const SuperAdminConfirmModal = ({ open, onClose, summary, onConfirm, loading, error }) => {
  if (!summary) return null;

  const typeConfig = getSaTransactionType(summary.type);
  const isIn = summary.direction === 'in';
  const newBalance = isIn ? summary.balanceBefore + summary.amount : summary.balanceBefore - summary.amount;

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title={`Confirmer le ${typeConfig.label.toLowerCase()}`}
      icon={typeConfig.icon}
      confirmLabel={typeConfig.label}
      confirmVariant={isIn ? 'success' : 'danger'}
      loading={loading}
      error={error}
      onConfirm={onConfirm}
      size="md"
      message={
        <div>
          <div className="mb-3">
            <div className="navix-sa-confirm-row">
              <span className="navix-sa-confirm-label">Type d'opération</span>
              <span className="navix-sa-confirm-value">{typeConfig.label}</span>
            </div>
            <div className="navix-sa-confirm-row">
              <span className="navix-sa-confirm-label">Référence</span>
              <span className="navix-sa-confirm-value font-monospace">{summary.reference}</span>
            </div>
            <div className="navix-sa-confirm-row">
              <span className="navix-sa-confirm-label">Montant</span>
              <span className={`navix-sa-confirm-value ${isIn ? 'navix-sa-confirm-value--success' : 'navix-sa-confirm-value--danger'}`}>
                {isIn ? '+' : '-'}{formatNumber(summary.amount)} {FCFA_LABEL}
              </span>
            </div>
            {summary.source && (
              <div className="navix-sa-confirm-row">
                <span className="navix-sa-confirm-label">{isIn ? 'Source' : 'Destination'}</span>
                <span className="navix-sa-confirm-value">{summary.source || summary.destination}</span>
              </div>
            )}
            {summary.description && (
              <div className="navix-sa-confirm-row">
                <span className="navix-sa-confirm-label">Description</span>
                <span className="navix-sa-confirm-value">{summary.description}</span>
              </div>
            )}
          </div>
          <div className="navix-sa-confirm-row navix-sa-confirm-row--total">
            <span className="navix-sa-confirm-label">Solde actuel</span>
            <span className="navix-sa-confirm-value">{formatNumber(summary.balanceBefore)} {FCFA_LABEL}</span>
          </div>
          <div className="navix-sa-confirm-row navix-sa-confirm-row--total">
            <span className="navix-sa-confirm-label" style={{ fontWeight: 600 }}>Nouveau solde</span>
            <span className={`navix-sa-confirm-value ${newBalance < 0 ? 'navix-sa-confirm-value--danger' : 'navix-sa-confirm-value--success'}`} style={{ fontWeight: 700, fontSize: '1.05rem' }}>
              {formatNumber(newBalance)} {FCFA_LABEL}
            </span>
          </div>
        </div>
      }
    />
  );
};

export default SuperAdminConfirmModal;
