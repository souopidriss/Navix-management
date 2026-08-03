/**
 * Navix Pagination
 * --------------------------------------------------------------------------
 * Rôle : pagination réutilisable (liste, tableau, catalogue) avec numéros,
 *        boutons précédent/suivant, ellipses, résumé et sélecteur de taille.
 *        Fonctionne en mode contrôlé (page/totalItems gérés par le parent).
 *
 * Props :
 *   page            : page courante (1-indexée)
 *   pageSize        : nombre d'éléments par page
 *   totalItems      : nombre total d'éléments
 *   totalPages      : nombre total de pages (dérivé, mais fourni pour l'affichage)
 *   onPageChange    : (page: number) => void
 *   onPageSizeChange: (pageSize: number) => void
 *   pageSizeOptions : options du sélecteur de taille  (défaut : [5, 8, 10, 20])
 *   showPageSize    : booléen — affiche le sélecteur de taille (défaut : true)
 *   className       : classes additionnelles
 *   ...rest         : autres attributs (id, data-*, aria-*, etc.)
 *
 * Exemple :
 *   <Pagination
 *     page={page}
 *     pageSize={pageSize}
 *     totalItems={totalItems}
 *     totalPages={totalPages}
 *     onPageChange={setPage}
 *     onPageSizeChange={setPageSize}
 *   />
 */
import { memo } from 'react';
import './Pagination.css';

const getPageItems = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push('ellipsis-start');
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push('ellipsis-end');
  pages.push(totalPages);

  return pages;
};

const NavixPagination = ({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 8, 10, 20],
  showPageSize = true,
  className,
  ...rest
}) => {
  if (totalPages <= 1 && totalItems <= pageSize) return null;

  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className={`navix-pagination ${className || ''}`.trim()} {...rest}>
      <p className="navix-pagination__summary" aria-live="polite">
        Affichage de <strong>{start}–{end}</strong> sur <strong>{totalItems}</strong>
      </p>

      <nav className="navix-pagination__nav" aria-label="Pagination">
        <ul className="pagination mb-0">
          <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              aria-label="Page précédente"
            >
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>

          {getPageItems(page, totalPages).map((item) =>
            item === 'ellipsis-start' || item === 'ellipsis-end' ? (
              <li key={item} className="page-item disabled">
                <span className="page-link" aria-hidden="true">
                  &hellip;
                </span>
              </li>
            ) : (
              <li key={item} className={`page-item ${item === page ? 'active' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => onPageChange(item)}
                  aria-current={item === page ? 'page' : undefined}
                  aria-label={`Page ${item}`}
                >
                  {item}
                </button>
              </li>
            ),
          )}

          <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              aria-label="Page suivante"
            >
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>

      {showPageSize && onPageSizeChange && (
        <label className="navix-pagination__size">
          <span>Par page :</span>
          <select
            className="form-select form-select-sm"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            aria-label="Nombre d'éléments par page"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
};

export default memo(NavixPagination);
