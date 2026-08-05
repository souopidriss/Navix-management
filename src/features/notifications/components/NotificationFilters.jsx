/**
 * Navix Notifications — NotificationFilters
 * --------------------------------------------------------------------------
 * Barre de filtres (Entreprise, Type, Catégorie, Sévérité, Statut, Ressource,
 * Du / Au, Non lues seulement) + tri (critère et sens) construite sur le
 * FilterBar générique de Core UI. Les options proviennent des constantes du
 * module et des ressources liées.
 *
 * Props :
 *   filters          : objet des filtres courants
 *   companies        : liste des sociétés
 *   sort             : { by, direction }
 *   onChange         : (key: string, value: any) => void
 *   onSortChange     : (by: string, direction: string) => void
 *   onReset          : () => void
 *   hasActiveFilters : booléen — affiche « Réinitialiser »
 */
import { Card } from '@/components/ui';
import { FilterBar } from '@/components/core';
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_VALUES,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_VALUES,
  NOTIFICATION_SEVERITIES,
  NOTIFICATION_SEVERITY_VALUES,
  NOTIFICATION_STATUSES,
  NOTIFICATION_STATUS_VALUES,
  RESOURCE_TYPES,
  NOTIFICATION_SORT_OPTIONS,
  SORT_DIRECTIONS,
} from '../constants';
import './NotificationFilters.css';

const toOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const RESOURCE_LABELS = {
  company: 'Entreprise',
  agency: 'Agence',
  vehicle: 'Véhicule',
  driver: 'Chauffeur',
  assignment: 'Affectation',
  trip: 'Trajet',
  fuel: 'Carburant',
  maintenance: 'Entretien',
  document: 'Document',
  subscription: 'Abonnement',
  invoice: 'Facture',
  payment: 'Paiement',
};

const NotificationFilters = ({
  filters,
  companies = [],
  sort,
  onChange,
  onSortChange,
  onReset,
  hasActiveFilters,
}) => (
  <Card className="navix-notif-filters mb-3">
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
          key: 'type',
          type: 'select',
          label: 'Type',
          options: toOptions(NOTIFICATION_TYPE_VALUES, NOTIFICATION_TYPES),
          allLabel: 'Tous les types',
        },
        {
          key: 'category',
          type: 'select',
          label: 'Catégorie',
          options: toOptions(NOTIFICATION_CATEGORY_VALUES, NOTIFICATION_CATEGORIES),
          allLabel: 'Toutes les catégories',
        },
        {
          key: 'severity',
          type: 'select',
          label: 'Sévérité',
          options: toOptions(NOTIFICATION_SEVERITY_VALUES, NOTIFICATION_SEVERITIES),
          allLabel: 'Toutes les sévérités',
        },
        {
          key: 'status',
          type: 'select',
          label: 'Statut',
          options: toOptions(NOTIFICATION_STATUS_VALUES, NOTIFICATION_STATUSES),
          allLabel: 'Tous les statuts',
        },
        {
          key: 'resourceType',
          type: 'select',
          label: 'Ressource',
          options: RESOURCE_TYPES.map((value) => ({ value, label: RESOURCE_LABELS[value] ?? value })),
          allLabel: 'Toutes les ressources',
        },
        {
          key: 'dateFrom',
          type: 'date',
          label: 'À partir du',
        },
        {
          key: 'dateTo',
          type: 'date',
          label: "Jusqu'au",
        },
        {
          key: 'showUnread',
          type: 'checkbox',
          label: 'Non lues seulement',
        },
      ]}
      values={filters}
      onChange={onChange}
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
    />

    <div className="navix-notif-filters__sort">
      <FilterBar
        fields={[
          {
            key: 'by',
            type: 'select',
            label: 'Trier par',
            options: NOTIFICATION_SORT_OPTIONS,
            allLabel: 'Tri : Date',
          },
          {
            key: 'direction',
            type: 'select',
            label: 'Sens du tri',
            options: SORT_DIRECTIONS,
            allLabel: 'Ordre : Décroissant',
          },
        ]}
        values={sort}
        onChange={(key, value) =>
          onSortChange(key === 'by' ? value : sort.by, key === 'direction' ? value : sort.direction)
        }
        hasActiveFilters={false}
      />
    </div>
  </Card>
);

export default NotificationFilters;
