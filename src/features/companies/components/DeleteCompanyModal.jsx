/**
 * Navix Companies — DeleteCompanyModal
 * --------------------------------------------------------------------------
 * Modale de confirmation de suppression d'une entreprise. Construite sur le
 * DeleteModal générique de la bibliothèque core (backdrop, Échap, scroll
 * lock, focus initial gérés par ConfirmDialog). Le message rappelle la
 * suppression des données associées.
 *
 * Props :
 *   company   : entreprise à supprimer (null = modale fermée)
 *   open      : booléen — ouvre la modale
 *   loading   : booléen — suppression en cours (désactive les boutons)
 *   error     : message d'erreur (optionnel)
 *   onConfirm : () => void — confirme la suppression
 *   onClose   : () => void — ferme la modale
 */
import { DeleteModal } from '@/components/core';

const DeleteCompanyModal = ({ company, open, loading, error, onConfirm, onClose }) => (
  <DeleteModal
    open={open}
    onClose={onClose}
    title="Supprimer l’entreprise"
    entityName={company?.name}
    message={
      company
        ? `Voulez-vous vraiment supprimer ${company.name} ? Cette action est irréversible et supprimera également les données associées.`
        : undefined
    }
    loading={loading}
    error={error}
    onConfirm={onConfirm}
  />
);

export default DeleteCompanyModal;
