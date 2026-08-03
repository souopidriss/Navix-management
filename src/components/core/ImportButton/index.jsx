/**
 * Navix Core — ImportButton (architecture)
 * --------------------------------------------------------------------------
 * Bouton d'import générique : déclenche un sélecteur de fichiers masqué puis
 * restitue les fichiers locaux via `onImport(files)` / `onChange`. Aucune
 * analyse ni envoi réseau — le traitement (parsing CSV/Excel, upload) reste
 * à la charge du module.
 *
 * Props :
 *   accept     : types acceptés, ex. '.csv,.xlsx'
 *   multiple   : booléen — plusieurs fichiers               (défaut : true)
 *   label      : libellé du bouton                          (défaut : 'Importer')
 *   icon       : icône du bouton                            (défaut : 'bi-upload')
 *   loading    : booléen — import en cours
 *   disabled   : booléen
 *   onImport   : (files: File[]) => void — fichiers sélectionnés
 *   onChange   : alias de onImport (compatibilité)
 *   variant    : variante du bouton                         (défaut : 'outline')
 *   size       : taille du bouton                           (défaut : 'md')
 *   className  : classes additionnelles
 *
 * Exemple :
 *   <ImportButton accept=".csv,.xlsx" onImport={(files) => parseImport(files)} />
 */
import { memo, useRef } from 'react';
import { Button } from '@/components/ui';

const ImportButton = ({
  accept,
  multiple = true,
  label = 'Importer',
  icon = 'bi-upload',
  loading = false,
  disabled = false,
  onImport,
  onChange,
  variant = 'outline',
  size = 'md',
  className,
  ...rest
}) => {
  const inputRef = useRef(null);
  const handleChange = (files) => {
    const handler = onImport || onChange;
    handler?.(Array.from(files || []));
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        icon={icon}
        loading={loading}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={className}
        {...rest}
      >
        {label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="visually-hidden"
        tabIndex={-1}
        onChange={(event) => handleChange(event.target.files)}
      />
    </>
  );
};

export default memo(ImportButton);
