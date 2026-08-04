/**
 * Navix Documents — DocumentStatsCards
 * --------------------------------------------------------------------------
 * Cartes de synthèse du module (StatsCards générique) : nombre de fichiers,
 * taille stockée, ajouts du mois et de l'année. Les valeurs proviennent de
 * `documentService.statistics()` (dérivées du cache mocké).
 *
 * Props :
 *   statistics : objet de synthèse du service (totalCount, totalSize,
 *                monthCount, yearCount) ou null pendant le chargement
 *   loading    : booléen — squelette d'affichage
 */
import { StatsCards } from '@/components/core';
import { formatDocumentSize } from '../constants';

const DocumentStatsCards = ({ statistics, loading = false }) => (
  <StatsCards
    loading={loading}
    stats={[
      {
        key: 'files',
        label: 'Fichiers',
        value: statistics?.totalCount ?? 0,
        icon: 'bi-folder2-open',
        variant: 'primary',
      },
      {
        key: 'size',
        label: 'Taille stockée',
        value: formatDocumentSize(statistics?.totalSize),
        icon: 'bi-hdd-stack',
        variant: 'info',
      },
      {
        key: 'month',
        label: 'Ajoutés ce mois',
        value: statistics?.monthCount ?? 0,
        icon: 'bi-calendar-month',
        variant: 'success',
      },
      {
        key: 'year',
        label: 'Ajoutés cette année',
        value: statistics?.yearCount ?? 0,
        icon: 'bi-calendar-range',
        variant: 'warning',
      },
    ]}
  />
);

export default DocumentStatsCards;
