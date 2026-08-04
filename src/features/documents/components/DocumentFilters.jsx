/**
 * Navix Documents — DocumentFilters
 * --------------------------------------------------------------------------
 * Barre de filtres (Entreprise, Type de fichier, Ressource, Visibilité,
 * Taille, Période, Extension) construite sur le FilterBar générique de la
 * bibliothèque core. Les critères pilotent le hook useDocumentListData.
 *
 * Props :
 *   filters          : { companyId, fileTypeId, associationType, visibility, size, period, extension }
 *   companies        : liste des entreprises (options du filtre)
 *   fileTypes        : liste des types de fichiers
 *   onChange         : (key: string, value: string) => void
 *   onReset          : () => void
 *   hasActiveFilters : booléen — affiche le bouton « Réinitialiser »
 */
import { Card } from '@/components/ui';
import { FilterBar } from '@/components/core';
import {
  ASSOCIATION_TYPE_VALUES,
  ASSOCIATION_TYPES,
  DOCUMENT_VISIBILITY_VALUES,
  DOCUMENT_VISIBILITIES,
  SIZE_FILTER_OPTIONS,
  PERIOD_OPTIONS,
} from '../constants';
import './DocumentFilters.css';

const toOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta?.[value]?.label ?? value }));

const DocumentFilters = ({
  filters,
  companies = [],
  fileTypes = [],
  onChange,
  onReset,
  hasActiveFilters,
}) => (
  <Card className="navix-doc-filters">
    <FilterBar
      fields={[
        {
          key: 'companyId',
          type: 'select',
          label: 'Entreprise',
          options: companies.map((company) => ({ value: company.id, label: company.name })),
          allLabel: 'Toutes les entreprises',
        },
        {
          key: 'fileTypeId',
          type: 'select',
          label: 'Type de fichier',
          options: fileTypes.map((fileType) => ({ value: fileType.id, label: fileType.title })),
          allLabel: 'Tous les types',
        },
        {
          key: 'associationType',
          type: 'select',
          label: 'Ressource',
          options: toOptions(ASSOCIATION_TYPE_VALUES, ASSOCIATION_TYPES),
          allLabel: 'Toutes les ressources',
        },
        {
          key: 'visibility',
          type: 'select',
          label: 'Visibilité',
          options: toOptions(DOCUMENT_VISIBILITY_VALUES, DOCUMENT_VISIBILITIES),
          allLabel: 'Toutes les visibilités',
        },
        {
          key: 'size',
          type: 'select',
          label: 'Taille',
          options: SIZE_FILTER_OPTIONS.filter((option) => option.value),
          allLabel: 'Toutes les tailles',
        },
        {
          key: 'period',
          type: 'select',
          label: 'Période',
          options: PERIOD_OPTIONS.filter((option) => option.value),
          allLabel: 'Toutes les périodes',
        },
        {
          key: 'extension',
          type: 'text',
          label: 'Extension',
          placeholder: 'Ex. .pdf',
        },
      ]}
      values={filters}
      onChange={onChange}
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
    />
  </Card>
);

export default DocumentFilters;
