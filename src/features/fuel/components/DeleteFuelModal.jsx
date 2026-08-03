/**
 * Navix Fuel — DeleteFuelModal
 * --------------------------------------------------------------------------
 * Modale de confirmation de suppression d'un plein. Contrôlée en React (pas
 * d'API Bootstrap) : arrière-plan cliquable, fermeture par Échap, focus
 * initial sur le bouton d'annulation et verrouillage du scroll.
 *
 * Props :
 *   fuel      : plein à supprimer (null = modale fermée)
 *   open      : booléen — ouvre la modale
 *   loading   : booléen — suppression en cours (désactive les boutons)
 *   error     : message d'erreur (optionnel)
 *   onConfirm : () => void — confirme la suppression
 *   onClose   : () => void — ferme la modale
 */
import { useEffect } from 'react';
import { Alert, Button } from '@/components/ui';
import './DeleteFuelModal.css';

const DeleteFuelModal = ({ fuel, open, loading, error, onConfirm, onClose }) => {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('navix-modal-open');

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('navix-modal-open');
    };
  }, [open, onClose]);

  if (!open || !fuel) return null;

  return (
    <div
      className="navix-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="navix-modal__backdrop" aria-hidden="true" />
      <div
        className="navix-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-fuel-title"
        aria-describedby="delete-fuel-description"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title h5" id="delete-fuel-title">
              Supprimer le plein
            </h2>
            <Button variant="ghost" size="sm" icon="bi-x-lg" onClick={onClose} aria-label="Fermer la fenêtre" />
          </div>

          <div className="modal-body">
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}
            <p id="delete-fuel-description" className="mb-0">
              Voulez-vous vraiment supprimer le plein <strong>{fuel.fuelNumber}</strong>&nbsp;? Cette action
              est irréversible.
            </p>
          </div>

          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose} disabled={loading} autoFocus>
              Annuler
            </Button>
            <Button variant="danger" icon="bi-trash3" onClick={onConfirm} loading={loading}>
              Supprimer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteFuelModal;
