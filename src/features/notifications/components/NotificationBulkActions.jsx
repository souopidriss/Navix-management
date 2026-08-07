/**
 * Navix Notifications — NotificationBulkActions
 * --------------------------------------------------------------------------
 * Barre d'actions groupées (bulk) : compteur de sélection, tout désélectionner
 * et actions de masse (marquer lu / non lu, archiver, supprimer — suppression
 * soumise à confirmation). Affichée lorsque au moins un élément est sélectionné.
 *
 * Props :
 *   selectedCount     : nombre d'éléments sélectionnés
 *   onMarkAsRead      : () => void
 *   onMarkAsUnread    : () => void
 *   onArchive         : () => void
 *   onDelete          : () => void
 *   onClear           : () => void
 *   isSaving          : désactive la barre pendant une opération
 */
import { Button } from '@/components/ui';
import './NotificationBulkActions.css';

const NotificationBulkActions = ({
  selectedCount = 0,
  onMarkAsRead,
  onMarkAsUnread,
  onArchive,
  onDelete,
  onClear,
  isSaving = false,
}) => {
  if (selectedCount <= 0) return null;

  const label = `${selectedCount} notification${selectedCount > 1 ? 's' : ''} sélectionnée${selectedCount > 1 ? 's' : ''}`;

  return (
    <div
      className="navix-bulk-actions"
      role="toolbar"
      aria-label="Actions sur la sélection"
      aria-live="polite"
    >
      <span className="navix-bulk-actions__label">{label}</span>

      <div className="navix-bulk-actions__buttons">
        <Button size="sm" variant="outline" icon="bi-check2" disabled={isSaving} onClick={onMarkAsRead}>
          Marquer lu
        </Button>
        <Button size="sm" variant="outline" icon="bi-envelope" disabled={isSaving} onClick={onMarkAsUnread}>
          Marquer non lu
        </Button>
        <Button size="sm" variant="outline" icon="bi-archive" disabled={isSaving} onClick={onArchive}>
          Archiver
        </Button>
        <Button size="sm" variant="danger" outline icon="bi-trash" disabled={isSaving} onClick={onDelete}>
          Supprimer
        </Button>
        {onClear && (
          <button
            type="button"
            className="navix-bulk-actions__clear"
            disabled={isSaving}
            onClick={onClear}
          >
            Tout désélectionner
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationBulkActions;
