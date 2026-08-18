/**
 * Navix Partner Portal — PartnerAlertEcheances (PROMPT 075)
 * ─────────────────────────────────────────────────────────
 * Section des prochaines échéances (documents, contrats, factures).
 * Triées par date d'expiration croissante.
 */
import { getDaysLeft, getExpiryLabel } from '../../services/partnerAlertService';
import { formatDateTime } from '@/utils/format';

const getDaysClass = (daysLeft) => {
  if (daysLeft === null) return '';
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 7) return 'urgent';
  if (daysLeft <= 30) return 'soon';
  return 'ok';
};

const PartnerAlertEcheances = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  const echeances = alerts
    .filter((a) => a.expiresAt && a.status === 'pending')
    .map((a) => ({
      ...a,
      daysLeft: getDaysLeft(a.expiresAt),
      expiryLabel: getExpiryLabel(a.expiresAt),
    }))
    .sort((a, b) => {
      if (a.daysLeft === null) return 1;
      if (b.daysLeft === null) return -1;
      return a.daysLeft - b.daysLeft;
    })
    .slice(0, 8);

  if (echeances.length === 0) return null;

  return (
    <div className="partner-alerts-section">
      <div className="partner-alerts-section-title">
        <i className="bi bi-calendar-event" />
        Prochaines échéances ({echeances.length})
      </div>

      <div className="partner-alerts-echeances-grid">
        {echeances.map((echeance) => (
          <div
            key={echeance.id}
            className={`partner-alerts-echeance-card ${echeance.severity}`}
          >
            <div className="partner-alerts-echeance-title">
              {echeance.title}
            </div>
            <div className="partner-alerts-echeance-date">
              <i className="bi bi-calendar3" />
              {formatDateTime(echeance.expiresAt, 'DD/MM/YYYY')}
            </div>
            <div className="partner-alerts-echeance-date" style={{ marginTop: '0.25rem' }}>
              <span className={`partner-alerts-echeance-days ${getDaysClass(echeance.daysLeft)}`}>
                {echeance.expiryLabel}
              </span>
            </div>
            {echeance.entityLabel && (
              <div
                className="partner-alert-entity-link"
                style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}
              >
                {echeance.entityLabel.length > 30
                  ? `${echeance.entityLabel.substring(0, 30)}...`
                  : echeance.entityLabel}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartnerAlertEcheances;
