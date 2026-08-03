/**
 * Navix Vehicles — VehicleImage
 * --------------------------------------------------------------------------
 * Photo d'un véhicule : image si `src` fournie, sinon icône ou initiales
 * (via Avatar). Sert dans la table, les cartes et les pages de détail.
 *
 * Props :
 *   src       : URL de la photo (optionnelle)
 *   name      : libellé pour les initiales (ex. « Toyota Hilux »)
 *   size      : taille Avatar (xs | sm | md | lg | xl)   (défaut : 'md')
 *   icon      : classe d'icône de repli                       (défaut : 'bi-truck')
 *   className : classes additionnelles
 *   ...rest   : attributs transmis à l'Avatar
 */
import { Avatar } from '@/components/ui';

const VehicleImage = ({ src, name, size = 'md', icon = 'bi-truck', className, ...rest }) => (
  <Avatar
    src={src || ''}
    alt={src ? `Photo du véhicule ${name}` : undefined}
    name={name}
    icon={src ? undefined : icon}
    size={size}
    className={className}
    {...rest}
  />
);

export default VehicleImage;
