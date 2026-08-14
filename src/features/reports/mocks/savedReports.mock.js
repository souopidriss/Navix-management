/**
 * Navix Reports — Rapports enregistrés (données simulées)
 * --------------------------------------------------------------------------
 * Rapports sauvegardés par les utilisateurs : id (ULID), companyId, name,
 * description, reportType (catégorie de rapport), status (brouillon, actif,
 * archivé), configuration (filtres + période + indicateurs figés), createdBy,
 * createdAt et updatedAt.
 *
 * Les références (companyId) correspondent exactement aux mocks du module
 * Entreprises ; createdBy référence les utilisateurs simulés (usr_00x).
 *
 * Aucune requête HTTP — consommé par reportService (mode mock).
 */

export const MOCK_SAVED_REPORTS = [
  {
    id: '01JR0A1B2C3D4E5F6G7H8J9K0L1M2',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    name: 'Coûts carburant — Navix Trans',
    description: 'Consommations et dépenses carburant du parc sur 6 mois.',
    reportType: 'fuel',
    status: 'active',
    configuration: {
      period: 'thisMonth',
      dateFrom: '',
      dateTo: '',
      groupBy: 'month',
      indicators: ['totalCost', 'totalQuantity', 'consumptionAverage'],
      filters: { companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', vehicleGroup: '', status: 'validated' },
    },
    createdBy: 'usr_001',
    createdAt: '2026-06-02T09:00:00.000Z',
    updatedAt: '2026-07-20T14:30:00.000Z',
  },
  {
    id: '01JR0B2C3D4E5F6G7H8J9K0L1M2N3',
    companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2', // Cameroon Express
    name: 'Fiabilité flotte — Cameroon Express',
    description: 'Suivi des entretiens et de la disponibilité des véhicules.',
    reportType: 'maintenance',
    status: 'active',
    configuration: {
      period: 'last30',
      dateFrom: '',
      dateTo: '',
      groupBy: 'maintenanceType',
      indicators: ['count', 'actualCost', 'onTimeRate'],
      filters: { companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2' },
    },
    createdBy: 'usr_002',
    createdAt: '2026-06-18T11:15:00.000Z',
    updatedAt: '2026-07-28T08:45:00.000Z',
  },
  {
    id: '01JR0C3D4E5F6G7H8J9K0L1M2N3P4',
    companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2', // Kribi Port Trans
    name: 'Activité des chauffeurs — Kribi Port Trans',
    description: 'Trajets, distances et heures par chauffeur.',
    reportType: 'drivers',
    status: 'draft',
    configuration: {
      period: 'lastMonth',
      dateFrom: '',
      dateTo: '',
      groupBy: 'driver',
      indicators: ['tripCount', 'distance', 'duration'],
      filters: { companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2', driverId: '' },
    },
    createdBy: 'usr_004',
    createdAt: '2026-07-25T16:00:00.000Z',
    updatedAt: '2026-07-25T16:00:00.000Z',
  },
  {
    id: '01JR0D4E5F6G7H8J9K0L1M2N3P4Q5',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    name: 'Synthèse financière annuelle',
    description: 'Facturation et paiements consolidés pour l’année en cours.',
    reportType: 'financial',
    status: 'active',
    configuration: {
      period: 'thisYear',
      dateFrom: '',
      dateTo: '',
      groupBy: 'month',
      indicators: ['totalInvoiced', 'totalPaid', 'outstanding'],
      filters: { companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2' },
    },
    createdBy: 'usr_001',
    createdAt: '2026-01-05T08:30:00.000Z',
    updatedAt: '2026-08-01T09:20:00.000Z',
  },
  {
    id: '01JR0E5F6G7H8J9K0L1M2N3P4Q5R6',
    companyId: '01J8E2F3G4H5J6K7L8M9N0P1Q2', // Nord Express
    name: 'Parc long-courrier — Nord Express',
    description: 'Vue d’ensemble du parc de camions et de leur utilisation.',
    reportType: 'fleet',
    status: 'archived',
    configuration: {
      period: 'lastQuarter',
      dateFrom: '',
      dateTo: '',
      groupBy: 'group',
      indicators: ['vehicleCount', 'availabilityRate', 'utilizationRate'],
      filters: { companyId: '01J8E2F3G4H5J6K7L8M9N0P1Q2', vehicleGroup: 'D' },
    },
    createdBy: 'usr_005',
    createdAt: '2026-05-12T10:00:00.000Z',
    updatedAt: '2026-07-01T15:00:00.000Z',
  },
  {
    id: '01JR0F6G7H8J9K0L1M2N3P4Q5R6S7',
    companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', // Ouest Logistique
    name: 'Trajets livraison — Ouest Logistique',
    description: 'Volume de livraisons et taux de ponctualité.',
    reportType: 'trips',
    status: 'draft',
    configuration: {
      period: 'thisMonth',
      dateFrom: '',
      dateTo: '',
      groupBy: 'tripType',
      indicators: ['tripCount', 'distance', 'onTimeRate'],
      filters: { companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', tripType: 'delivery' },
    },
    createdBy: 'usr_006',
    createdAt: '2026-07-30T13:45:00.000Z',
    updatedAt: '2026-07-30T13:45:00.000Z',
  },
  {
    id: '01JR0G7H8J9K0L1M2N3P4Q5R6S7T8',
    companyId: '01J8H2J3K4L5M6N7P8Q9R0S1T2', // Sanaga Trans
    name: 'Documents expirants — Sanaga Trans',
    description: 'Suivi des expirations de documents par véhicule.',
    reportType: 'documents',
    status: 'active',
    configuration: {
      period: 'custom',
      dateFrom: '2026-08-01',
      dateTo: '2026-12-31',
      groupBy: 'category',
      indicators: ['count', 'expiringCount', 'expiredCount'],
      filters: { companyId: '01J8H2J3K4L5M6N7P8Q9R0S1T2' },
    },
    createdBy: 'usr_007',
    createdAt: '2026-08-01T09:00:00.000Z',
    updatedAt: '2026-08-02T10:00:00.000Z',
  },
  {
    id: '01JR0H8J9K0L1M2N3P4Q5R6S7T8U9',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    name: 'Affectations actives',
    description: 'Répartition des véhicules entre chauffeurs (affectations).',
    reportType: 'assignments',
    status: 'archived',
    configuration: {
      period: '',
      dateFrom: '',
      dateTo: '',
      groupBy: 'assignmentType',
      indicators: ['count', 'activeCount'],
      filters: { companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', status: 'active' },
    },
    createdBy: 'usr_001',
    createdAt: '2026-04-02T09:30:00.000Z',
    updatedAt: '2026-06-30T12:00:00.000Z',
  },
];

/** Pré-calcule le prochain numéro de rapport enregistré. */
export const nextSavedReportNumber = (() => {
  const max = MOCK_SAVED_REPORTS.reduce((highest, report) => {
    const match = report.id.match(/(\d+)$/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return String(max + 1).padStart(2, '0');
})();
