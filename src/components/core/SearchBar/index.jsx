/**
 * Navix Core — SearchBar
 * --------------------------------------------------------------------------
 * Champ de recherche générique : icône, effacement, compteur de résultats et
 * debounce configurable. Composant contrôlé (value + onChange) ; `onChange`
 * est déclenché une fois la saisie stabilisée pendant `debounce` ms.
 *
 * Props :
 *   value       : valeur de recherche (contrôlée)
 *   onChange    : (value: string) => void — appelé après debounce
 *   debounce    : délai en millisecondes                     (défaut : 300)
 *   placeholder : texte indicatif
 *   label       : libellé accessible du champ                 (défaut : 'Rechercher')
 *   id          : identifiant du champ
 *   icon        : classe d'icône Bootstrap Icons              (défaut : 'bi-search')
 *   resultCount : nombre de résultats affichés (optionnel)
 *   className   : classes additionnelles
 *   ...rest     : autres attributs transmis à l'input (aria-*, etc.)
 *
 * Exemple :
 *   <SearchBar value={search} onChange={setSearch} resultCount={totalItems}
 *              placeholder="Rechercher une immatriculation…" />
 */
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { useDebounce } from '@/hooks';
import './SearchBar.css';

const SearchBar = ({
  value,
  onChange,
  debounce = 300,
  placeholder = 'Rechercher…',
  label = 'Rechercher',
  id = 'navix-search',
  icon = 'bi-search',
  resultCount,
  className,
  ...rest
}) => {
  const [text, setText] = useState(value ?? '');
  const onChangeRef = useRef(onChange);
  const debouncedText = useDebounce(text, debounce);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onChangeRef.current?.(debouncedText);
  }, [debouncedText]);

  useEffect(() => {
    setText((current) => (current === value ? current : (value ?? '')));
  }, [value]);

  return (
    <div className={`navix-searchbar ${className || ''}`.trim()}>
      <div className="input-group">
        <span className="input-group-text" aria-hidden="true">
          <i className={`bi ${icon}`} />
        </span>
        <label htmlFor={id} className="visually-hidden">
          {label}
        </label>
        <input
          id={id}
          type="search"
          className="form-control"
          placeholder={placeholder}
          value={text}
          onChange={(event) => setText(event.target.value)}
          autoComplete="off"
          {...rest}
        />
        {text && (
          <Button variant="ghost" icon="bi-x-lg" onClick={() => setText('')} aria-label="Effacer la recherche">
            <span className="visually-hidden">Effacer la recherche</span>
          </Button>
        )}
      </div>
      {typeof resultCount === 'number' && (
        <span className="navix-searchbar__count" aria-live="polite">
          {resultCount} résultat{resultCount > 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

export default SearchBar;
