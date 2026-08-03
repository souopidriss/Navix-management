/**
 * Navix Core — ConfirmDialog
 * --------------------------------------------------------------------------
 * Dialogue de confirmation générique : message, erreur éventuelle, boutons
 * Annuler / Confirmer. Fermeture par Échap, clic arrière-plan, focus initial
 * sur Annuler. Ne connaît aucun métier.
 *
 * Props :
 *   open           : booléen — modale ouverte
 *   onClose        : () => void
 *   title          : titre du dialogue                    (défaut : 'Confirmer')
 *   message        : message (texte ou nœud)
 *   confirmLabel   : libellé du bouton de confirmation    (défaut : 'Confirmer')
 *   cancelLabel    : libellé du bouton d'annulation       (défaut : 'Annuler')
 *   confirmVariant : primary | success | warning | danger (défaut : 'primary')
 *   icon           : classe d'icône Bootstrap Icons
 *   loading        : booléen — action en cours
 *   error          : message d'erreur (optionnel)
 *   onConfirm      : () => void
 *   size           : 'sm' | 'md'                          (défaut : 'sm')
 *
 * Exemple :
 *   <ConfirmDialog
 *     open={open}
 *     onClose={onClose}
 *     title="Clôturer la période"
 *     message="Les modifications seront définitives."
 *     confirmLabel="Clôturer"
 *     onConfirm={handleConfirm}
 *   />
 */
import { useId } from 'react';
import { Alert, Button } from '@/components/ui';
import Dialog from '../_shared/Dialog';

const ConfirmDialog = ({
  open,
  onClose,
  title = 'Confirmer',
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  confirmVariant = 'primary',
  icon,
  loading = false,
  error,
  onConfirm,
  size = 'sm',
}) => {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  const header = (
    <>
      <h2 className="modal-title h5" id={titleId}>
        {icon && <i className={`bi ${icon} me-2`} aria-hidden="true" />}
        {title}
      </h2>
      <Button variant="ghost" size="sm" icon="bi-x-lg" onClick={onClose} aria-label="Fermer la fenêtre" />
    </>
  );

  const body = (
    <>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      <p id={descriptionId} className="mb-0">
        {message}
      </p>
    </>
  );

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={loading} autoFocus>
        {cancelLabel}
      </Button>
      <Button variant={confirmVariant} icon={icon} onClick={onConfirm} loading={loading}>
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size={size}
      labelledBy={titleId}
      describedBy={descriptionId}
      header={header}
      body={body}
      footer={footer}
    />
  );
};

export default ConfirmDialog;
