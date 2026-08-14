/**
 * Navix Client — Mock données Dashboard Premium
 * --------------------------------------------------------------------------
 * Données de démonstration pour le Dashboard Client Entreprise / Particulier.
 * Localisation 100% Cameroun 🇨🇲 — Monnaie FCFA (XAF).
 */

/* ==============================
   KPI MÉTRIQUES CLIENT ENTREPRISE
   ============================== */
export const MOCK_CLIENT_DASHBOARD_METRICS_ENTERPRISE = [
  {
    key: 'vehicles_active',
    label: 'Véhicules actifs',
    value: 14,
    trend: +8.5,
    trendLabel: '↑ 8.5% vs mois dernier',
    trendVariant: 'success',
    icon: 'bi-truck',
    variant: 'primary',
    suffix: '',
  },
  {
    key: 'vehicles_maintenance',
    label: 'En maintenance',
    value: 2,
    trend: -3.1,
    trendLabel: '↓ 3.1%',
    trendVariant: 'success',
    icon: 'bi-wrench-adjustable',
    variant: 'warning',
    suffix: '',
  },
  {
    key: 'trips',
    label: 'Trajets effectués',
    value: 87,
    trend: +12.7,
    trendLabel: '↑ 12.7%',
    trendVariant: 'success',
    icon: 'bi-signpost-split',
    variant: 'info',
    suffix: '',
  },
  {
    key: 'spend',
    label: 'Dépenses du mois',
    value: '25 830 000 FCFA',
    trend: -4.3,
    trendLabel: '↓ 4.3%',
    trendVariant: 'success',
    icon: 'bi-cash-stack',
    variant: 'success',
    suffix: '',
    isMonetary: true,
    rawAmount: 25830000,
  },
  {
    key: 'fuel',
    label: 'Consommation',
    value: '18 450 L',
    trend: -6.2,
    trendLabel: '↓ 6.2%',
    trendVariant: 'success',
    icon: 'bi-fuel-pump',
    variant: 'info',
    suffix: '',
  },
];

export const MOCK_CLIENT_DASHBOARD_METRICS_INDIVIDUAL = [
  {
    key: 'services',
    label: 'Services actifs',
    value: 1,
    trend: 0,
    trendLabel: 'Stable',
    trendVariant: 'secondary',
    icon: 'bi-grid-fill',
    variant: 'primary',
  },
  {
    key: 'trips',
    label: 'Trajets ce mois',
    value: 4,
    trend: +33,
    trendLabel: '↑ 33%',
    trendVariant: 'success',
    icon: 'bi-signpost-split',
    variant: 'info',
  },
  {
    key: 'spend',
    label: 'Dépenses du mois',
    value: '285 000 FCFA',
    trend: +12,
    trendLabel: '↑ 12%',
    trendVariant: 'danger',
    icon: 'bi-cash-stack',
    variant: 'warning',
    isMonetary: true,
    rawAmount: 285000,
  },
  {
    key: 'requests',
    label: 'Demandes en cours',
    value: 1,
    trend: 0,
    trendLabel: 'En attente',
    trendVariant: 'warning',
    icon: 'bi-clipboard-plus',
    variant: 'warning',
  },
];

/* ==============================
   ÉVOLUTION MENSUELLE DES DÉPENSES (6 mois)
   ============================== */
export const MOCK_CLIENT_MONTHLY_EVOLUTION = [
  { label: 'Fév', month: 'Fév', total: 19800000, fuel: 9100000, maintenance: 4500000 },
  { label: 'Mars', month: 'Mars', total: 22400000, fuel: 10200000, maintenance: 5600000 },
  { label: 'Avr', month: 'Avr', total: 20900000, fuel: 9800000, maintenance: 4800000 },
  { label: 'Mai', month: 'Mai', total: 24100000, fuel: 11300000, maintenance: 6200000 },
  { label: 'Juin', month: 'Juin', total: 27300000, fuel: 12400000, maintenance: 7100000 },
  { label: 'Juil', month: 'Juil', total: 25830000, fuel: 11500000, maintenance: 6600000 },
];

