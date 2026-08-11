/**
 * Navix Assignments — DeleteAssignmentModal
 * --------------------------------------------------------------------------
 * Modale de confirmation de suppression d'une affectation. Construite sur le
 * DeleteModal générique de la bibliothèque core (backdrop, Échap, scroll
 * lock, focus initial gérés par ConfirmDialog).
 *
 * Props :
 *   assignment : affectation à supprimer (null = modale fermée)
 *   open       : booléen — ouvre la modale
 *   loading    : booléen — suppression en cours (désactive les boutons)
 *   error      : message d'erreur (optionnel)
 *   onConfirm  : () => void — confirme la suppression
 *   onClose    : () => void — ferme la modale
 */
import { DeleteModal } from '@/components/core';

const DeleteAssignmentModal = ({ assignment, open, loading, error, onConfirm, onClose }) => (
  <DeleteModal
    open={open}
    onClose={onClose}
    title="Supprimer l’affectation"
    entityName={assignment?.assignmentNumber}
    loading={loading}
    error={error}
    onConfirm={onConfirm}
  />
);

export default DeleteAssignmentModal;
