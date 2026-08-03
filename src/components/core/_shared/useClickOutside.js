/**
 * Navix Core — useClickOutside
 * --------------------------------------------------------------------------
 * Déclenche `handler` lorsqu'un clic (souris ou tactile) se produit à
 * l'extérieur de l'élément référencé. Utilisé par ActionDropdown, FilterBar
 * (multi-sélection) et tout menu/popover.
 *
 * Props :
 *   ref     : ref de l'élément à surveiller
 *   handler : callback appelé en cas de clic extérieur
 *   active  : booléen — désactive l'écoute (défaut : true)
 */
import { useEffect } from 'react';

const useClickOutside = (ref, handler, active = true) => {
  useEffect(() => {
    if (!active) return undefined;

    const listener = (event) => {
      const element = ref.current;
      if (!element || element.contains(event.target)) return;
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, active]);
};

export default useClickOutside;
