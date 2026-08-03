/**
 * Navix Core — FileUploader (architecture)
 * --------------------------------------------------------------------------
 * Zone de dépôt de fichiers générique : drag & drop, sélection par bouton,
 * validation (accept, taille max, validateur personnalisé) et aperçu des
 * images. Le backend n'existe pas encore : aucun envoi réseau — le
 * composant restitue les fichiers locaux validés via `onChange`.
 *
 * Props :
 *   name       : nom du champ (attribut HTML)
 *   label      : libellé de la zone              (défaut : 'Glissez-déposez un fichier')
 *   hint       : texte d'aide (types acceptés, taille…)
 *   accept     : types acceptés, ex. '.jpg,.png,image/*'
 *   multiple   : booléen — plusieurs fichiers    (défaut : true)
 *   maxSize    : taille maximale en octets
 *   value      : fichiers sélectionnés (File[])
 *   onChange   : (files: File[]) => void — fichiers validés
 *   validate   : (file: File) => string | null — message d'erreur si refusé
 *   preview    : booléen — aperçu des images via ImagePreview (défaut : true)
 *   disabled   : booléen
 *   error      : message d'erreur externe (optionnel)
 *   className  : classes additionnelles
 *
 * Exemple :
 *   <FileUploader
 *     accept="image/*"
 *     maxSize={2 * 1024 * 1024}
 *     value={photos}
 *     onChange={setPhotos}
 *     hint="JPG ou PNG, 2 Mo max."
 *   />
 */
import { useRef, useState } from 'react';
import { Button } from '@/components/ui';
import ImagePreview from '../ImagePreview';
import './FileUploader.css';

const matchesAccept = (file, accept = '') => {
  const rules = accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);

  if (rules.length === 0) return true;

  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();

  return rules.some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule);
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
};

const FileUploader = ({
  name,
  label = 'Glissez-déposez un fichier',
  hint,
  accept,
  multiple = true,
  maxSize,
  value = [],
  onChange,
  validate,
  preview = true,
  disabled = false,
  error,
  className,
}) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [internalError, setInternalError] = useState('');

  const processFiles = (files) => {
    const incoming = Array.from(files || []);
    const valid = [];
    const invalid = [];

    incoming.forEach((file) => {
      const reason =
        (accept && !matchesAccept(file, accept) ? `Type non accepté : ${file.name}.` : '') ||
        (maxSize && file.size > maxSize ? `Fichier trop volumineux : ${file.name}.` : '') ||
        (validate ? validate(file) : null);

      if (reason) invalid.push(reason);
      else valid.push(file);
    });

    if (invalid.length > 0) setInternalError(invalid.join(' '));
    else setInternalError('');

    if (valid.length > 0) onChange?.([...(multiple ? value : []), ...valid]);
  };

  const isImage = (file) => file?.type?.startsWith('image/');

  return (
    <div className={`navix-uploader ${className || ''}`.trim()}>
      <div
        className={`navix-uploader__drop ${dragOver ? 'navix-uploader__drop--over' : ''}`.trim()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (!disabled) processFiles(event.dataTransfer.files);
        }}
      >
        <i className="bi bi-cloud-arrow-up navix-uploader__icon" aria-hidden="true" />
        <span className="navix-uploader__label">{label}</span>
        <span className="navix-uploader__action">
          <Button variant="outline" size="sm" icon="bi-folder2-open" disabled={disabled}>
            Parcourir
          </Button>
        </span>
        {hint && <span className="navix-uploader__hint">{hint}</span>}
      </div>

      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        multiple={multiple}
        className="visually-hidden"
        tabIndex={-1}
        onChange={(event) => {
          processFiles(event.target.files);
          event.target.value = '';
        }}
      />

      {(internalError || error) && (
        <p className="navix-uploader__error" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-1" aria-hidden="true" />
          {internalError || error}
        </p>
      )}

      {preview && value.length > 0 && (
        <ul className="navix-uploader__preview">
          {value.map((file, index) => (
            <li key={`${file.name}-${index}`} className="navix-uploader__file">
              {isImage(file) ? (
                <ImagePreview src={file} alt={file.name} rounded />
              ) : (
                <span className="navix-uploader__file-icon" aria-hidden="true">
                  <i className="bi bi-file-earmark" />
                </span>
              )}
              <span className="navix-uploader__file-meta">
                <span className="navix-uploader__file-name">{file.name}</span>
                <span className="navix-uploader__file-size">
                  {(file.size / 1024).toFixed(1)} Ko
                </span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                icon="bi-x-lg"
                aria-label={`Retirer ${file.name}`}
                onClick={() => onChange?.(value.filter((_, itemIndex) => itemIndex !== index))}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;
