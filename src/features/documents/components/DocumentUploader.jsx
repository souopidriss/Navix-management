/**
 * Navix Documents — DocumentUploader
 * --------------------------------------------------------------------------
 * Zone de sélection des fichiers d'un document, construite sur le
 * FileUploader générique (drag & drop). La validation locale vérifie
 * l'extension, le type MIME et la taille maximale définis par le type de
 * fichier choisi — le service applique ensuite les mêmes règles.
 *
 * Props :
 *   files    : File[] en attente de téléversement
 *   onChange : (files: File[]) => void
 *   fileType : type de fichier sélectionné (limites de validation) ou null
 *   error    : message d'erreur global éventuel
 */
import { FileUploader } from '@/components/core';
import { getFileExtension } from '../schemas';
import { formatDocumentSize } from '../constants';

const DocumentUploader = ({ files = [], onChange, fileType = null, error }) => {
  const validateFile = (file) => {
    const extension = getFileExtension(file.name);
    if (!extension) {
      return 'Impossible de déterminer l’extension du fichier.';
    }
    if (fileType && fileType.extensions.length > 0 && !fileType.extensions.includes(extension)) {
      return `Extension ${extension} non autorisée pour le type ${fileType.title}.`;
    }
    if (fileType && file.type && fileType.mimeTypes.length > 0) {
      const mime = String(file.type).toLowerCase();
      if (!fileType.mimeTypes.includes(mime)) {
        return `Type MIME « ${file.type} » non autorisé pour le type ${fileType.title}.`;
      }
    }
    if (fileType && Number(file.size) > Number(fileType.maxSize)) {
      return `« ${file.name} » dépasse la taille maximale de ${formatDocumentSize(fileType.maxSize)}.`;
    }
    return null;
  };

  const maxSize = fileType?.maxSize;
  const accept = fileType?.extensions?.length ? fileType.extensions.join(',') : undefined;

  return (
    <FileUploader
      label="Glissez-déposez vos fichiers"
      hint={
        fileType
          ? `Extensions acceptées : ${fileType.extensions.join(', ')} · Taille max : ${formatDocumentSize(fileType.maxSize)}.`
          : 'Sélectionnez d’abord un type de fichier.'
      }
      accept={accept}
      maxSize={maxSize}
      multiple
      value={files}
      onChange={onChange}
      validate={validateFile}
      disabled={!fileType}
      error={error}
    />
  );
};

export default DocumentUploader;
