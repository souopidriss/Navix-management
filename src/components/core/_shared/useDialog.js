/**
 * Navix Core — useDialog
 * --------------------------------------------------------------------------
 * Comportement partagé des modales : fermeture par Échap, verrouillage du
 * scroll (compteur multi-modales) et restitution du focus à l'ouverture.
 * Le rendu (backdrop, dialog, focus initial) reste à la charge du composant.
 *
 * Props :
 *   open    : booléen — modale ouverte
 *   onClose : () => void — ferme la modale
 *
 * Retour :
 *   { dialogRef, handleBackdropMouseDown }
 */
import { useCallback, useEffect, useRef } from 'react';

let dialogCount = 0;

const lockBodyScroll = () => {
  if (dialogCount === 0) document.body.classList.add('navix-modal-open');
  dialogCount += 1;
};

const unlockBodyScroll = () => {
  dialogCount = Math.max(0, dialogCount - 1);
  if (dialogCount === 0) document.body.classList.remove('navix-modal-open');
};

const useDialog = ({ open, onClose }) => {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const previousFocus = document.activeElement;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        closeRef.current?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    lockBodyScroll();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      unlockBodyScroll();
      if (previousFocus instanceof HTMLElement) previousFocus.focus?.();
    };
  }, [open]);

  const handleBackdropMouseDown = useCallback((event) => {
    if (event.target === event.currentTarget) closeRef.current?.();
  }, []);

  return { dialogRef, handleBackdropMouseDown };
};

export default useDialog;
