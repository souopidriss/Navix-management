/**
 * Navix Fuel — DeleteFuelModal
 * --------------------------------------------------------------------------
 * Modale de confirmation de suppression d'un plein, construite sur le
 * DeleteModal générique de la bibliothèque core (focus initial, Échap,
 * arrière-plan cliquable, verrouillage du scroll).
 *
 * Props :
 *   fuel      : plein à supprimer (null = modale fermée)
 *   open      : booléen — ouvre la modale
 *   loading   : booléen — suppression en cours (désactive les boutons)
 *   error     : message d'erreur (optionnel)
 *   onConfirm : () => void — confirme la suppression
 *   onClose   : () => void — ferme la modale
 */
import { DeleteModal } from '@/components/core';

const DeleteFuelModal = ({ fuel, open, loading, error, onConfirm, onClose }) => (
  <DeleteModal
    open={open}
    onClose={onClose}
    entityName={fuel ? `le plein ${fuel.fuelNumber}` : undefined}
    loading={loading}
    error={error}
    onConfirm={onConfirm}
  />
);

export default DeleteFuelModal;
