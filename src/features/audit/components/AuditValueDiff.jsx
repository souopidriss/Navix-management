/**
 * Navix Audit — AuditValueDiff
 * --------------------------------------------------------------------------
 * Ligne de différence « avant → après » pour une clé donnée d'un
 * changement (oldValues / newValues). Les objets sont affichés en JSON
 * préformaté via `formatAuditValue`.
 *
 * Props :
 *   field : nom de la clé
 *   oldValue : valeur avant (peut être undefined)
 *   newValue : valeur après (peut être undefined)
 */
import { formatAuditValue } from '../constants';

const AuditValueDiff = ({ field, oldValue, newValue }) => (
  <div className="navix-audit-diff__row">
    <div className="navix-audit-diff__field">{field}</div>
    <div className="navix-audit-diff__cell navix-audit-diff__cell--old">
      {formatAuditValue(oldValue)}
    </div>
    <div className="navix-audit-diff__arrow" aria-hidden="true">
      <i className="bi bi-arrow-right" />
    </div>
    <div className="navix-audit-diff__cell navix-audit-diff__cell--new">
      {formatAuditValue(newValue)}
    </div>
  </div>
);

export default AuditValueDiff;
