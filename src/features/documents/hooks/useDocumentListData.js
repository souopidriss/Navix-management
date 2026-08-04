/**
 * Navix Documents — Logique de liste (filtre, tri, pagination) + hook
 * --------------------------------------------------------------------------
 * Fonctions pures (`filterDocumentRecords`, `sortDocumentRecords`)
 * testables, puis hook `useDocumentListData` qui combine l'état du store et
 * les cartes de références (companyById, fileTypeById) pour produire la
 * liste visible : items, totalItems, totalPages, page et startIndex.
 *
 * La recherche couvre le nom, le nom d'origine, l'extension, le libellé du
 * type de fichier, le nom de l'entreprise et le libellé de la ressource
 * associée (fourni via `resourceLabel`).
 */
import { useMemo } from 'react';
import { DEFAULT_PAGE_SIZE, getDocumentType } from '../constants';
import { useDocumentsStore } from '../store';

const toQuery = (value) => String(value ?? '').trim().toLowerCase();

const isWithinPeriod = (createdAt, period) => {
  if (!period) return true;
  if (!createdAt) return false;

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();

  switch (period) {
    case 'current': {
      const diffDays = Math.round((now.getTime() - date.getTime()) / 86_400_000);
      return diffDays >= 0 && diffDays <= 30;
    }
    case 'month':
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    case 'quarter': {
      const dateQuarter = Math.floor(date.getMonth() / 3);
      const nowQuarter = Math.floor(now.getMonth() / 3);
      return date.getFullYear() === now.getFullYear() && dateQuarter === nowQuarter;
    }
    case 'year':
      return date.getFullYear() === now.getFullYear();
    default:
      return true;
  }
};

const isWithinSizeRange = (size, range) => {
  const bytes = Number(size || 0);
  switch (range) {
    case 'small':
      return bytes < 1024 * 1024;
    case 'medium':
      return bytes >= 1024 * 1024 && bytes <= 10 * 1024 * 1024;
    case 'large':
      return bytes > 10 * 1024 * 1024;
    default:
      return true;
  }
};

export const filterDocumentRecords = (
  documents = [],
  {
    search = '',
    filters = {},
    companyById = {},
    fileTypeById = {},
    resourceLabel = () => '',
  } = {},
) => {
  const query = toQuery(search);

  return documents.filter((document) => {
    const companyName = companyById[document.companyId]?.name ?? '';
    const fileTypeTitle = fileTypeById[document.fileTypeId]?.title ?? '';
    const resource = resourceLabel(document);

    const matchesSearch =
      !query ||
      [
        document.name,
        document.originalName,
        document.extension,
        getDocumentType(fileTypeTitle.toLowerCase()).label,
        fileTypeTitle,
        companyName,
        resource,
      ].some((field) => toQuery(field).includes(query));

    const matchesCompany = !filters.companyId || document.companyId === filters.companyId;
    const matchesType = !filters.fileTypeId || document.fileTypeId === filters.fileTypeId;
    const matchesAssociation = !filters.associationType || document.associationType === filters.associationType;
    const matchesVisibility = !filters.visibility || document.visibility === filters.visibility;
    const matchesSize = !filters.size || isWithinSizeRange(document.size, filters.size);
    const matchesPeriod = isWithinPeriod(document.createdAt, filters.period);

    const matchesExtension = !toQuery(filters.extension) || toQuery(document.extension) === toQuery(filters.extension);

    return (
      matchesSearch &&
      matchesCompany &&
      matchesType &&
      matchesAssociation &&
      matchesVisibility &&
      matchesSize &&
      matchesPeriod &&
      matchesExtension
    );
  });
};

export const sortDocumentRecords = (
  documents = [],
  { by = 'createdAt', direction = 'desc' } = {},
) => {
  const factor = direction === 'desc' ? -1 : 1;
  const dateKey = (document) => document.createdAt || '9999-12-31';

  return [...documents].sort((a, b) => {
    let result = 0;

    switch (by) {
      case 'createdAt':
        result = dateKey(a).localeCompare(dateKey(b));
        break;
      case 'name':
        result = String(a.name || '').localeCompare(String(b.name || ''), 'fr', { sensitivity: 'base' });
        break;
      case 'size':
        result = Number(a.size || 0) - Number(b.size || 0);
        break;
      case 'extension':
        result = String(a.extension || '').localeCompare(String(b.extension || ''), 'fr');
        break;
      default:
        result = 0;
    }

    return result * factor;
  });
};

/**
 * Hook de liste visible des documents. Les cartes de références
 * (id → objet) sont utilisées pour la recherche et le filtrage ; la
 * fonction `resourceLabel` fournit le libellé de la ressource associée.
 */
export const useDocumentListData = (companyById = {}, fileTypeById = {}, resourceLabel = () => '') => {
  const documents = useDocumentsStore((state) => state.documents);
  const search = useDocumentsStore((state) => state.search);
  const filters = useDocumentsStore((state) => state.filters);
  const sort = useDocumentsStore((state) => state.sort);
  const page = useDocumentsStore((state) => state.pagination.page);
  const pageSize = useDocumentsStore((state) => state.pagination.pageSize);

  return useMemo(() => {
    const filtered = sortDocumentRecords(
      filterDocumentRecords(documents, { search, filters, companyById, fileTypeById, resourceLabel }),
      sort,
    );
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const startIndex = (currentPage - 1) * pageSize;

    return {
      items: filtered.slice(startIndex, startIndex + pageSize),
      totalItems,
      totalPages,
      page: currentPage,
      startIndex,
    };
  }, [documents, search, filters, sort, page, pageSize, companyById, fileTypeById, resourceLabel]);
};
