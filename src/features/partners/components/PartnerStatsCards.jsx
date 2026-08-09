/**
 * Navix Partners — PartnerStatsCards
 * --------------------------------------------------------------------------
 * Cartes de statistiques du module Partenaires (page liste) : total,
 * partenaires actifs, prestataires de maintenance et assureurs.
 * Construit sur le StatsCards générique de la bibliothèque core.
 *
 * Props :
 *   partnerRecords : liste des partenaires (source des compteurs)
 */
import { StatsCards } from '@/components/core';

const buildStats = (partnerRecords = []) => [
  {
    key: 'count',
    label: 'Partenaires',
    value: partnerRecords.length,
    icon: 'bi-handshake',
    variant: 'primary',
  },
  {
    key: 'active',
    label: 'Actifs',
    value: partnerRecords.filter((partner) => partner.status === 'active').length,
    icon: 'bi-check-circle',
    variant: 'success',
  },
  {
    key: 'providers',
    label: 'Prestataires',
    value: partnerRecords.filter((partner) => partner.type === 'maintenance_provider').length,
    icon: 'bi-tools',
    variant: 'info',
  },
  {
    key: 'insurers',
    label: 'Assureurs',
    value: partnerRecords.filter((partner) => partner.type === 'insurer').length,
    icon: 'bi-shield-check',
    variant: 'warning',
  },
];

const PartnerStatsCards = ({ partnerRecords = [] }) => (
  <StatsCards stats={buildStats(partnerRecords)} />
);

export default PartnerStatsCards;
