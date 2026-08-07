/**
 * Navix Audit — AuditMetadataViewer
 * --------------------------------------------------------------------------
 * Affiche les métadonnées techniques d'une entrée (session, appareil,
 * montants, fichiers…). Réservé aux profils disposant de `audit.viewSensitive` :
 * sans cette permission, les valeurs sont masquées (aucune donnée sensible
 * n'est jamais révélée côté client).
 *
 * Props :
 *   metadata  : objet clé → valeur (ou null)
 *   sensitive : booléen — masquer les valeurs si non autorisé
 */
import { formatAuditValue } from '../constants';
import './AuditMetadataViewer.css';

const MASK = '••••••••';

const AuditMetadataViewer = ({ metadata, sensitive = false }) => {
  if (!metadata || Object.keys(metadata).length === 0) {
    return <p className="navix-audit-metadata__empty text-muted mb-0">Aucune métadonnée enregistrée.</p>;
  }

  return (
    <table className="table table-sm navix-audit-metadata mb-0">
      <thead>
        <tr>
          <th scope="col" className="navix-audit-metadata__key">Clé</th>
          <th scope="col">Valeur</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(metadata).map(([key, value]) => (
          <tr key={key}>
            <td>
              <code className="navix-audit-metadata__code">{key}</code>
            </td>
            <td className="navix-audit-metadata__value">
              {sensitive ? (
                <span aria-label={`Métadonnée masquée (${key})`}>{MASK}</span>
              ) : (
                <span className="navix-audit-metadata__formatted">{formatAuditValue(value)}</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AuditMetadataViewer;
