/**
 * Navix Companies — CompanyLogo
 * --------------------------------------------------------------------------
 * Logo d'une entreprise : image si `src` fournie, sinon initiales du nom ou
 * icône bâtiment (via Avatar). Sert dans la table, les cartes et les pages.
 *
 * Props :
 *   src       : URL du logo (optionnelle)
 *   name      : nom de l'entreprise (initiales si sans image)
 *   size      : taille Avatar (xs | sm | md | lg | xl)   (défaut : 'md')
 *   icon      : classe d'icône de repli                       (défaut : 'bi-building')
 *   className : classes additionnelles
 *   ...rest   : attributs transmis à l'Avatar
 */
import { Avatar } from '@/components/ui';

const CompanyLogo = ({ src, name, size = 'md', icon = 'bi-building', className, ...rest }) => (
  <Avatar
    src={src || ''}
    alt={src ? `Logo de ${name}` : undefined}
    name={name}
    icon={src ? undefined : icon}
    size={size}
    className={className}
    {...rest}
  />
);

export default CompanyLogo;