/* ==============================
   DÉPENSES PAR CATÉGORIE (pour Donut)
   ============================== */
export const MOCK_CLIENT_FINANCIAL_DATA = {
  monthFuel: 11500000,
  monthMaintenance: 6600000,
  monthOther: 7730000,
  monthTotal: 25830000,
};

/* ==============================
   VÉHICULES LES PLUS UTILISÉS (contexte client)
   ============================== */
export const MOCK_CLIENT_TOP_VEHICLES = [
  {
    id: 'V-CLT-001',
    registrationNumber: 'LT 1234 AB',
    brand: 'Toyota',
    model: 'Hilux',
    year: 2023,
    mileage: 8562,
    group: 'C',
    status: 'in_use',
    location: 'Douala',
    trips: 28,
    insuranceExpiry: '2027-01-01',
    inspectionExpiry: '2026-12-15',
    registrationExpiry: '2027-03-01',
  },
  {
    id: 'V-CLT-002',
    registrationNumber: 'CE 4587 AA',
    brand: 'Toyota',
    model: 'Land Cruiser',
    year: 2022,
    mileage: 7125,
    group: 'D',
    status: 'in_use',
    location: 'Yaoundé',
    trips: 22,
    insuranceExpiry: '2026-11-01',
    inspectionExpiry: '2027-01-20',
    registrationExpiry: '2027-02-01',
  },
  {
    id: 'V-CLT-003',
    registrationNumber: 'EN 2345 B',
    brand: 'Mitsubishi',
    model: 'L200',
    year: 2022,
    mileage: 6874,
    group: 'C',
    status: 'in_use',
    location: 'Bafoussam',
    trips: 19,
    insuranceExpiry: '2026-10-01',
    inspectionExpiry: '2026-09-15',
    registrationExpiry: '2026-12-01',
  },
  {
    id: 'V-CLT-004',
    registrationNumber: 'LT 9876 CD',
    brand: 'Nissan',
    model: 'Patrol',
    year: 2021,
    mileage: 6210,
    group: 'D',
    status: 'available',
    location: 'Kribi',
    trips: 17,
    insuranceExpiry: '2027-02-01',
    inspectionExpiry: '2027-01-01',
    registrationExpiry: '2027-03-01',
  },
  {
    id: 'V-CLT-005',
    registrationNumber: 'CE 3698 EF',
    brand: 'Isuzu',
    model: 'D-Max',
    year: 2023,
    mileage: 5980,
    group: 'C',
    status: 'maintenance',
    location: 'Garoua',
    trips: 15,
    insuranceExpiry: '2027-01-01',
    inspectionExpiry: '2027-04-01',
    registrationExpiry: '2027-06-01',
  },
];

/* ==============================
   ALERTES CLIENT
   ============================== */
export const MOCK_CLIENT_ALERTS = {
  critical: 1,
  warning: 2,
  info: 1,
  items: [
    {
      id: 'ALT-CLT-001',
      type: 'vehicle_immobilized',
      severity: 'critical',
      entityType: 'vehicle',
      entityId: 'V-CLT-005',
      title: '2 véhicules en maintenance urgente',
      description: 'Isuzu D-Max CE 3698 EF immobilisé à Garoua — Intervention requise rapidement.',
      createdAt: '2026-08-13T08:00:00.000Z',
    },
    {
      id: 'ALT-CLT-002',
      type: 'document_expiring',
      severity: 'warning',
      entityType: 'vehicle',
      entityId: 'V-CLT-003',
      title: 'Assurance expirant bientôt',
      description: 'Mitsubishi L200 EN 2345 B — Assurance expire le 01/10/2026. 3 véhicules concernés.',
      createdAt: '2026-08-12T10:00:00.000Z',
    },
    {
      id: 'ALT-CLT-003',
      type: 'inspection_expiry',
      severity: 'warning',
      entityType: 'vehicle',
      entityId: 'V-CLT-002',
      title: 'Visite technique à prévoir',
      description: 'Toyota Land Cruiser CE 4587 AA — Visite technique expire le 20/01/2027.',
      createdAt: '2026-08-11T14:00:00.000Z',
    },
    {
      id: 'ALT-CLT-004',
      type: 'fuel_anomaly',
      severity: 'info',
      entityType: null,
      entityId: null,
      title: 'Paiements en attente',
      description: '3 factures en attente de règlement pour un total de 41 800 000 FCFA.',
      createdAt: '2026-08-10T09:00:00.000Z',
    },
  ],
};

