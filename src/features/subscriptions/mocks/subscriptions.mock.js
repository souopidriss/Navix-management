/**
 * Navix Subscriptions — Données simulées (mode mock)
 * --------------------------------------------------------------------------
 * Modèle SaaS complet :
 *   - MOCK_PLANS          : 4 plans (Starter / Business / Professional /
 *                           Enterprise) aux prix fictifs
 *   - MOCK_FEATURES       : 17 fonctionnalités SaaS
 *   - MOCK_PLAN_FEATURES  : fonctionnalités incluses par plan
 *   - MOCK_PLAN_LIMITS    : limites d'usage par plan (10 ressources)
 *   - MOCK_SUBSCRIPTIONS  : 1 abonnement par entreprise (multi-tenant),
 *                           couvrant tous les statuts
 *   - MOCK_USAGE          : consommation réelle dérivée des mocks métier
 *                           (véhicules, chauffeurs, agences, documents,
 *                           trajets, pleins, entretiens)
 *
 * Aucune requête HTTP — consommé par subscriptionService (mode mock).
 */
import { MOCK_COMPANIES } from '@/features/companies/mocks';

const companyName = (id) => MOCK_COMPANIES.find((company) => company.id === id)?.name ?? '';

/* --------------------------------------------------------------------------
   Plans d'abonnement (SaaSPlan)
   -------------------------------------------------------------------------- */

export const MOCK_PLANS = [
  {
    id: '01JT0A1B2C3D4E5F6G7H8J9K0L1',
    code: 'starter',
    name: 'Starter',
    description:
      'L’essentiel pour démarrer la gestion de votre flotte : véhicules, chauffeurs, trajets, carburant et maintenance.',
    price: 29,
    currency: 'EUR',
    billingInterval: 'monthly',
    trialDays: 14,
    isActive: true,
    isPopular: false,
    sortOrder: 1,
    createdAt: '2024-01-10T08:00:00.000Z',
    updatedAt: '2026-07-01T09:00:00.000Z',
  },
  {
    id: '01JT0B2C3D4E5F6G7H8J9K0L1M2',
    code: 'business',
    name: 'Business',
    description:
      'Pour les flottes en croissance : agences, rapports et analytiques en plus des fonctionnalités Starter.',
    price: 79,
    currency: 'EUR',
    billingInterval: 'monthly',
    trialDays: 14,
    isActive: true,
    isPopular: true,
    sortOrder: 2,
    createdAt: '2024-01-10T08:00:00.000Z',
    updatedAt: '2026-07-01T09:00:00.000Z',
  },
  {
    id: '01JT0C3D4E5F6G7H8J9K0L1M2N3',
    code: 'professional',
    name: 'Professional',
    description:
      'Pilotage avancé : gestion financière, journal d’audit et export avancé pour les opérations exigeantes.',
    price: 149,
    currency: 'EUR',
    billingInterval: 'monthly',
    trialDays: 14,
    isActive: true,
    isPopular: false,
    sortOrder: 3,
    createdAt: '2024-01-10T08:00:00.000Z',
    updatedAt: '2026-07-01T09:00:00.000Z',
  },
  {
    id: '01JT0D4E5F6G7H8J9K0L1M2N3P4',
    code: 'enterprise',
    name: 'Enterprise',
    description:
      'La solution complète : multi-entreprises, accès API, permissions avancées et support dédié.',
    price: 299,
    currency: 'EUR',
    billingInterval: 'monthly',
    trialDays: 14,
    isActive: true,
    isPopular: false,
    sortOrder: 4,
    createdAt: '2024-01-10T08:00:00.000Z',
    updatedAt: '2026-07-01T09:00:00.000Z',
  },
];

export const MOCK_PLANS_BY_ID = Object.fromEntries(MOCK_PLANS.map((plan) => [plan.id, plan]));

export const MOCK_PLANS_BY_CODE = Object.fromEntries(MOCK_PLANS.map((plan) => [plan.code, plan]));

/* --------------------------------------------------------------------------
   Fonctionnalités SaaS (SaaSFeature)
   -------------------------------------------------------------------------- */

