/**
 * Navix Core — ActionDropdown
 * --------------------------------------------------------------------------
 * Menu d'actions générique (bouton + menu déroulant) avec navigation
 * clavier complète (flèches, Home/End, Échap, restitution du focus) et
 * fermeture au clic extérieur. Ne connaît aucun métier.
 *
 * Props :
 *   items         : tableau d'actions
 *                   [{ key, label, icon?, danger?, disabled?, separator?,
 *                      show?, onClick? }]
 *   triggerIcon   : icône du bouton déclencheur (défaut : 'bi-three-dots-vertical')
 *   triggerLabel  : libellé accessible du bouton (défaut : 'Actions')
 *   ariaLabel     : libellé accessible du menu (hérite de triggerLabel)
 *   align         : 'start' | 'end' — position du menu         (défaut : 'end')
 *   buttonVariant : variante du bouton déclencheur             (défaut : 'ghost')
 *   size          : taille du bouton                           (défaut : 'sm')
 *   className     : classes additionnelles
 *
 * Exemple :
 *   <ActionDropdown
 *     items={[
 *       { key: 'view', label: 'Voir', icon: 'bi-eye', onClick: (row) => onView(row.id) },
 *       { key: 'edit', label: 'Modifier', icon: 'bi-pencil', onClick: (row) => onEdit(row.id) },
 *       { key: 'sep', separator: true },
 *       { key: 'delete', label: 'Supprimer', icon: 'bi-trash3', danger: true, onClick: (row) => onDelete(row) },
 *     ]}
 *   />
 */
import { useRef, useState } from 'react';
import { Button } from '@/components/ui';
import useClickOutside from '../_shared/useClickOutside';
import './ActionDropdown.css';

const ActionDropdown = ({
  items = [],
  triggerIcon = 'bi-three-dots-vertical',
  triggerLabel = 'Actions',
  ariaLabel,
  align = 'end',
  buttonVariant = 'ghost',
  size = 'sm',
  className,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuRef = useRef(null);

  useClickOutside(rootRef, () => setOpen(false), open);

  const visibleItems = items.filter((item) =>
    typeof item.show === 'function' ? item.show() : item.show !== false,
  );

  const focusItem = (index) => {
    const enabled = menuRef.current?.querySelectorAll('[role="menuitem"]:not(:disabled)');
    if (!enabled?.length) return;
    const target = (index + enabled.length) % enabled.length;
    enabled[target]?.focus();
  };

  const handleTriggerKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(true);
      window.setTimeout(() => focusItem(0), 0);
    }
  };

  const handleMenuKeyDown = (event, index) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      rootRef.current?.querySelector('[aria-haspopup="menu"]')?.focus();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusItem(index + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusItem(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusItem(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusItem(visibleItems.length - 1);
    }
  };

  return (
    <div className={`navix-dropdown ${className || ''}`.trim()} ref={rootRef}>
      <Button
        variant={buttonVariant}
        size={size}
        icon={triggerIcon}
        className="navix-dropdown__trigger"
        aria-label={ariaLabel || triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
      />
      {open && (
        <div
          className={`navix-dropdown__menu dropdown-menu show navix-dropdown__menu--${align}`}
          role="menu"
          aria-label={ariaLabel || triggerLabel}
          ref={menuRef}
        >
          {visibleItems.map((item, index) =>
            item.separator ? (
              <div key={item.key} className="dropdown-divider" role="separator" />
            ) : (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className={`dropdown-item ${item.danger ? 'navix-dropdown__item--danger' : ''}`.trim()}
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
                onKeyDown={(event) => handleMenuKeyDown(event, index)}
              >
                {item.icon && <i className={`bi ${item.icon} me-2`} aria-hidden="true" />}
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;
