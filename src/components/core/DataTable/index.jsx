/**
 * Navix Core — DataTable
 * --------------------------------------------------------------------------
 * Tableau de données générique : colonnes déclaratives (tri, rendu,
 * alignement), lignes cliquables, colonne d'actions, états chargement
 * (skeleton), vide et slots d'entête/pied (recherche, pagination).
 * 100 % générique — aucune référence métier.
 *
 * Props :
 *   columns       : tableau de descripteurs
 *                   [{ key, label, align?, sortable?, sortValue?,
 *                      render?, renderHeader?, className?, headerClassName?,
 *                      width?, srOnly? }]
 *   rows          : données à afficher
 *   rowKey        : clé (string) ou fonction (row) => string   (défaut : 'id')
 *   sort          : { by, direction } — contrôlé (optionnel)
 *   onSortChange  : (by: string, direction: 'asc' | 'desc') => void
 *   onRowClick    : (row, index) => void — ligne cliquable (optionnel)
 *   actions       : tableau d'actions
 *                   [{ key, label, icon?, variant?, title?, disabled?,
 *                      show?, onClick? }]  — label/title peuvent être des
 *                      fonctions (row) => string pour des libellés dynamiques
 *   loading       : booléen — affiche des rangées skeleton
 *   loadingRows   : nombre de rangées skeleton                 (défaut : 6)
 *   empty         : nœud d'état vide personnalisé (remplace EmptyState)
 *   emptyIcon / emptyTitle / emptyDescription : état vide par défaut
 *   header        : nœud affiché au-dessus du tableau (recherche, filtres…)
 *   footer        : nœud affiché sous le tableau (pagination…)
 *   rowClassName  : string ou (row) => string — classe de la ligne
 *   ariaLabel     : libellé accessible du tableau
 *   className     : classes additionnelles
 *
 * Exemple :
 *   <DataTable
 *     columns={[
 *       { key: 'name', label: 'Nom', sortable: true },
 *       { key: 'status', label: 'Statut', render: (row) => (
 *           <StatusBadge variant={row.status.variant} label={row.status.label} />) },
 *     ]}
 *     rows={items}
 *     sort={sort}
 *     onSortChange={setSort}
 *     loading={isLoading}
 *     actions={[{ key: 'view', label: 'Voir', icon: 'bi-eye', onClick: (row) => onView(row.id) }]}
 *     header={<SearchBar value={search} onChange={setSearch} />}
 *     footer={<Pagination ... />}
 *   />
 */
import { Button } from '@/components/ui';
import EmptyState from '../EmptyState';
import '../_shared/skeleton.css';
import './DataTable.css';

const DataTable = ({
  columns = [],
  rows = [],
  rowKey = 'id',
  sort,
  onSortChange,
  onRowClick,
  actions = [],
  loading = false,
  loadingRows = 6,
  empty,
  emptyIcon = 'bi-inbox',
  emptyTitle = 'Aucune donnée',
  emptyDescription = 'Aucun élément à afficher.',
  header,
  footer,
  rowClassName,
  ariaLabel = 'Tableau de données',
  className,
}) => {
  const hasActions = actions.length > 0;
  const columnCount = columns.length + (hasActions ? 1 : 0);

  const toggleSort = (key) => {
    if (!onSortChange) return;
    const sameColumn = sort?.by === key;
    const nextDirection = sameColumn ? (sort.direction === 'asc' ? 'desc' : 'asc') : 'asc';
    onSortChange(key, nextDirection);
  };

  const handleRowKeyDown = (event, row, index) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRowClick?.(row, index);
    }
  };

  return (
    <div className={`navix-datatable ${className || ''}`.trim()}>
      {header && <div className="navix-datatable__header">{header}</div>}

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 navix-datatable__table" aria-label={ariaLabel}>
          <thead>
            <tr>
              {columns.map((column) => {
                const isSorted = sort?.by === column.key;
                const headerClasses = [
                  column.align === 'end' ? 'text-end' : column.align === 'center' ? 'text-center' : 'text-start',
                  column.headerClassName,
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={isSorted ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                    className={headerClasses}
                    style={column.width ? { minWidth: column.width } : undefined}
                  >
                    {column.renderHeader ? (
                      column.renderHeader()
                    ) : column.sortable && onSortChange ? (
                      <button
                        type="button"
                        className={`navix-datatable__sort ${isSorted ? 'is-active' : ''}`}
                        onClick={() => toggleSort(column.key)}
                        aria-label={`Trier par ${typeof column.label === 'string' ? column.label : column.key}`}
                      >
                        {column.label}
                        <i
                          className={`bi ${
                            isSorted ? (sort.direction === 'asc' ? 'bi-sort-up' : 'bi-sort-down') : 'bi-chevron-expand'
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    ) : column.srOnly ? (
                      <span className="visually-hidden">{column.label}</span>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
              {hasActions && (
                <th scope="col" className="text-end">
                  <span className="visually-hidden">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: loadingRows }, (_, rowIndex) => (
                <tr key={rowIndex} aria-hidden="true">
                  {Array.from({ length: columnCount }, (_, colIndex) => (
                    <td key={colIndex}>
                      <span className="navix-skeleton" style={{ width: `${90 - (colIndex % 3) * 20}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columnCount}>
                  {empty ?? (
                    <EmptyState
                      compact
                      icon={emptyIcon}
                      title={emptyTitle}
                      description={emptyDescription}
                    />
                  )}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => {
                const keyValue = typeof rowKey === 'function' ? rowKey(row) : row[rowKey];
                const rowClasses = ['navix-datatable__row'];
                if (onRowClick) rowClasses.push('navix-datatable__row--clickable');
                const customClass = typeof rowClassName === 'function' ? rowClassName(row) : rowClassName;
                if (customClass) rowClasses.push(customClass);

                return (
                  <tr
                    key={keyValue}
                    className={rowClasses.join(' ')}
                    onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                    onKeyDown={onRowClick ? (event) => handleRowKeyDown(event, row, rowIndex) : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                  >
                    {columns.map((column) => {
                      const cellClasses = [
                        column.align === 'end' ? 'text-end' : column.align === 'center' ? 'text-center' : 'text-start',
                        column.className,
                      ]
                        .filter(Boolean)
                        .join(' ');

                      return (
                        <td key={column.key} className={cellClasses} style={column.width ? { minWidth: column.width } : undefined}>
                          {column.render ? column.render(row, rowIndex) : row[column.key] ?? '—'}
                        </td>
                      );
                    })}
                    {hasActions && (
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1">
                          {actions.map((action) => {
                            const isHidden = typeof action.show === 'function' ? !action.show(row) : action.show === false;
                            if (isHidden) return null;
                            const isDisabled =
                              typeof action.disabled === 'function' ? action.disabled(row) : action.disabled;
                            const label =
                              typeof action.label === 'function' ? action.label(row, rowIndex) : action.label;
                            const title =
                              typeof action.title === 'function' ? action.title(row, rowIndex) : action.title;

                            return (
                              <Button
                                key={action.key}
                                variant={action.variant || 'ghost'}
                                size="sm"
                                icon={action.icon}
                                onClick={() => action.onClick?.(row, rowIndex)}
                                disabled={isDisabled}
                                title={title || label}
                                aria-label={label}
                              />
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {footer && <div className="navix-datatable__footer">{footer}</div>}
    </div>
  );
};

export default DataTable;