export const MOCK_FEATURES = [
  { id: '01JU1A2B3C4D5E6F7G8H9J0K1L2', code: 'vehicles', name: 'Gestion des véhicules', description: 'Suivi de la flotte, immatriculations, groupes et statuts.', category: 'fleet', isActive: true },
  { id: '01JU2B3C4D5E6F7G8H9J0K1L2M3', code: 'drivers', name: 'Gestion des chauffeurs', description: 'Dossiers chauffeurs, permis, disponibilités et affectations.', category: 'fleet', isActive: true },
  { id: '01JU3C4D5E6F7G8H9J0K1L2M3N4', code: 'assignments', name: 'Affectations', description: 'Planification des véhicules et chauffeurs sur les missions.', category: 'operations', isActive: true },
  { id: '01JU4D5E6F7G8H9J0K1L2M3N4P5', code: 'trips', name: 'Trajets', description: 'Suivi complet des trajets : itinéraires, distances et statuts.', category: 'operations', isActive: true },
  { id: '01JU5E6F7G8H9J0K1L2M3N4P5Q6', code: 'fuel', name: 'Carburant', description: 'Gestion des pleins, stations et coûts de carburant.', category: 'operations', isActive: true },
  { id: '01JU6F7G8H9J0K1L2M3N4P5Q6R7', code: 'maintenance', name: 'Maintenance', description: 'Entretiens préventifs et curatifs, ateliers et coûts.', category: 'operations', isActive: true },
  { id: '01JU7G8H9J0K1L2M3N4P5Q6R7S8', code: 'documents', name: 'Documents', description: 'Dépôt, classement et expiration des documents liés.', category: 'administration', isActive: true },
  { id: '01JU8H9J0K1L2M3N4P5Q6R7S8T9', code: 'agencies', name: 'Agences & sites', description: 'Gestion multi-sites : agences, dépôts, ateliers et garages.', category: 'administration', isActive: true },
  { id: '01JU9J0K1L2M3N4P5Q6R7S8T9U1', code: 'notifications', name: 'Notifications', description: 'Alertes et notifications en temps réel sur la flotte.', category: 'administration', isActive: true },
  { id: '01JU0K1L2M3N4P5Q6R7S8T9U1V2', code: 'auditLog', name: 'Journal d’audit', description: 'Traçabilité complète des actions et modifications.', category: 'administration', isActive: true },
  { id: '01JVA2B3C4D5E6F7G8H9J0K1L2M3', code: 'reports', name: 'Rapports', description: 'Rapports personnalisables sur l’activité de la flotte.', category: 'analytics', isActive: true },
  { id: '01JVB3C4D5E6F7G8H9J0K1L2M3N4', code: 'analytics', name: 'Analytiques', description: 'Tableaux de bord analytiques et indicateurs de performance.', category: 'analytics', isActive: true },
  { id: '01JVC4D5E6F7G8H9J0K1L2M3N4P5', code: 'financialManagement', name: 'Gestion financière', description: 'Suivi des coûts, budgets et facturation de la flotte.', category: 'analytics', isActive: true },
  { id: '01JVD5E6F7G8H9J0K1L2M3N4P5Q6', code: 'multiAgency', name: 'Multi-agences', description: 'Consolidation et pilotage de plusieurs agences.', category: 'growth', isActive: true },
  { id: '01JVE6F7G8H9J0K1L2M3N4P5Q6R7', code: 'apiAccess', name: 'Accès API', description: 'Intégrations programmatiques avec l’API Navix.', category: 'growth', isActive: true },
  { id: '01JVF7G8H9J0K1L2M3N4P5Q6R7S8', code: 'advancedExport', name: 'Export avancé', description: 'Exports massifs et personnalisés de toutes les données.', category: 'growth', isActive: true },
  { id: '01JVG8H9J0K1L2M3N4P5Q6R7S8T9', code: 'advancedPermissions', name: 'Permissions avancées', description: 'Rôles et permissions fins pour chaque utilisateur.', category: 'growth', isActive: true },
];

export const MOCK_FEATURES_BY_CODE = Object.fromEntries(
  MOCK_FEATURES.map((feature) => [feature.code, feature]),
);

/* --------------------------------------------------------------------------
   Fonctionnalités incluses par plan (liaison SaaSPlanFeature)
   -------------------------------------------------------------------------- */

