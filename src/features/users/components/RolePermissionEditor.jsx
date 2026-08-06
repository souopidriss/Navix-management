/**
 * Navix Users — RolePermissionEditor
 * --------------------------------------------------------------------------
 * Éditeur de permissions d'un rôle : cases à cocher groupées par module
 * (légende du module), sélection / désélection globale et par module, et
 * signalement des permissions sensibles. Composant contrôlé — l'état vit dans
 * le parent (RoleDetailsPage).
 *
 * Props :
 *   modules   : codes de module ordonnés
 *   groups    : Record<module, Array<permission>>
 *   selected  : codes de permission sélectionnés
 *   onChange  : (selected: string[]) => void
 *   readOnly  : booléen — rôle super admin (accès complet, non éditable)
 */
import { Button, Badge } from '@/components/ui';
import { getPermissionModule } from '../constants';
import './RolePermissionEditor.css';

const RolePermissionEditor = ({ modules = [], groups = {}, selected = [], onChange, readOnly = false }) => {
  const selectedSet = new Set(selected);

  const toggleAll = () => {
    const allCodes = modules.flatMap((module) => (groups[module] ?? []).map((permission) => permission.code));
    onChange(selectedSet.size === allCodes.length && allCodes.length > 0 ? [] : allCodes);
  };

  const toggleModule = (module) => {
    const codes = (groups[module] ?? []).map((permission) => permission.code);
    const allInModule = codes.every((code) => selectedSet.has(code));
    const next = new Set(selectedSet);
    codes.forEach((code) => (allInModule ? next.delete(code) : next.add(code)));
    onChange(Array.from(next));
  };

  const togglePermission = (code) => {
    const next = new Set(selectedSet);
    if (next.has(code)) {
      next.delete(code);
    } else {
      next.add(code);
    }
    onChange(Array.from(next));
  };

  if (readOnly) {
    return (
      <div className="alert alert-secondary navix-role-permission-editor__readonly mb-0">
        <i className="bi bi-shield-lock me-2" aria-hidden="true" />
        Accès complet : ce rôle dispose de toutes les permissions (super administrateur).
      </div>
    );
  }

  return (
    <div className="navix-role-permission-editor">
      <div className="navix-role-permission-editor__actions">
        <Button variant="outline" size="sm" icon="bi-check-all" onClick={toggleAll}>
          Tout cocher
        </Button>
        <Button variant="outline" size="sm" icon="bi-x-square" onClick={() => onChange([])}>
          Tout décocher
        </Button>
      </div>

      {modules.map((module) => {
        const permissions = groups[module] ?? [];
        if (permissions.length === 0) return null;
        const moduleMeta = getPermissionModule(module);
        const moduleCodes = permissions.map((permission) => permission.code);
        const allSelected = moduleCodes.every((code) => selectedSet.has(code));

        return (
          <section className="navix-role-permission-editor__group" key={module}>
            <header className="navix-role-permission-editor__group-header">
              <span className="navix-role-permission-editor__group-title">
                {moduleMeta.icon && <i className={`bi ${moduleMeta.icon} me-2`} aria-hidden="true" />}
                {moduleMeta.label}
              </span>
              <Button variant="link" size="sm" onClick={() => toggleModule(module)}>
                {allSelected ? 'Tout décocher' : 'Tout cocher'}
              </Button>
            </header>

            <div className="navix-role-permission-editor__grid">
              {permissions.map((permission) => (
                <div className="form-check navix-role-permission-editor__permission" key={permission.code}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`permission-${permission.code}`}
                    checked={selectedSet.has(permission.code)}
                    onChange={() => togglePermission(permission.code)}
                    aria-label={permission.name}
                  />
                  <label
                    className="form-check-label d-flex align-items-center gap-1"
                    htmlFor={`permission-${permission.code}`}
                    title={permission.description}
                  >
                    <span>{permission.name}</span>
                    {permission.isSensitive && <Badge variant="danger" soft size="sm">Sensible</Badge>}
                  </label>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default RolePermissionEditor;
