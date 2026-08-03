/**
 * Navix Core — DeleteModal
 * --------------------------------------------------------------------------
 * Modale de confirmation de suppression : variante danger, icône corbeille,
 * message par défaut « irréversible ». Réutilise ConfirmDialog — aucune
 * logique métier.
 *
 * Props :
 *   open         : booléen — modale ouverte
 *   onClose      : () => void
 *   entityName   : nom de l'élément à supprimer (ex. « le plein FL-0001 »)
 *   title        : titre du dialogue            (défaut : 'Supprimer')
 *   message      : message personnalisé (remplace le message par défaut)
 *   confirmLabel : libellé du bouton de confirmation (défaut : 'Supprimer')
 *   cancelLabel  : libellé du bouton d'annulation    (défaut : 'Annuler')
 *   loading      : booléen — suppression en cours
 *   error        : message d'erreur (optionnel)
 *   onConfirm    : () => void
 *
 * Exemple :
 *   <DeleteModal
 *     open={Boolean(target)}
 *     onClose={onClose}
 *     entityName={target?.label}
 *     loading={isDeleting}
 *     error={deleteError}
 *     onConfirm={handleDelete}
 *   />
 */
import ConfirmDialog from '../ConfirmDialog';

const DeleteModal = ({
  open,
  onClose,
  entityName,
  title = 'Supprimer',
  message,
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
  loading = false,
  error,
  onConfirm,
}) => {
  const defaultMessage = (
    <>
      Voulez-vous vraiment supprimer{' '}
      {entityName ? <strong>{entityName}</strong> : 'cet élément'} ? Cette action est irréversible.
    </>
  );

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title={title}
      message={message ?? defaultMessage}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      confirmVariant="danger"
      icon="bi-trash3"
      loading={loading}
      error={error}
      onConfirm={onConfirm}
    />
  );
};

export default DeleteModal;