export const MOCK_PLAN_FEATURES = {
  starter: [
    'vehicles',
    'drivers',
    'assignments',
    'trips',
    'fuel',
    'maintenance',
    'documents',
    'notifications',
  ],
  business: [
    'vehicles',
    'drivers',
    'assignments',
    'trips',
    'fuel',
    'maintenance',
    'documents',
    'notifications',
    'agencies',
    'reports',
    'analytics',
  ],
  professional: [
    'vehicles',
    'drivers',
    'assignments',
    'trips',
    'fuel',
    'maintenance',
    'documents',
    'notifications',
    'agencies',
    'reports',
    'analytics',
    'financialManagement',
    'auditLog',
    'advancedExport',
  ],
  enterprise: [
    'vehicles',
    'drivers',
    'assignments',
    'trips',
    'fuel',
    'maintenance',
    'documents',
    'notifications',
    'agencies',
    'reports',
    'analytics',
    'financialManagement',
    'auditLog',
    'advancedExport',
    'multiAgency',
    'apiAccess',
    'advancedPermissions',
  ],
};

/* --------------------------------------------------------------------------
   Limites d'usage par plan (SaaSPlanLimit)
   -------------------------------------------------------------------------- */

export const MOCK_PLAN_LIMITS = {
  starter: {
    maxVehicles: 5,
    maxDrivers: 3,
    maxUsers: 2,
    maxAgencies: 1,
    maxCompanies: 1,
    maxDocuments: 50,
    maxStorage: 1,
    maxTripsPerMonth: 200,
    maxFuelRecordsPerMonth: 100,
    maxMaintenanceRecordsPerMonth: 50,
  },
  business: {
    maxVehicles: 15,
    maxDrivers: 10,
    maxUsers: 5,
    maxAgencies: 3,
    maxCompanies: 1,
    maxDocuments: 200,
    maxStorage: 5,
    maxTripsPerMonth: 1000,
    maxFuelRecordsPerMonth: 500,
    maxMaintenanceRecordsPerMonth: 200,
  },
  professional: {
    maxVehicles: 50,
    maxDrivers: 30,
    maxUsers: 15,
    maxAgencies: 10,
    maxCompanies: 3,
    maxDocuments: 1000,
    maxStorage: 20,
    maxTripsPerMonth: 5000,
    maxFuelRecordsPerMonth: 2500,
    maxMaintenanceRecordsPerMonth: 1000,
  },
  enterprise: {
    maxVehicles: 200,
    maxDrivers: 100,
    maxUsers: 50,
    maxAgencies: 30,
    maxCompanies: 10,
    maxDocuments: 5000,
    maxStorage: 100,
    maxTripsPerMonth: 20000,
    maxFuelRecordsPerMonth: 10000,
    maxMaintenanceRecordsPerMonth: 5000,
  },
};

/* --------------------------------------------------------------------------
   Abonnements (Subscription) — 1 par entreprise, tous les statuts couverts
   -------------------------------------------------------------------------- */

