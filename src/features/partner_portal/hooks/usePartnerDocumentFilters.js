/**
 * Navix Partner Portal — Hook usePartnerDocumentFilters (PROMPT 066)
 * --------------------------------------------------------------------------
 * Configurabilité du filtre documentaire : retourne les descripteurs
 * FilterBar (Type de document, Statut, Entité liée, Date d'ajout) construits
 * depuis le référentiel partenaire, ainsi que l'état initial des filtres.
 * Les plages de dates personnalisées (dateFrom / dateTo) sont ajoutées par la
 * page lorsque le filtre « Personnalisée » est sélectionné.
 */
import {
  PARTNER_DOCUMENT_CATEGORIES,
  PARTNER_DOCUMENT_CATEGORY_VALUES,
  PARTNER_DOCUMENT_STATUSES,
  PARTNER_DOCUMENT_STATUS_VALUES,
  PARTNER_DOCUMENT_ENTITY_TYPES,
  PARTNER_DOCUMENT_ENTITY_VALUES,
  PARTNER_DOCUMENT_DATE_FILTERS,
  PARTNER_DOCUMENT_DATE_FILTER_VALUES,
} from '../constants/partner.constants';

const toOptions = (values, meta) => values.map((value) => ({ value, label: meta[value]?.label ?? value }));

/** État initial des filtres documentaires. */
export const PARTNER_DOCUMENT_DEFAULT_FILTERS = {
  category: '',
  status: '',
  entity: '',
  date: '',
  dateFrom: '',
  dateTo: '',
};

export const usePartnerDocumentFilters = () => {
  const fields = [
    {
      key: 'category',
      type: 'select',
      label: 'Type de document',
      options: toOptions(PARTNER_DOCUMENT_CATEGORY_VALUES, PARTNER_DOCUMENT_CATEGORIES),
      allLabel: 'Tous les types',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Statut',
      options: toOptions(PARTNER_DOCUMENT_STATUS_VALUES, PARTNER_DOCUMENT_STATUSES),
      allLabel: 'Tous les statuts',
    },
    {
      key: 'entity',
      type: 'select',
      label: 'Entité liée',
      options: toOptions(PARTNER_DOCUMENT_ENTITY_VALUES, PARTNER_DOCUMENT_ENTITY_TYPES),
      allLabel: 'Toutes les entités',
    },
    {
      key: 'date',
      type: 'select',
      label: "Date d'ajout",
      options: toOptions(PARTNER_DOCUMENT_DATE_FILTER_VALUES, PARTNER_DOCUMENT_DATE_FILTERS),
      allLabel: 'Toutes les dates',
    },
  ];

  return { fields, defaultFilters: { ...PARTNER_DOCUMENT_DEFAULT_FILTERS } };
};

export default usePartnerDocumentFilters;
