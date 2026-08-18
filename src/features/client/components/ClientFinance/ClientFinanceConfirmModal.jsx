/**
 * Navix Client Finance — ClientFinanceConfirmModal
 * --------------------------------------------------------------------------
 * Étape de confirmation avant d'enregistrer une opération : vérification du
 * type, du montant, de la source, de la destination, de la référence
 * (lecture seule) et du total. Aucune opération n'est enregistrée tant que
 * l'utilisateur n'a pas confirmé.
 */
import { FormModal } from '@/components/core';
import { formatNumber } from '@/utils/format';
import { FCFA_LABEL } from '../../constants/client.constants';
import './ClientFinance.css';

const Row = ({ label, value, mono = false }) => (
  <div className="navix-client-finance__detail-row">
    <span className="navix-client-finance__detail-key">{label}</span>
    <span className={`navix-client-finance__detail-value ${mono ? 'font-monospace' : ''}`}>{value}</span>
  </div>
);

const ClientFinanceConfirmModal = ({
  open,
  onClose,
  summary = null,
  onConfirm,
  loading = false,
  error = '',
  confirmLabel = 'Confirmer l’opération',
}) => {
  if (!summary) return null;

  const isIn = summary.direction === 'in';

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Confirmer l’opération"
      subtitle="Vérifiez les informations avant d’enregistrer."
      icon="bi-shield-check"
      size="md"
      onSubmit={onConfirm}
      loading={loading}
      error={error}
      submitLabel={confirmLabel}
      cancelLabel="Revenir"
    >
      <div className="mb-3 text-center">
        <span className={`navix-client-finance__detail-amount ${isIn ? 'navix-client-finance__detail-amount--in' : 'navix-client-finance__detail-amount--out'}`}>
          {isIn ? '+' : '−'} {formatNumber(summary.amount)} {FCFA_LABEL}
        </span>
      </div>

      <Row label="Type" value={summary.typeLabel} />
      {summary.reference && <Row label="Référence" value={summary.reference} mono />}
      <Row label="Statut" value="À confirmer" />
      {summary.source && <Row label="Source" value={summary.source} />}
      {summary.destination && <Row label="Destination" value={summary.destination} />}
      {summary.description && <Row label="Description" value={summary.description} />}
      <Row label="Total" value={`${formatNumber(summary.amount)} ${FCFA_LABEL}`} />
    </FormModal>
  );
};

export default ClientFinanceConfirmModal;