/* ==============================
   ACTIVITÉS RÉCENTES CLIENT
   ============================== */
export const MOCK_CLIENT_ACTIVITIES = [
  {
    id: 'ACT-CLT-001',
    type: 'trip_completed',
    title: 'Trajet terminé — Douala → Yaoundé',
    description: 'Toyota Hilux LT 1234 AB · Jean Mbarga · 238 km',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'ACT-CLT-002',
    type: 'maintenance_completed',
    title: 'Entretien terminé — Toyota Land Cruiser CE 4587 AA',
    description: 'Vidange + filtre air · Garage Auto Plus Yaoundé · 185 000 FCFA',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'ACT-CLT-003',
    type: 'fuel_validated',
    title: 'Carburant ajouté — LT 1234 AB',
    description: '120 L de diesel · TotalEnergies Douala Akwa · 73 200 FCFA',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ACT-CLT-004',
    type: 'trip_created',
    title: 'Nouveau trajet — Douala → Bafoussam',
    description: 'Mitsubishi L200 EN 2345 B · Paul Biya Fils · départ 06:00',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ACT-CLT-005',
    type: 'document_uploaded',
    title: 'Document ajouté — Contrat renouvellé SRV-001',
    description: 'Contrat Location Flotte Pick-up 2026 · signé par J-P Ndongo',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

/* ==============================
   CARBURANT CLIENT
   ============================== */
export const MOCK_CLIENT_FUEL_DATA = {
  totalQuantity: 18450,
  averageConsumption: 12.5,
  totalCost: 12450000,
  monthQuantity: 18450,
  monthCost: 12450000,
  trend: -6.2,
  trendVariant: 'success',
};

/* ==============================
   ACTIONS RAPIDES CLIENT
   ============================== */
export const CLIENT_QUICK_ACTIONS = [
  { key: 'new_request', label: 'Nouvelle demande', icon: 'bi-plus-circle', to: '/client/requests' },
  { key: 'vehicles', label: 'Mes véhicules', icon: 'bi-truck', to: '/client/vehicles' },
  { key: 'incident', label: 'Déclarer un incident', icon: 'bi-exclamation-triangle', to: '/client/requests' },
  { key: 'maintenance', label: 'Planifier un entretien', icon: 'bi-wrench-adjustable', to: '/client/requests' },
  { key: 'document', label: 'Ajouter un document', icon: 'bi-file-earmark-plus', to: '/client/documents' },
];

export const CLIENT_QUICK_ACTIONS_INDIVIDUAL = [
  { key: 'new_request', label: 'Nouvelle demande', icon: 'bi-plus-circle', to: '/client/requests' },
  { key: 'trips', label: 'Mes trajets', icon: 'bi-signpost-split', to: '/client/trips' },
  { key: 'invoices', label: 'Mes factures', icon: 'bi-receipt', to: '/client/invoices' },
  { key: 'document', label: 'Mes documents', icon: 'bi-folder2-open', to: '/client/documents' },
];

/* ==============================
   OPTIONS DE PÉRIODE CLIENT
   ============================== */
export const CLIENT_PERIOD_OPTIONS = [
  { value: 'month', label: 'Ce mois-ci' },
  { value: 'last_month', label: 'Mois dernier' },
  { value: 'quarter', label: '3 derniers mois' },
  { value: 'semester', label: '6 derniers mois' },
  { value: 'custom', label: 'Période personnalisée' },
];
