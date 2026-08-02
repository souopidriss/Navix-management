/**
 * Navix RBAC — Filtrage du menu selon le contexte d'accès
 * --------------------------------------------------------------------------
 * Applique la méta RBAC (ROUTE_META) aux sections de la sidebar :
 *   - `hidden`            → l'entrée est retirée ;
 *   - `requiredRole`      → l'entrée n'apparaît que pour les rôles autorisés ;
 *   - `requiredPermissions` → l'entrée n'apparaît que si les permissions
 *                             sont suffisantes (voir `mode`) ;
 *   - `disabled`          → l'entrée reste affichée mais est marquée inutilisable.
 * Les sections devenues vides sont retirées du menu.
 */
import { SIDEBAR_SECTIONS } from '@/components/layout/navigation';
import { ROUTE_META } from '../constants/menu';
import { can, hasAnyRole } from './access';

/** Retourne la méta RBAC d'une route (objet vide si aucune). */
export const getMenuMeta = (to) => ROUTE_META[to] ?? {};

/**
 * Décide si une entrée de menu est visible pour le contexte d'accès donné.
 * @param {{ to: string }} item
 * @param {{ role: string, permissions: string[] }} access
 */
export const isItemVisible = (item, { role, permissions }) => {
  const meta = getMenuMeta(item.to);
  if (meta.hidden) return false;
  if (meta.requiredRole && !hasAnyRole(role, meta.requiredRole)) return false;
  if (meta.requiredPermissions && !can(permissions, meta.requiredPermissions, { mode: meta.mode })) return false;
  return true;
};

/**
 * Filtre les sections de la sidebar selon le contexte d'accès courant.
 * @param {Array} [sections] — sections à filtrer (défaut : SIDEBAR_SECTIONS)
 * @param {{ role: string, permissions: string[] }} access
 * @returns {Array} sections visibles, entrées marquées `disabled` le cas échéant
 */
export const filterSidebarSections = (sections = SIDEBAR_SECTIONS, access) =>
  sections
    .map((section) => ({
      ...section,
      items: section.items
        .filter((item) => isItemVisible(item, access))
        .map((item) => {
          const { disabled } = getMenuMeta(item.to);
          return disabled ? { ...item, disabled } : item;
        }),
    }))
    .filter((section) => section.items.length > 0);
