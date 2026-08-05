/**
 * Navix Agencies — DeleteAgencyModal
 * --------------------------------------------------------------------------
 * Modale de confirmation de suppression d'une agence, construite sur le
 * DeleteModal générique de la bibliothèque core (focus initial, Échap,
 * arrière-plan cliquable, verrouillage du scroll).
 *
 * Props :
 *   agency   : agence à supprimer (null = modale fermée)
 *   open     : booléen — ouvre la modale
 *   loading  : booléen — suppression en cours (désactive les boutons)
 *   error    : message d'erreur (optionnel)
 *   onConfirm : () => void — confirme la suppression
 *   onClose  : () => void — ferme la modale
 */
import { DeleteModal } from '@/components/core';

const DeleteAgencyModal = ({ agency, open, loading, error, onConfirm, onClose }) => (
  <DeleteModal
    open={open}
    onClose={onClose}
    title="Supprimer l’agence"
    entityName={agency ? `l’agence ${agency.name}` : undefined}
    loading={loading}
    error={error}
    onConfirm={onConfirm}
  />
);

export default DeleteAgencyModal;
