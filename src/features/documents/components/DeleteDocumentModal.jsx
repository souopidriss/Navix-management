/**
 * Navix Documents — DeleteDocumentModal
 * --------------------------------------------------------------------------
 * Confirmation de suppression d'un document (wrapper du DeleteModal
 * générique). Le document à supprimer est transmis par la page.
 *
 * Props :
 *   document : document ciblé (ou null si aucune suppression en cours)
 *   open     : booléen
 *   loading  : booléen — suppression en cours
 *   error    : message d'erreur éventuel
 *   onConfirm : () => void
 *   onClose   : () => void
 */
import { DeleteModal } from '@/components/core';

const DeleteDocumentModal = ({ document, open, loading = false, error, onConfirm, onClose }) => (
  <DeleteModal
    open={open}
    onClose={onClose}
    entityName={document?.name ?? 'document'}
    title="Supprimer le document"
    message="Le document sera définitivement supprimé. Cette action est irréversible."
    confirmLabel="Supprimer"
    loading={loading}
    error={error}
    onConfirm={onConfirm}
  />
);

export default DeleteDocumentModal;
