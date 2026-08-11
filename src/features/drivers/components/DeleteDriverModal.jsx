/**
 * Navix Drivers — DeleteDriverModal
 * --------------------------------------------------------------------------
 * Modale de confirmation de suppression d'un chauffeur. Construite sur le
 * DeleteModal générique de la bibliothèque core (backdrop, Échap, scroll
 * lock, focus initial gérés par ConfirmDialog).
 *
 * Props :
 *   driver    : chauffeur à supprimer (null = modale fermée)
 *   open      : booléen — ouvre la modale
 *   loading   : booléen — suppression en cours (désactive les boutons)
 *   error     : message d'erreur (optionnel)
 *   onConfirm : () => void — confirme la suppression
 *   onClose   : () => void — ferme la modale
 */
import { DeleteModal } from '@/components/core';

const DeleteDriverModal = ({ driver, open, loading, error, onConfirm, onClose }) => (
  <DeleteModal
    open={open}
    onClose={onClose}
    title="Supprimer le chauffeur"
    entityName={driver ? `${driver.fullName} (${driver.employeeCode})` : ''}
    loading={loading}
    error={error}
    onConfirm={onConfirm}
  />
);

export default DeleteDriverModal;
