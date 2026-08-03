/**
 * Navix useDebounce
 * --------------------------------------------------------------------------
 * Retourne une valeur différée : l'état interne ne suit `value` qu'après un
 * délai sans nouvelle saisie. Idéal pour la recherche serveur ou les champs
 * à forte fréquence de frappe (SearchBar, filtres…).
 *
 * Props :
 *   value : valeur source à différer
 *   delay : délai en millisecondes                     (défaut : 300)
 *
 * Exemple :
 *   const debouncedQuery = useDebounce(query, 400);
 *   useEffect(() => { fetchSearch(debouncedQuery); }, [debouncedQuery]);
 */
import { useEffect, useState } from 'react';

const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(handler);
  }, [value, delay]);

  return debounced;
};

export default useDebounce;
