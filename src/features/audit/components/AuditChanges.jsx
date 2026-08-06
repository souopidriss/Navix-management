/**
 * Navix Audit — AuditChanges
 * --------------------------------------------------------------------------
 * Section de comparaison des modifications d'une entrée : liste « avant →
 * après » construite depuis oldValues / newValues. L'ordre des champs suit
 * oldValues puis les clés ajoutées de newValues. Immuable : lecture seule.
 *
 * Props :
 *   oldValues : objet des valeurs avant (ou null)
 *   newValues : objet des valeurs après (ou null)
 */
import AuditValueDiff from './AuditValueDiff';
import './AuditChanges.css';

const AuditChanges = ({ oldValues, newValues }) => {
  const hasOld = oldValues && typeof oldValues === 'object' && Object.keys(oldValues).length > 0;
  const hasNew = newValues && typeof newValues === 'object' && Object.keys(newValues).length > 0;

  if (!hasOld && !hasNew) {
    return (
      <div className="navix-audit-changes">
        <h2 className="navix-audit-changes__title">Modifications</h2>
        <p className="navix-audit-changes__empty text-muted mb-0">
          Aucun changement détaillé n'a été enregistré pour cette action.
        </p>
      </div>
    );
  }

  const keys = Array.from(
    new Set([...(hasOld ? Object.keys(oldValues) : []), ...(hasNew ? Object.keys(newValues) : [])]),
  );

  return (
    <div className="navix-audit-changes">
      <h2 className="navix-audit-changes__title">Modifications</h2>
      <div className="navix-audit-changes__diff">
        {keys.map((field) => (
          <AuditValueDiff
            key={field}
            field={field}
            oldValue={hasOld ? oldValues[field] : undefined}
            newValue={hasNew ? newValues[field] : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default AuditChanges;
