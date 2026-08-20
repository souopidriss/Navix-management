export const REPORT_TYPES = [
  'fleet', 'vehicles', 'drivers', 'assignments', 'trips',
  'fuel', 'maintenance', 'documents', 'financial',
  'subscriptions', 'audit', 'companies', 'custom', 'overview',
];

export const REPORT_PERIODS = [
  'today', 'yesterday', 'last7', 'last30', 'last90', 'last180', 'last365',
  'thisWeek', 'lastWeek', 'thisMonth', 'lastMonth',
  'thisQuarter', 'lastQuarter', 'thisYear', 'lastYear', 'custom', '',
];

export const REPORT_STATUSES = ['draft', 'active', 'archived'];

export const CUSTOM_REPORT_SOURCES = [
  'fleet', 'vehicles', 'drivers', 'assignments', 'trips',
  'fuel', 'maintenance', 'documents', 'invoices', 'payments', 'audit',
];

export const REPORT_TYPE_META = {
  fleet: { id: 'fleet', label: 'Parc automobile', description: "Vue d'ensemble de la flotte : répartition, statuts, disponibilité.", icon: 'bi-truck', variant: 'info' },
  vehicles: { id: 'vehicles', label: 'Véhicules', description: 'Détail par véhicule : kilométrage, groupe, coûts et usage.', icon: 'bi-truck-front', variant: 'primary' },
  drivers: { id: 'drivers', label: 'Chauffeurs', description: 'Activité des chauffeurs : trajets, consommations, performance.', icon: 'bi-person-badge', variant: 'primary' },
  assignments: { id: 'assignments', label: 'Affectations', description: 'Historique et disponibilité des affectations.', icon: 'bi-shuffle', variant: 'info' },
  trips: { id: 'trips', label: 'Trajets', description: 'Volume de trajets, distances parcourues et motifs.', icon: 'bi-signpost-split', variant: 'info' },
  fuel: { id: 'fuel', label: 'Carburant', description: 'Consommations, coûts et anomalies de plein.', icon: 'bi-fuel-pump', variant: 'warning' },
  maintenance: { id: 'maintenance', label: 'Entretiens', description: "Coûts d'entretien, délais et fiabilité de la flotte.", icon: 'bi-wrench-adjustable', variant: 'warning' },
  documents: { id: 'documents', label: 'Documents', description: 'Expirations de documents, conformité par véhicule.', icon: 'bi-file-earmark-text', variant: 'warning' },
  financial: { id: 'financial', label: 'Finances', description: 'Coûts de flotte, factures, paiements et tendances.', icon: 'bi-cash-coin', variant: 'success' },
  subscriptions: { id: 'subscriptions', label: 'Abonnements', description: 'Plans, revenus récurrents et consommation de quotas.', icon: 'bi-credit-card', variant: 'primary' },
  audit: { id: 'audit', label: 'Journal des actions', description: 'Activité, tentatives échouées et événements sensibles.', icon: 'bi-journal-text', variant: 'dark' },
  companies: { id: 'companies', label: 'Entreprises', description: 'Comparaison multi-entreprises et consolidation.', icon: 'bi-buildings', variant: 'primary' },
  custom: { id: 'custom', label: 'Rapports personnalisés', description: 'Construisez un rapport à partir de vos propres indicateurs.', icon: 'bi-sliders', variant: 'secondary' },
  overview: { id: 'overview', label: 'Aperçu analytique', description: 'Indicateurs de pilotage consolidés de la flotte.', icon: 'bi-speedometer2', variant: 'info' },
};

export const CUSTOM_INDICATORS_BY_SOURCE = {
  fleet: [
    { key: 'total', label: 'Véhicules', format: 'number' },
    { key: 'availabilityRate', label: 'Taux de disponibilité', format: 'percent' },
  ],
  vehicles: [
    { key: 'total', label: 'Véhicules', format: 'number' },
    { key: 'totalMileage', label: 'Kilométrage total', format: 'distance' },
    { key: 'fuelCost', label: 'Coût carburant', format: 'money' },
    { key: 'maintenanceCost', label: 'Coût entretien', format: 'money' },
  ],
  drivers: [
    { key: 'tripCount', label: 'Trajets', format: 'number' },
    { key: 'totalDistance', label: 'Distance totale', format: 'distance' },
    { key: 'totalDuration', label: 'Temps de conduite', format: 'duration' },
  ],
  assignments: [
    { key: 'total', label: 'Affectations', format: 'number' },
    { key: 'active', label: 'Actives', format: 'number' },
  ],
  trips: [
    { key: 'total', label: 'Trajets', format: 'number' },
    { key: 'distance', label: 'Distance parcourue', format: 'distance' },
    { key: 'onTimeRate', label: 'Taux de complétion', format: 'percent' },
  ],
  fuel: [
    { key: 'totalCost', label: 'Dépenses carburant', format: 'money' },
    { key: 'totalQuantity', label: 'Volume', format: 'number' },
    { key: 'avgConsumption', label: 'Consommation moyenne', format: 'number' },
    { key: 'anomalies', label: 'Anomalies', format: 'number' },
  ],
  maintenance: [
    { key: 'total', label: 'Entretiens', format: 'number' },
    { key: 'actualCost', label: 'Coût réel', format: 'money' },
    { key: 'estimatedCost', label: 'Coût estimé', format: 'money' },
  ],
  documents: [
    { key: 'total', label: 'Documents', format: 'number' },
    { key: 'totalSize', label: 'Stockage utilisé', format: 'number' },
  ],
  invoices: [
    { key: 'totalInvoiced', label: 'Facturé', format: 'money' },
    { key: 'totalPaid', label: 'Encaissé', format: 'money' },
    { key: 'outstanding', label: 'En attente', format: 'money' },
    { key: 'collectionRate', label: 'Taux de recouvrement', format: 'percent' },
  ],
  payments: [
    { key: 'totalPaid', label: 'Total encaissé', format: 'money' },
    { key: 'count', label: 'Paiements', format: 'number' },
    { key: 'average', label: 'Paiement moyen', format: 'money' },
    { key: 'failed', label: 'Échoués', format: 'number' },
  ],
  subscriptions: [
    { key: 'total', label: 'Abonnements', format: 'number' },
    { key: 'active', label: 'Actifs', format: 'number' },
    { key: 'mrr', label: 'MRR', format: 'money' },
  ],
  audit: [
    { key: 'total', label: 'Événements', format: 'number' },
    { key: 'failed', label: 'Échoués', format: 'number' },
    { key: 'critical', label: 'Critiques', format: 'number' },
  ],
  companies: [
    { key: 'total', label: 'Entreprises', format: 'number' },
    { key: 'vehicles', label: 'Véhicules', format: 'number' },
  ],
};
