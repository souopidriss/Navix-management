/**
 * Navix Vehicles — DeleteVehicleModal
 * --------------------------------------------------------------------------
 * Modale de confirmation de suppression d'un véhicule. Construite sur le
 * DeleteModal générique de la bibliothèque core (backdrop, Échap, scroll
 * lock, focus initial gérés par ConfirmDialog).
 *
 * Props :
 *   vehicle   : véhicule à supprimer (null = modale fermée)
 *   open      : booléen — ouvre la modale
 *   loading   : booléen — suppression en cours (désactive les boutons)
 *   error     : message d'erreur (optionnel)
 *   onConfirm : () => void — confirme la suppression
 *   onClose   : () => void — ferme la modale
 */
import { DeleteModal } from '@/components/core';

const DeleteVehicleModal = ({ vehicle, open, loading, error, onConfirm, onClose }) => (
  <DeleteModal
    open={open}
    onClose={onClose}
    title="Supprimer le véhicule"
    entityName={vehicle ? `${vehicle.registrationNumber} (${vehicle.brand} ${vehicle.model})` : ''}
    loading={loading}
    error={error}
    onConfirm={onConfirm}
  />
);

export default DeleteVehicleModal;