export const MOCK_SUBSCRIPTIONS = [
  {
    id: '01JS1A2B3C4D5E6F7G8H9J0K1L2',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    planId: '01JT0D4E5F6G7H8J9K0L1M2N3P4', // Enterprise
    status: 'active',
    startDate: '2024-02-12T09:30:00.000Z',
    trialStartDate: null,
    trialEndDate: null,
    currentPeriodStart: '2026-07-15T00:00:00.000Z',
    currentPeriodEnd: '2026-08-14T00:00:00.000Z',
    cancelAtPeriodEnd: false,
    cancelledAt: null,
    renewalDate: '2026-08-14T00:00:00.000Z',
    price: 299,
    currency: 'EUR',
    billingInterval: 'monthly',
    createdAt: '2024-02-12T09:30:00.000Z',
    updatedAt: '2026-07-15T08:00:00.000Z',
  },
  {
    id: '01JS2B3C4D5E6F7G8H9J0K1L2M3',
    companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2', // Trans Express CI
    planId: '01JT0B2C3D4E5F6G7H8J9K0L1M2', // Business
    status: 'expired',
    startDate: '2024-06-03T11:20:00.000Z',
    trialStartDate: null,
    trialEndDate: null,
    currentPeriodStart: '2026-06-01T00:00:00.000Z',
    currentPeriodEnd: '2026-07-31T00:00:00.000Z',
    cancelAtPeriodEnd: false,
    cancelledAt: null,
    renewalDate: null,
    price: 79,
    currency: 'EUR',
    billingInterval: 'monthly',
    createdAt: '2024-06-03T11:20:00.000Z',
    updatedAt: '2026-07-31T23:59:00.000Z',
  },
  {
    id: '01JS3C4D5E6F7G8H9J0K1L2M3N4',
    companyId: '01J8C2D3E4F5G6H7J8K9L0M1N2', // LogiSud
    planId: '01JT0A1B2C3D4E5F6G7H8J9K0L1', // Starter
    status: 'trialing',
    startDate: '2026-08-01T08:00:00.000Z',
    trialStartDate: '2026-08-01T08:00:00.000Z',
    trialEndDate: '2026-08-15T00:00:00.000Z',
    currentPeriodStart: '2026-08-01T00:00:00.000Z',
    currentPeriodEnd: '2026-08-15T00:00:00.000Z',
    cancelAtPeriodEnd: false,
    cancelledAt: null,
    renewalDate: '2026-08-15T00:00:00.000Z',
    price: 29,
    currency: 'EUR',
    billingInterval: 'monthly',
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z',
  },
  {
    id: '01JS4D5E6F7G8H9J0K1L2M3N4P5',
    companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2', // SenTrans
    planId: '01JT0B2C3D4E5F6G7H8J9K0L1M2', // Business
    status: 'active',
    startDate: '2024-11-08T08:00:00.000Z',
    trialStartDate: null,
    trialEndDate: null,
    currentPeriodStart: '2026-07-28T00:00:00.000Z',
    currentPeriodEnd: '2026-08-28T00:00:00.000Z',
    cancelAtPeriodEnd: false,
    cancelledAt: null,
    renewalDate: '2026-08-28T00:00:00.000Z',
    price: 790,
    currency: 'EUR',
    billingInterval: 'yearly',
    createdAt: '2024-11-08T08:00:00.000Z',
    updatedAt: '2026-07-28T10:00:00.000Z',
  },
  {
    id: '01JS5E6F7G8H9J0K1L2M3N4P5Q6',
    companyId: '01J8E2F3G4H5J6K7L8M9N0P1Q2', // Bamakotrans
    planId: '01JT0A1B2C3D4E5F6G7H8J9K0L1', // Starter
    status: 'past_due',
    startDate: '2025-01-17T10:45:00.000Z',
    trialStartDate: null,
    trialEndDate: null,
    currentPeriodStart: '2026-06-25T00:00:00.000Z',
    currentPeriodEnd: '2026-07-25T00:00:00.000Z',
    cancelAtPeriodEnd: false,
    cancelledAt: null,
    renewalDate: null,
    price: 29,
    currency: 'EUR',
    billingInterval: 'monthly',
    createdAt: '2025-01-17T10:45:00.000Z',
    updatedAt: '2026-07-25T18:00:00.000Z',
  },
  {
    id: '01JS6F7G8H9J0K1L2M3N4P5Q6R7',
    companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', // OuagaLogistics
    planId: '01JT0C3D4E5F6G7H8J9K0L1M2N3', // Professional
    status: 'active',
    startDate: '2025-03-22T09:15:00.000Z',
    trialStartDate: null,
    trialEndDate: null,
    currentPeriodStart: '2026-07-22T00:00:00.000Z',
    currentPeriodEnd: '2026-08-22T00:00:00.000Z',
    cancelAtPeriodEnd: false,
    cancelledAt: null,
    renewalDate: '2026-08-22T00:00:00.000Z',
    price: 149,
    currency: 'EUR',
    billingInterval: 'monthly',
    createdAt: '2025-03-22T09:15:00.000Z',
    updatedAt: '2026-07-22T09:00:00.000Z',
  },
  {
    id: '01JS7G8H9J0K1L2M3N4P5Q6R7S8',
    companyId: '01J8G2H3J4K5L6M7N8P9Q0R1S2', // Bénin Express
    planId: '01JT0A1B2C3D4E5F6G7H8J9K0L1', // Starter
    status: 'cancelled',
    startDate: '2025-06-11T14:30:00.000Z',
    trialStartDate: null,
    trialEndDate: null,
    currentPeriodStart: '2026-07-09T00:00:00.000Z',
    currentPeriodEnd: '2026-08-09T00:00:00.000Z',
    cancelAtPeriodEnd: true,
    cancelledAt: null,
    renewalDate: '2026-08-09T00:00:00.000Z',
    price: 29,
    currency: 'EUR',
    billingInterval: 'monthly',
    createdAt: '2025-06-11T14:30:00.000Z',
    updatedAt: '2026-07-09T08:00:00.000Z',
  },
  {
    id: '01JS8H9J0K1L2M3N4P5Q6R7S8T9',
    companyId: '01J8H2J3K4L5M6N7P8Q9R0S1T2', // LoméTrans
    planId: '01JT0A1B2C3D4E5F6G7H8J9K0L1', // Starter
    status: 'trialing',
    startDate: '2026-08-03T08:00:00.000Z',
    trialStartDate: '2026-08-03T08:00:00.000Z',
    trialEndDate: '2026-08-17T00:00:00.000Z',
    currentPeriodStart: '2026-08-03T00:00:00.000Z',
    currentPeriodEnd: '2026-08-17T00:00:00.000Z',
    cancelAtPeriodEnd: false,
    cancelledAt: null,
    renewalDate: '2026-08-17T00:00:00.000Z',
    price: 29,
    currency: 'EUR',
    billingInterval: 'monthly',
    createdAt: '2026-08-03T08:00:00.000Z',
    updatedAt: '2026-08-03T08:00:00.000Z',
  },
  {
    id: '01JS9J0K1L2M3N4P5Q6R7S8T9U1',
    companyId: '01J8J2K3L4M5N6P7Q8R9S0T1U2', // Douala Cars
    planId: '01JT0B2C3D4E5F6G7H8J9K0L1M2', // Business
    status: 'paused',
    startDate: '2025-09-05T16:20:00.000Z',
    trialStartDate: null,
    trialEndDate: null,
    currentPeriodStart: '2026-07-10T00:00:00.000Z',
    currentPeriodEnd: '2026-08-09T00:00:00.000Z',
    cancelAtPeriodEnd: false,
    cancelledAt: null,
    renewalDate: '2026-08-09T00:00:00.000Z',
    price: 79,
    currency: 'EUR',
    billingInterval: 'monthly',
    pausedAt: '2026-08-02T09:30:00.000Z',
    createdAt: '2025-09-05T16:20:00.000Z',
    updatedAt: '2026-08-02T09:30:00.000Z',
  },
  {
    id: '01JS0K1L2M3N4P5Q6R7S8T9U1V2',
    companyId: '01J8K2L3M4N5P6Q7R8S9T0U1V2', // Libreville Moves
    planId: '01JT0D4E5F6G7H8J9K0L1M2N3P4', // Enterprise
    status: 'active',
    startDate: '2025-12-01T07:40:00.000Z',
    trialStartDate: null,
    trialEndDate: null,
    currentPeriodStart: '2026-07-20T00:00:00.000Z',
    currentPeriodEnd: '2026-08-20T00:00:00.000Z',
    cancelAtPeriodEnd: false,
    cancelledAt: null,
    renewalDate: '2026-08-20T00:00:00.000Z',
    price: 2990,
    currency: 'EUR',
    billingInterval: 'yearly',
    createdAt: '2025-12-01T07:40:00.000Z',
    updatedAt: '2026-07-20T09:00:00.000Z',
  },
];

