/**
 * Navix Core — Dialog (shell partagé)
 * --------------------------------------------------------------------------
 * Structure interne commune aux modales (FormModal, ConfirmDialog,
 * DeleteModal) : backdrop, dialogue, entête, corps défilant et pied.
 * Gère fermeture par Échap, clic sur l'arrière-plan et verrouillage du
 * scroll via `useDialog`.
 *
 * Props :
 *   open        : booléen — modale ouverte
 *   onClose     : () => void
 *   size        : 'sm' | 'md' | 'lg' | 'xl'          (défaut : 'md')
 *   header      : contenu de l'entête (titre + bouton de fermeture)
 *   body        : contenu du corps
 *   footer      : contenu du pied (optionnel)
 *   labelledBy  : id de l'élément titrant le dialogue (aria-labelledby)
 *   describedBy : id de l'élément décrivant le dialogue (aria-describedby)
 *   className   : classes additionnelles
 */
import useDialog from './useDialog';
import './dialog.css';

const Dialog = ({
  open,
  onClose,
  size = 'md',
  header,
  body,
  footer,
  labelledBy,
  describedBy,
  className,
  ...rest
}) => {
  const { handleBackdropMouseDown } = useDialog({ open, onClose });

  if (!open) return null;

  return (
    <div
      className={`navix-modal navix-modal--${size} ${className || ''}`.trim()}
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
      {...rest}
    >
      <div className="navix-modal__backdrop" aria-hidden="true" />
      <div
        className="navix-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
      >
        <div className="modal-content">
          <div className="modal-header">{header}</div>
          <div className="modal-body navix-modal__body-scroll">{body}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
};

export default Dialog;
