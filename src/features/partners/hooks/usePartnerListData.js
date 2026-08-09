/**
 * Navix Partners — Logique de liste (filtre, tri, pagination) + hook
 * --------------------------------------------------------------------------
 * Fonctions pures (`filterPartnerRecords`, `sortPartnerRecords`) testables,
 * puis hook `usePartnerListData` qui combine l'état du store et la carte de
 * références des entreprises (companyById) pour produire la liste visible :
 * items, totalItems, totalPages, page et startIndex.
 */
import { useMemo } from 'react';
import { DEFAULT_PAGE_SIZE, getPartnerType } from '../constants';
import { usePartnersStore } from '../store';

const toQuery = (value) => String(value ?? '').trim().toLowerCase();

export const filterPartnerRecords = (
  partnerRecords = [],
  { search = '', filters = {}, companyById = {} } = {},
) => {
  const query = toQuery(search);

  return partnerRecords.filter((partner) => {
    const companyName = companyById[partner.companyId]?.name ?? '';

    const matchesSearch =
      !query ||
      [
        partner.code,
        partner.name,
        partner.contactName,
        partner.email,
        partner.city,
        partner.country,
        getPartnerType(partner.type).label,
        companyName,
      ].some((field) => toQuery(field).includes(query));
    const matchesCompany = !filters.companyId || partner.companyId === filters.companyId;
    const matchesType = !filters.type || partner.type === filters.type;
    const matchesStatus = !filters.status || partner.status === filters.status;
    const matchesCountry = !filters.country || partner.country === filters.country;

    return matchesSearch && matchesCompany && matchesType && matchesStatus && matchesCountry;
  });
};

export const sortPartnerRecords = (
  partnerRecords = [],
  { by = 'name', direction = 'asc' } = {},
) => {
  const factor = direction === 'desc' ? -1 : 1;
  const collator = new Intl.Collator('fr', { sensitivity: 'base', numeric: true });

  return [...partnerRecords].sort((a, b) => {
    let result = 0;

    switch (by) {
      case 'name':
        result = collator.compare(a.name ?? '', b.name ?? '');
        break;
      case 'type':
        result = collator.compare(
          getPartnerType(a.type).label,
          getPartnerType(b.type).label,
        );
        break;
      case 'city':
        result = collator.compare(a.city ?? '', b.city ?? '');
        break;
      case 'createdAt':
        result = String(a.createdAt).localeCompare(String(b.createdAt));
        break;
      default:
        result = 0;
    }

    return result * factor;
  });
};

/**
 * Hook de liste visible des partenaires. La carte de références
 * (id → entreprise) est utilisée pour la recherche et le filtrage.
 */
export const usePartnerListData = (companyById = {}) => {
  const partnerRecords = usePartnersStore((state) => state.partnerRecords);
  const search = usePartnersStore((state) => state.search);
  const filters = usePartnersStore((state) => state.filters);
  const sort = usePartnersStore((state) => state.sort);
  const page = usePartnersStore((state) => state.pagination.page);
  const pageSize = usePartnersStore((state) => state.pagination.pageSize);

  return useMemo(() => {
    const filtered = sortPartnerRecords(
      filterPartnerRecords(partnerRecords, { search, filters, companyById }),
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
  }, [partnerRecords, search, filters, sort, page, pageSize, companyById]);
};
