/**
 * Navix Partners — DeletePartnerModal
 * --------------------------------------------------------------------------
 * Boîte de confirmation de suppression d'un partenaire, construite sur le
 * DeleteModal core (libellé, liste des points de suppression, annulation).
 *
 * Props :
 *   open       : booléen — modal visible
 *   partner    : partenaire à supprimer (ou null)
 *   loading    : booléen — envoi en cours
 *   error      : message d'erreur éventuel
 *   onConfirm  : () => void
 *   onClose    : () => void
 */
import { DeleteModal } from '@/components/core';

const DeletePartnerModal = ({ open, partner, loading, error, onConfirm, onClose }) => {
  if (!partner) return null;

  return (
    <DeleteModal
      open={open}
      onClose={onClose}
      entityName={`${partner.name} (${partner.code})`}
      title="Supprimer ce partenaire ?"
      confirmLabel="Supprimer"
      loading={loading}
      error={error}
      onConfirm={onConfirm}
    />
  );
};

export default DeletePartnerModal;
