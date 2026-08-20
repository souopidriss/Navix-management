export const SUBSCRIPTION_STATUSES = [
  'trialing', 'active', 'past_due', 'paused', 'cancelled', 'expired',
];

export const BILLING_INTERVALS = ['monthly', 'yearly'];

export const FEATURES = [
  { code: 'vehicles', name: 'Gestion des véhicules', description: 'Suivi de la flotte, immatriculations, groupes et statuts.', category: 'fleet' },
  { code: 'drivers', name: 'Gestion des chauffeurs', description: 'Dossiers chauffeurs, permis, disponibilités et affectations.', category: 'fleet' },
  { code: 'assignments', name: 'Affectations', description: 'Planification des véhicules et chauffeurs sur les missions.', category: 'operations' },
  { code: 'trips', name: 'Trajets', description: 'Suivi complet des trajets : itinéraires, distances et statuts.', category: 'operations' },
  { code: 'fuel', name: 'Carburant', description: 'Gestion des pleins, stations et coûts de carburant.', category: 'operations' },
  { code: 'maintenance', name: 'Maintenance', description: 'Entretiens préventifs et curatifs, ateliers et coûts.', category: 'operations' },
  { code: 'documents', name: 'Documents', description: 'Dépôt, classement et expiration des documents liés.', category: 'administration' },
  { code: 'agencies', name: 'Agences & sites', description: 'Gestion multi-sites : agences, dépôts, ateliers et garages.', category: 'administration' },
  { code: 'notifications', name: 'Notifications', description: 'Alertes et notifications en temps réel sur la flotte.', category: 'administration' },
  { code: 'auditLog', name: "Journal d'audit", description: 'Traçabilité complète des actions et modifications.', category: 'administration' },
  { code: 'reports', name: 'Rapports', description: 'Rapports personnalisables sur l\'activité de la flotte.', category: 'analytics' },
  { code: 'analytics', name: 'Analytiques', description: 'Tableaux de bord analytiques et indicateurs de performance.', category: 'analytics' },
  { code: 'financialManagement', name: 'Gestion financière', description: 'Suivi des coûts, budgets et facturation de la flotte.', category: 'analytics' },
  { code: 'multiAgency', name: 'Multi-agences', description: 'Consolidation et pilotage de plusieurs agences.', category: 'growth' },
  { code: 'apiAccess', name: 'Accès API', description: 'Intégrations programmatiques avec l\'API Navix.', category: 'growth' },
  { code: 'advancedExport', name: 'Export avancé', description: 'Exports massifs et personnalisés de toutes les données.', category: 'growth' },
  { code: 'advancedPermissions', name: 'Permissions avancées', description: 'Rôles et permissions fins pour chaque utilisateur.', category: 'growth' },
];

export const PLAN_FEATURES = {
  starter: ['vehicles', 'drivers', 'assignments', 'trips', 'fuel', 'maintenance', 'documents', 'notifications'],
  business: ['vehicles', 'drivers', 'assignments', 'trips', 'fuel', 'maintenance', 'documents', 'notifications', 'agencies', 'reports', 'analytics'],
  professional: ['vehicles', 'drivers', 'assignments', 'trips', 'fuel', 'maintenance', 'documents', 'notifications', 'agencies', 'reports', 'analytics', 'financialManagement', 'auditLog', 'advancedExport'],
  enterprise: ['vehicles', 'drivers', 'assignments', 'trips', 'fuel', 'maintenance', 'documents', 'notifications', 'agencies', 'reports', 'analytics', 'financialManagement', 'auditLog', 'advancedExport', 'multiAgency', 'apiAccess', 'advancedPermissions'],
};
