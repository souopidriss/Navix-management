/**
 * Navix Maintenance — DeleteMaintenanceModal
 * --------------------------------------------------------------------------
 * Modale de confirmation de suppression d'un entretien, construite sur le
 * DeleteModal générique de la bibliothèque core (focus initial, Échap,
 * arrière-plan cliquable, verrouillage du scroll).
 *
 * Props :
 *   maintenance : entretien à supprimer (null = modale fermée)
 *   open        : booléen — ouvre la modale
 *   loading     : booléen — suppression en cours (désactive les boutons)
 *   error       : message d'erreur (optionnel)
 *   onConfirm   : () => void — confirme la suppression
 *   onClose     : () => void — ferme la modale
 */
import { DeleteModal } from '@/components/core';

const DeleteMaintenanceModal = ({ maintenance, open, loading, error, onConfirm, onClose }) => (
  <DeleteModal
    open={open}
    onClose={onClose}
    entityName={maintenance ? `l'entretien ${maintenance.maintenanceNumber}` : undefined}
    loading={loading}
    error={error}
    onConfirm={onConfirm}
  />
);

export default DeleteMaintenanceModal;
