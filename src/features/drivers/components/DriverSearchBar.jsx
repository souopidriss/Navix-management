/**
 * Navix Drivers — DriverSearchBar
 * --------------------------------------------------------------------------
 * Recherche instantanée par nom, prénom, téléphone, email, code employé ou
 * numéro de permis. Champ contrôlé connecté au store ; bouton d'effacement
 * visible dès qu'une saisie existe.
 *
 * Props :
 *   value       : valeur de recherche (contrôlée)
 *   onChange    : (value: string) => void
 *   resultCount : nombre de résultats affichés (optionnel)
 *   placeholder : texte indicatif
 *   id          : identifiant du champ
 */
import { Button } from '@/components/ui';
import './DriverSearchBar.css';

const DriverSearchBar = ({
  value,
  onChange,
  resultCount,
  placeholder = 'Rechercher par nom, prénom, téléphone, email, code ou permis…',
  id = 'driver-search',
}) => (
  <div className="navix-driver-search">
    <div className="input-group">
      <span className="input-group-text" aria-hidden="true">
        <i className="bi bi-search" />
      </span>
      <label htmlFor={id} className="visually-hidden">
        Rechercher un chauffeur
      </label>
      <input
        id={id}
        type="search"
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
      {value && (
        <Button variant="ghost" icon="bi-x-lg" onClick={() => onChange('')} aria-label="Effacer la recherche">
          <span className="visually-hidden">Effacer la recherche</span>
        </Button>
      )}
    </div>
    {typeof resultCount === 'number' && (
      <span className="navix-driver-search__count" aria-live="polite">
        {resultCount} résultat{resultCount > 1 ? 's' : ''}
      </span>
    )}
  </div>
);

export default DriverSearchBar;
