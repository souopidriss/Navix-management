/**
 * Navix Reports — ReportDataTable
 * --------------------------------------------------------------------------
 * Tableau de données d'un rapport : recherche locale, tri, pagination et
 * export (CSV/JSON côté client, XLSX/PDF simulés) sur le sous-ensemble
 * filtré. Construit sur DataTable / SearchBar / Pagination / ExportButton Core.
 *
 * Props :
 *   columns        : colonnes DataTable (avec `sortValue` / `searchValue` optionnels)
 *   rows           : lignes du rapport
 *   rowKey         : clé de ligne                                   (défaut : 'id')
 *   loading        : booléen — chargement
 *   emptyTitle     : titre de l'état vide
 *   emptyDescription : description de l'état vide
 *   ariaLabel      : libellé accessible du tableau
 *   searchable     : booléen — recherche locale                      (défaut : true)
 *   searchPlaceholder : placeholder de la recherche
 *   searchKeys     : clés scrutées par la recherche (défaut : clés des colonnes)
 *   exportable     : booléen — affiche l'export                      (défaut : true)
 *   exportFilename : nom du fichier d'export                         (défaut : 'rapport')
 *   exportColumns  : [{ key, label }] — champs exportés (défaut : colonnes visibles)
 *   onExport       : ({ format, data }) => void — export personnalisé
 *   pageSizeOptions : tailles de page proposées                      (défaut : PAGE_SIZE_OPTIONS)
 *   defaultPageSize : taille de page initiale                        (défaut : DEFAULT_PAGE_SIZE)
 *   title / subtitle / actions : en-tête de carte (Card Core)
 */
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui';
import { DataTable, SearchBar, Toolbar, Pagination } from '@/components/core';
import ReportExportButton from './ReportExportButton';
import { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from '../constants';
import './ReportComponents.css';

const ReportDataTable = ({
  columns = [],
  rows = [],
  rowKey = 'id',
  loading = false,
  emptyTitle = 'Aucune donnée',
  emptyDescription = 'Aucune ligne pour la période et les filtres sélectionnés.',
  ariaLabel,
  searchable = true,
  searchPlaceholder = 'Rechercher…',
  searchKeys,
  exportable = true,
  exportFilename = 'rapport',
  exportColumns,
  onExport,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  defaultPageSize = DEFAULT_PAGE_SIZE,
  title,
  subtitle,
  actions,
}) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sort, setSort] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const keys = useMemo(() => searchKeys || columns.map((column) => column.key), [searchKeys, columns]);

  const filtered = useMemo(() => {
    let result = rows;
    const term = search.trim().toLowerCase();
    if (term) {
      result = rows.filter((row) =>
        keys.some((key) => {
          const column = columns.find((item) => item.key === key);
          const value = column?.searchValue ? column.searchValue(row) : row[key];
          return String(value ?? '').toLowerCase().includes(term);
        }),
      );
    }

    if (sort?.by) {
      const column = columns.find((item) => item.key === sort.by);
      const factor = sort.direction === 'asc' ? 1 : -1;
      const sortValue = (row) => (column?.sortValue ? column.sortValue(row) : row[sort.by]);
      result = [...result].sort((a, b) => {
        const aValue = sortValue(a);
        const bValue = sortValue(b);
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
        const aNumber = Number(aValue);
        const bNumber = Number(bValue);
        if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) {
          return (aNumber - bNumber) * factor;
        }
        return String(aValue).localeCompare(String(bValue), 'fr', { sensitivity: 'base' }) * factor;
      });
    }

    return result;
  }, [rows, search, sort, columns, keys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize],
  );

  const resolvedExportColumns = useMemo(
    () =>
      exportColumns ||
      columns
        .filter((column) => !column.srOnly)
        .map((column) => ({
          key: column.key,
          label: typeof column.label === 'string' ? column.label : column.key,
        })),
    [columns, exportColumns],
  );

  const handleExport = (payload) => onExport?.(payload);

  const header = (
    <Toolbar gap="sm">
      {searchable && <SearchBar value={search} onChange={setSearch} placeholder={searchPlaceholder} />}
      {exportable && filtered.length > 0 && (
        <ReportExportButton
          data={filtered}
          columns={resolvedExportColumns}
          filename={exportFilename}
          onExport={handleExport}
          size="sm"
        />
      )}
    </Toolbar>
  );

  const footer =
    filtered.length > 0 ? (
      <Pagination
        page={safePage}
        pageSize={pageSize}
        totalItems={filtered.length}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={pageSizeOptions}
      />
    ) : undefined;

  return (
    <Card title={title} subtitle={subtitle} actions={actions} flush>
      <div className="navix-report-datatable">
        <DataTable
          columns={columns}
          rows={pageRows}
          rowKey={rowKey}
          loading={loading}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          ariaLabel={ariaLabel}
          sort={sort}
          onSortChange={(by, direction) => setSort({ by, direction })}
          header={header}
          footer={footer}
        />
      </div>
    </Card>
  );
};

export default ReportDataTable;