export const MOCK_SUBSCRIPTIONS_BY_ID = Object.fromEntries(
  MOCK_SUBSCRIPTIONS.map((subscription) => [subscription.id, subscription]),
);

/* --------------------------------------------------------------------------
   Utilisation (SubscriptionUsage) — consommation dérivée des mocks métier
   -------------------------------------------------------------------------- */

export const MOCK_USAGE = {
  '01J8A2B3C4D5E6F7G8H9J0K1L2': {
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    vehiclesUsed: 12,
    driversUsed: 8,
    usersUsed: 12,
    agenciesUsed: 3,
    companiesUsed: 1,
    documentsUsed: 17,
    storageUsed: 12,
    tripsUsed: 6,
    fuelRecordsUsed: 6,
    maintenanceRecordsUsed: 3,
    updatedAt: '2026-08-04T18:00:00.000Z',
  },
  '01J8B2C3D4E5F6G7H8J9K0L1M2': {
    companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2', // Trans Express CI
    vehiclesUsed: 6,
    driversUsed: 4,
    usersUsed: 5,
    agenciesUsed: 1,
    companiesUsed: 1,
    documentsUsed: 6,
    storageUsed: 4,
    tripsUsed: 2,
    fuelRecordsUsed: 2,
    maintenanceRecordsUsed: 4,
    updatedAt: '2026-07-31T18:00:00.000Z',
  },
  '01J8C2D3E4F5G6H7J8K9L0M1N2': {
    companyId: '01J8C2D3E4F5G6H7J8K9L0M1N2', // LogiSud
    vehiclesUsed: 3,
    driversUsed: 2,
    usersUsed: 2,
    agenciesUsed: 1,
    companiesUsed: 1,
    documentsUsed: 13,
    storageUsed: 2,
    tripsUsed: 0,
    fuelRecordsUsed: 0,
    maintenanceRecordsUsed: 2,
    updatedAt: '2026-08-04T09:00:00.000Z',
  },
  '01J8D2E3F4G5H6J7K8L9M0N1P2': {
    companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2', // SenTrans
    vehiclesUsed: 9,
    driversUsed: 6,
    usersUsed: 6,
    agenciesUsed: 2,
    companiesUsed: 1,
    documentsUsed: 0,
    storageUsed: 5,
    tripsUsed: 2,
    fuelRecordsUsed: 2,
    maintenanceRecordsUsed: 2,
    updatedAt: '2026-08-03T11:00:00.000Z',
  },
  '01J8E2F3G4H5J6K7L8M9N0P1Q2': {
    companyId: '01J8E2F3G4H5J6K7L8M9N0P1Q2', // Bamakotrans
    vehiclesUsed: 5,
    driversUsed: 3,
    usersUsed: 3,
    agenciesUsed: 1,
    companiesUsed: 1,
    documentsUsed: 0,
    storageUsed: 3,
    tripsUsed: 1,
    fuelRecordsUsed: 2,
    maintenanceRecordsUsed: 2,
    updatedAt: '2026-07-25T18:00:00.000Z',
  },
  '01J8F2G3H4J5K6L7M8N9P0Q1R2': {
    companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', // OuagaLogistics
    vehiclesUsed: 8,
    driversUsed: 5,
    usersUsed: 5,
    agenciesUsed: 2,
    companiesUsed: 1,
    documentsUsed: 0,
    storageUsed: 6,
    tripsUsed: 2,
    fuelRecordsUsed: 2,
    maintenanceRecordsUsed: 1,
    updatedAt: '2026-08-04T14:00:00.000Z',
  },
  '01J8G2H3J4K5L6M7N8P9Q0R1S2': {
    companyId: '01J8G2H3J4K5L6M7N8P9Q0R1S2', // Bénin Express
    vehiclesUsed: 2,
    driversUsed: 1,
    usersUsed: 2,
    agenciesUsed: 1,
    companiesUsed: 1,
    documentsUsed: 0,
    storageUsed: 1,
    tripsUsed: 0,
    fuelRecordsUsed: 0,
    maintenanceRecordsUsed: 2,
    updatedAt: '2026-01-15T10:00:00.000Z',
  },
  '01J8H2J3K4L5M6N7P8Q9R0S1T2': {
    companyId: '01J8H2J3K4L5M6N7P8Q9R0S1T2', // LoméTrans
    vehiclesUsed: 1,
    driversUsed: 1,
    usersUsed: 2,
    agenciesUsed: 1,
    companiesUsed: 1,
    documentsUsed: 0,
    storageUsed: 1,
    tripsUsed: 2,
    fuelRecordsUsed: 2,
    maintenanceRecordsUsed: 1,
    updatedAt: '2026-08-04T17:00:00.000Z',
  },
  '01J8J2K3L4M5N6P7Q8R9S0T1U2': {
    companyId: '01J8J2K3L4M5N6P7Q8R9S0T1U2', // Douala Cars
    vehiclesUsed: 10,
    driversUsed: 7,
    usersUsed: 8,
    agenciesUsed: 3,
    companiesUsed: 1,
    documentsUsed: 0,
    storageUsed: 8,
    tripsUsed: 2,
    fuelRecordsUsed: 1,
    maintenanceRecordsUsed: 1,
    updatedAt: '2026-08-02T09:30:00.000Z',
  },
  '01J8K2L3M4N5P6Q7R8S9T0U1V2': {
    companyId: '01J8K2L3M4N5P6Q7R8S9T0U1V2', // Libreville Moves
    vehiclesUsed: 14,
    driversUsed: 9,
    usersUsed: 10,
    agenciesUsed: 4,
    companiesUsed: 1,
    documentsUsed: 0,
    storageUsed: 10,
    tripsUsed: 0,
    fuelRecordsUsed: 0,
    maintenanceRecordsUsed: 1,
    updatedAt: '2026-08-04T08:00:00.000Z',
  },
};

/** Carte entreprise → nom, réutilisée par les composants du module. */
export const MOCK_COMPANY_NAMES = Object.fromEntries(
  MOCK_COMPANIES.map((company) => [company.id, company.name]),
);

/** Documente la cohérence entre les abonnements et les entreprises. */
export const MOCK_SUBSCRIPTIONS_COMPANY_REFERENCE = Object.fromEntries(
  MOCK_SUBSCRIPTIONS.map((subscription) => [
    subscription.id,
    companyName(subscription.companyId),
  ]),
);
