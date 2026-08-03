/**
 * Navix Drivers — DriverAvatar
 * --------------------------------------------------------------------------
 * Photo d'un chauffeur : image si `src` fournie, sinon initiales (via
 * Avatar). Sert dans la table, les cartes et les pages de détail.
 *
 * Props :
 *   src       : URL de la photo (optionnelle)
 *   fullName  : nom complet pour les initiales (ex. « Yao N'Guessan »)
 *   size      : taille Avatar (xs | sm | md | lg | xl)   (défaut : 'md')
 *   variant   : variante Avatar                           (défaut : 'primary')
 *   icon      : classe d'icône de repli      (défaut : 'bi-person-badge')
 *   className : classes additionnelles
 *   ...rest   : attributs transmis à l'Avatar
 */
import { Avatar } from '@/components/ui';

const DriverAvatar = ({ src, fullName, size = 'md', variant = 'primary', icon = 'bi-person-badge', className, ...rest }) => (
  <Avatar
    src={src || ''}
    alt={src ? `Photo de ${fullName}` : undefined}
    name={fullName}
    icon={src ? undefined : icon}
    size={size}
    variant={variant}
    className={className}
    {...rest}
  />
);

export default DriverAvatar;
