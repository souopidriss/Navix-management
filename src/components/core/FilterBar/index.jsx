/**
 * Navix Core — FilterBar
 * --------------------------------------------------------------------------
 * Barre de filtres générique et 100 % déclarative. Chaque champ est décrit
 * par un objet `field` ; la valeur courante vit dans `values` (objet clé →
 * valeur) et `onChange(key, value)` restitue les changements. Aucun métier.
 *
 * Types de champ (field.type) :
 *   select   → <select> natif       (options, allLabel)
 *   multi    → multi-sélection      (options, placeholder) — valeur : tableau
 *   text     → champ texte          (placeholder)
 *   date     → champ date           (min, max)
 *   checkbox → case à cocher        (label) — valeur : booléen
 *
 * Props :
 *   fields           : tableau de descripteurs
 *                      [{ key, type, label, options?, allLabel?, placeholder?, min?, max? }]
 *   values           : { [key]: valeur }
 *   onChange         : (key: string, value: any) => void
 *   onReset          : () => void — réinitialise tous les filtres
 *   hasActiveFilters : booléen — affiche le bouton « Réinitialiser »
 *   resetLabel       : libellé du bouton de réinitialisation   (défaut : 'Réinitialiser')
 *   className        : classes additionnelles
 *
 * Exemple :
 *   <FilterBar
 *     fields={[
 *       { key: 'status', type: 'select', label: 'Statut',
 *         options: STATUS_OPTIONS, allLabel: 'Tous les statuts' },
 *       { key: 'tags', type: 'multi', label: 'Étiquettes',
 *         options: TAG_OPTIONS, placeholder: 'Étiquettes…' },
 *       { key: 'createdAt', type: 'date', label: 'Créé le' },
 *     ]}
 *     values={filters}
 *     onChange={setFilter}
 *     onReset={resetFilters}
 *     hasActiveFilters={hasActiveFilters}
 *   />
 */
import { useRef, useState } from 'react';
import { Button } from '@/components/ui';
import useClickOutside from '../_shared/useClickOutside';
import './FilterBar.css';

const toOptions = (options = []) => options.filter((option) => option.value !== '' && option.value !== undefined);

const SelectField = ({ id, label, value, onChange, options = [], allLabel = 'Tous' }) => (
  <div className="navix-filterbar__field">
    <label htmlFor={id} className="visually-hidden">
      {label}
    </label>
    <select id={id} className="form-select" value={value ?? ''} onChange={(event) => onChange(event.target.value)}>
      <option value="">{allLabel}</option>
      {toOptions(options).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const TextField = ({ id, label, value, onChange, placeholder }) => (
  <div className="navix-filterbar__field">
    <label htmlFor={id} className="visually-hidden">
      {label}
    </label>
    <input
      id={id}
      type="text"
      className="form-control"
      placeholder={placeholder || label}
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      autoComplete="off"
    />
  </div>
);

const DateField = ({ id, label, value, onChange, min, max }) => (
  <div className="navix-filterbar__field">
    <label htmlFor={id} className="visually-hidden">
      {label}
    </label>
    <input
      id={id}
      type="date"
      className="form-control"
      value={value ?? ''}
      min={min}
      max={max}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);

const CheckboxField = ({ id, label, value, onChange }) => (
  <div className="navix-filterbar__field navix-filterbar__field--checkbox">
    <input
      id={id}
      type="checkbox"
      className="form-check-input"
      checked={Boolean(value)}
      onChange={(event) => onChange(event.target.checked)}
    />
    <label htmlFor={id} className="form-check-label">
      {label}
    </label>
  </div>
);

const MultiSelect = ({ id, label, value = [], onChange, options = [], placeholder = 'Sélectionner…' }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useClickOutside(containerRef, () => setOpen(false), open);

  const available = toOptions(options);
  const allSelected = available.length > 0 && available.every((option) => value.includes(option.value));
  const count = value.length;

  const toggleOption = (optionValue) => {
    const next = value.includes(optionValue)
      ? value.filter((item) => item !== optionValue)
      : [...value, optionValue];
    onChange(next);
  };

  const toggleAll = () => {
    onChange(allSelected ? [] : available.map((option) => option.value));
  };

  return (
    <div className="navix-filterbar__field" ref={containerRef}>
      <label id={`${id}-label`} className="visually-hidden">
        {label}
      </label>
      <button
        type="button"
        id={id}
        className="form-select navix-filterbar__multi"
        aria-labelledby={`${id}-label`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="navix-filterbar__multi-summary">
          {count === 0 ? placeholder : `${count} sélectionné${count > 1 ? 's' : ''}`}
        </span>
        <i className={`bi ${open ? 'bi-chevron-up' : 'bi-chevron-down'}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="navix-filterbar__multi-panel" role="listbox" aria-multiselectable="true" aria-labelledby={`${id}-label`}>
          {available.length > 0 && (
            <label className="navix-filterbar__multi-option navix-filterbar__multi-option--all">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              <span>Tout sélectionner</span>
            </label>
          )}
          {available.map((option) => {
            const selected = value.includes(option.value);
            return (
              <label
                key={option.value}
                className="navix-filterbar__multi-option"
                role="option"
                aria-selected={selected}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleOption(option.value)}
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

const FilterField = ({ field, value, onChange }) => {
  switch (field.type) {
    case 'multi':
      return (
        <MultiSelect
          id={field.key}
          label={field.label}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
          options={field.options}
          placeholder={field.placeholder}
        />
      );
    case 'text':
      return <TextField id={field.key} label={field.label} value={value} onChange={onChange} placeholder={field.placeholder} />;
    case 'date':
      return <DateField id={field.key} label={field.label} value={value} onChange={onChange} min={field.min} max={field.max} />;
    case 'checkbox':
      return <CheckboxField id={field.key} label={field.label} value={value} onChange={onChange} />;
    case 'select':
    default:
      return (
        <SelectField
          id={field.key}
          label={field.label}
          value={value}
          onChange={onChange}
          options={field.options}
          allLabel={field.allLabel}
        />
      );
  }
};

const FilterBar = ({
  fields = [],
  values = {},
  onChange,
  onReset,
  hasActiveFilters = false,
  resetLabel = 'Réinitialiser',
  className,
  ...rest
}) => (
  <div className={`navix-filterbar ${className || ''}`.trim()} {...rest}>
    <div className="navix-filterbar__fields">
      {fields.map((field) => (
        <FilterField
          key={field.key}
          field={field}
          value={values[field.key]}
          onChange={(value) => onChange?.(field.key, value)}
        />
      ))}
    </div>
    {hasActiveFilters && onReset && (
      <Button variant="ghost" size="sm" icon="bi-arrow-counterclockwise" onClick={onReset}>
        {resetLabel}
      </Button>
    )}
  </div>
);

export default FilterBar;
