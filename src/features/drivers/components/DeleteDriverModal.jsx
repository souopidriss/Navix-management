/**
 * Navix Drivers — DeleteDriverModal
 * --------------------------------------------------------------------------
 * Modale de confirmation de suppression d'un chauffeur. Contrôlée en React
 * (pas d'API Bootstrap) : arrière-plan cliquable, fermeture par Échap,
 * focus initial sur le bouton d'annulation et verrouillage du scroll.
 *
 * Props :
 *   driver    : chauffeur à supprimer (null = modale fermée)
 *   open      : booléen — ouvre la modale
 *   loading   : booléen — suppression en cours (désactive les boutons)
 *   error     : message d'erreur (optionnel)
 *   onConfirm : () => void — confirme la suppression
 *   onClose   : () => void — ferme la modale
 */
import { useEffect } from 'react';
import { Alert, Button } from '@/components/ui';
import './DeleteDriverModal.css';

const DeleteDriverModal = ({ driver, open, loading, error, onConfirm, onClose }) => {
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

  if (!open || !driver) return null;

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
        aria-labelledby="delete-driver-title"
        aria-describedby="delete-driver-description"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title h5" id="delete-driver-title">
              Supprimer le chauffeur
            </h2>
            <Button variant="ghost" size="sm" icon="bi-x-lg" onClick={onClose} aria-label="Fermer la fenêtre" />
          </div>

          <div className="modal-body">
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}
            <p id="delete-driver-description" className="mb-0">
              Voulez-vous vraiment supprimer le chauffeur <strong>{driver.fullName}</strong> (
              {driver.employeeCode})&nbsp;? Cette action est irréversible.
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

export default DeleteDriverModal;
