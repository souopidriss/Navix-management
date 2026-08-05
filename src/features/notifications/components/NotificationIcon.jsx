/**
 * Navix Notifications — NotificationIcon
 * --------------------------------------------------------------------------
 * Icône sémantique d'une notification : pastille ronde colorée selon le type
 * (variant) avec l'icône Bootstrap associée. Aucune couleur codée en dur :
 * le fond est dérivé des tokens RGB (--navix-{variant}-rgb) pour rester
 * lisible en thèmes clair et sombre.
 *
 * Props :
 *   variant : primary | secondary | success | warning | danger | info | dark | light
 *   icon    : classe Bootstrap Icons (défaut : 'bi-bell')
 *   size    : sm | md | lg (défaut : 'md')
 */
import { memo } from 'react';
import './NotificationIcon.css';

const NotificationIcon = ({ variant = 'secondary', icon = 'bi-bell', size = 'md' }) => (
  <span className={`navix-notif-icon navix-notif-icon--${variant} navix-notif-icon--${size}`} aria-hidden="true">
    <i className={`bi ${icon}`} />
  </span>
);

export default memo(NotificationIcon);
