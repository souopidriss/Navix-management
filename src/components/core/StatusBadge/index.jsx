/**
 * Navix Core — StatusBadge
 * --------------------------------------------------------------------------
 * Badge de statut générique : affiche un libellé avec une variante
 * sémantique (success, warning, danger, info, secondary…) sans connaître le
 * métier. Le mapping « valeur métier → { variant, label } » reste à la charge
 * du module (constantes métier).
 *
 * Props :
 *   variant   : primary | secondary | success | warning | danger | info |
 *               dark | light                                   (défaut : 'secondary')
 *   label     : libellé affiché
 *   dot       : booléen — point de statut devant le libellé   (défaut : true)
 *   icon      : classe d'icône Bootstrap Icons, ex. 'bi-check-circle'
 *   soft      : booléen — fond translucide                     (défaut : true)
 *   size      : sm | md | lg                                   (défaut : 'md')
 *   className : classes additionnelles
 *   ...rest   : attributs transmis au Badge (title, aria-*, etc.)
 *
 * Exemple :
 *   <StatusBadge variant="success" label="Validé" />
 *   <StatusBadge variant="warning" label="En attente" icon="bi-hourglass-split" />
 */
import { memo } from 'react';
import { Badge } from '@/components/ui';

const StatusBadge = ({ variant = 'secondary', label, dot = true, icon, soft = true, size = 'md', className, ...rest }) => (
  <Badge variant={variant} soft={soft} dot={dot} size={size} className={className} {...rest}>
    {icon && <i className={`bi ${icon} me-1`} aria-hidden="true" />}
    {label}
  </Badge>
);

export default memo(StatusBadge);
