/**
 * Navix Services — Construction de query string (filtres, pagination, tri).
 * Les valeurs `undefined`, `null` et `''` sont ignorées ; les tableaux sont
 * répétés (ex. ?status=active&status=pending). Prépare la pagination/filtrage
 * des listes avant le branchement backend.
 *
 * Exemple :
 *   buildQuery({ page: 2, limit: 20, status: 'active', sort: undefined })
 *   → '?page=2&limit=20&status=active'
 */
export const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, String(item)));
    } else {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};
