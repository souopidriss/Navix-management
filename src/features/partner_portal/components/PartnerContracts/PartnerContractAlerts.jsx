/**
 * Navix Partner Portal — PartnerContractAlerts (PROMPT 073)
 * --------------------------------------------------------------------------
 * Bandeau d'alertes pour contrats expirant bientôt ou déjà expirés.
 */
import { formatDateTime } from '@/utils/format';

const PartnerContractAlerts = ({ contracts = [] }) => {
  if (!contracts.length) return null;

  const expired = contracts.filter((c) => c.status === 'expired');
  const expiring = contracts.filter((c) => c.status === 'expiring');

  if (!expired.length && !expiring.length) return null;

  return (
    <div className="d-flex flex-column gap-2 mb-4">
      {expired.length > 0 && (
        <div className="contract-alerts-bar alert-danger">
          <i className="bi bi-exclamation-octagon-fill fs-5" />
          <div>
            <strong>{expired.length} contrat{expired.length > 1 ? 's' : ''} expiré{expired.length > 1 ? 's' : ''}</strong>
            {' — '}
            {expired.map((c) => c.reference).join(', ')}
            {expired.length <= 2 && (
              <span className="ms-1 text-muted">
                (fin : {expired.map((c) => formatDateTime(c.endDate, 'DD MMM')).join(', ')})
              </span>
            )}
          </div>
        </div>
      )}
      {expiring.length > 0 && (
        <div className="contract-alerts-bar alert-warning">
          <i className="bi bi-exclamation-triangle-fill fs-5" />
          <div>
            <strong>{expiring.length} contrat{expiring.length > 1 ? 's' : ''} expirent bientôt</strong>
            {' — '}
            {expiring.map((c) => c.reference).join(', ')}
            {expiring.length <= 3 && (
              <span className="ms-1 text-muted">
                (fin : {expiring.map((c) => formatDateTime(c.endDate, 'DD MMM')).join(', ')})
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerContractAlerts;
