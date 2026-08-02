/**
 * Navix Tooltip
 * --------------------------------------------------------------------------
 * Rôle : info-bulle Bootstrap (popper) pilotée en React, affichée au survol
 *        ou au focus clavier de l'élément déclencheur.
 *
 * Props :
 *   children    : ÉLÉMENT UNIQUE acceptant une ref (bouton, lien, icône…)
 *   content     : texte de l'info-bulle
 *   placement   : 'top' | 'bottom' | 'left' | 'right'   (défaut : 'top')
 *   disabled    : booléen — désactive l'info-bulle
 *   className   : classe additionnelle appliquée à la couche du tooltip
 *   ...rest     : attributs transmis à l'élément déclencheur (onClick, etc.)
 *
 * Exemple :
 *   <Tooltip content="Modifier le véhicule" placement="top">
 *     <button type="button" className="btn">✎</button>
 *   </Tooltip>
 */
import { isValidElement, cloneElement, useEffect, useRef } from 'react';
import './Tooltip.css';

const NavixTooltip = ({ children, content, placement = 'top', disabled = false, className, ...rest }) => {
  const childRef = useRef(null);

  useEffect(() => {
    const BootstrapTooltip = window.bootstrap?.Tooltip;
    const element = childRef.current;
    if (!element || !content || disabled || !BootstrapTooltip) return undefined;

    const instance = new BootstrapTooltip(element, {
      title: content,
      placement,
      trigger: 'hover focus',
      ...(className ? { customClass: className } : {}),
    });

    return () => {
      instance.dispose();
    };
  }, [content, placement, disabled, className]);

  if (!isValidElement(children)) return null;

  return cloneElement(children, { ref: childRef, ...rest });
};

export default NavixTooltip;
