/**
 * Navix Trips — DeleteTripModal
 * --------------------------------------------------------------------------
 * Modale de confirmation de suppression d'un trajet. Construite sur le
 * DeleteModal générique de la bibliothèque core (backdrop, Échap, scroll
 * lock, focus initial gérés par ConfirmDialog).
 *
 * Props :
 *   trip      : trajet à supprimer (null = modale fermée)
 *   open      : booléen — ouvre la modale
 *   loading   : booléen — suppression en cours (désactive les boutons)
 *   error     : message d'erreur (optionnel)
 *   onConfirm : () => void — confirme la suppression
 *   onClose   : () => void — ferme la modale
 */
import { DeleteModal } from '@/components/core';

const DeleteTripModal = ({ trip, open, loading, error, onConfirm, onClose }) => (
  <DeleteModal
    open={open}
    onClose={onClose}
    title="Supprimer le trajet"
    entityName={trip?.tripNumber}
    loading={loading}
    error={error}
    onConfirm={onConfirm}
  />
);

export default DeleteTripModal;
