/**
 * Navix Management — Constantes de routes
 * --------------------------------------------------------------------------
 * Source unique de vérité pour tous les chemins de l'application.
 * Tous les composants de navigation doivent utiliser `ROUTES.*`
 * (jamais de chaînes codées en dur).
 */

export const ROUTES = {
  /* Publiques */
  HOME: '/',
  MAINTENANCE: '/maintenance',
  PUBLIC_FEATURES: '/fonctionnalites',
  PUBLIC_PRICING: '/tarifs',
  PUBLIC_ABOUT: '/a-propos',
  PUBLIC_RESOURCES: '/ressources',
  PUBLIC_CONTACT: '/contact',

  /* Authentification */
  LOGIN: '/login',
  REGISTER: '/register',
  REGISTER_CLIENT: '/register/client',
  REGISTER_DRIVER: '/register/driver',
  REGISTER_PARTNER: '/register/partner',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  /* Erreurs */
  UNAUTHORIZED: '/403',

  /* Privées (dashboard) */
  DASHBOARD: '/dashboard',
  COMPANIES: '/dashboard/companies',
  COMPANIES_CREATE: '/dashboard/companies/new',
  COMPANIES_DETAIL: '/dashboard/companies/:id',
  COMPANIES_EDIT: '/dashboard/companies/:id/edit',
  AGENCIES: '/dashboard/agencies',
  AGENCIES_CREATE: '/dashboard/agencies/new',
  AGENCIES_DETAIL: '/dashboard/agencies/:id',
  AGENCIES_EDIT: '/dashboard/agencies/:id/edit',
  AGENCIES_STATISTICS: '/dashboard/agencies/:id/statistics',
  VEHICLES: '/dashboard/vehicles',
  VEHICLES_CREATE: '/dashboard/vehicles/new',
  VEHICLES_DETAIL: '/dashboard/vehicles/:id',
  VEHICLES_EDIT: '/dashboard/vehicles/:id/edit',
  DRIVERS: '/dashboard/drivers',
  DRIVERS_CREATE: '/dashboard/drivers/new',
  DRIVERS_DETAIL: '/dashboard/drivers/:id',
  DRIVERS_EDIT: '/dashboard/drivers/:id/edit',
  ASSIGNMENTS: '/dashboard/assignments',
  ASSIGNMENTS_CREATE: '/dashboard/assignments/new',
  ASSIGNMENTS_DETAIL: '/dashboard/assignments/:id',
  ASSIGNMENTS_EDIT: '/dashboard/assignments/:id/edit',
  ASSIGNMENTS_HISTORY: '/dashboard/assignments/history',
  TRIPS: '/dashboard/trips',
  TRIPS_CREATE: '/dashboard/trips/new',
  TRIPS_DETAIL: '/dashboard/trips/:id',
  TRIPS_EDIT: '/dashboard/trips/:id/edit',
  TRIPS_HISTORY: '/dashboard/trips/history',
  FUEL: '/dashboard/fuel',
  FUEL_CREATE: '/dashboard/fuel/new',
  FUEL_DETAIL: '/dashboard/fuel/:id',
  FUEL_EDIT: '/dashboard/fuel/:id/edit',
  FUEL_STATISTICS: '/dashboard/fuel/statistics',
  ENTRETIENS: '/dashboard/maintenance',
  MAINTENANCE_CREATE: '/dashboard/maintenance/new',
  MAINTENANCE_DETAIL: '/dashboard/maintenance/:id',
  MAINTENANCE_EDIT: '/dashboard/maintenance/:id/edit',
  MAINTENANCE_CALENDAR: '/dashboard/maintenance/calendar',
  MAINTENANCE_STATISTICS: '/dashboard/maintenance/statistics',
  PARTNERS: '/dashboard/partners',
  PARTNERS_CREATE: '/dashboard/partners/new',
  PARTNERS_DETAIL: '/dashboard/partners/:id',
  PARTNERS_EDIT: '/dashboard/partners/:id/edit',
  FILES: '/dashboard/files',
  FILES_CREATE: '/dashboard/files/new',
  FILES_DETAIL: '/dashboard/files/:id',
  FILES_EDIT: '/dashboard/files/:id/edit',
  FILE_TYPES: '/dashboard/files/file-types',
  INVOICES: '/dashboard/invoices',
  BILLING: '/dashboard/billing',
  BILLING_INVOICES: '/dashboard/billing/invoices',
  BILLING_INVOICE_DETAIL: '/dashboard/billing/invoices/:id',
  BILLING_PAYMENTS: '/dashboard/billing/payments',
  BILLING_PAYMENT_DETAIL: '/dashboard/billing/payments/:id',
  BILLING_HISTORY: '/dashboard/billing/history',
  BILLING_SETTINGS: '/dashboard/billing/settings',
  SUBSCRIPTIONS: '/dashboard/subscriptions',
  SUBSCRIPTIONS_PLANS: '/dashboard/subscriptions/plans',
  SUBSCRIPTIONS_USAGE: '/dashboard/subscriptions/usage',
  SUBSCRIPTIONS_DETAIL: '/dashboard/subscriptions/:id',
  NOTIFICATIONS: '/dashboard/notifications',
  NOTIFICATIONS_DETAIL: '/dashboard/notifications/:id',
  AUDIT_LOGS: '/dashboard/audit-logs',
  AUDIT_LOGS_DETAIL: '/dashboard/audit-logs/:id',
  AUDIT_USER_ACTIVITY: '/dashboard/audit-logs/user/:userId',
  USERS: '/dashboard/users',
  USERS_CREATE: '/dashboard/users/new',
  USERS_DETAIL: '/dashboard/users/:id',
  USERS_EDIT: '/dashboard/users/:id/edit',
  ROLES: '/dashboard/roles',
  ROLES_DETAIL: '/dashboard/roles/:id',
  PERMISSIONS: '/dashboard/permissions',
  REPORTS: '/dashboard/reports',
  REPORTS_FLEET: '/dashboard/reports/fleet',
  REPORTS_VEHICLES: '/dashboard/reports/vehicles',
  REPORTS_DRIVERS: '/dashboard/reports/drivers',
  REPORTS_ASSIGNMENTS: '/dashboard/reports/assignments',
  REPORTS_TRIPS: '/dashboard/reports/trips',
  REPORTS_FUEL: '/dashboard/reports/fuel',
  REPORTS_MAINTENANCE: '/dashboard/reports/maintenance',
  REPORTS_DOCUMENTS: '/dashboard/reports/documents',
  REPORTS_FINANCIAL: '/dashboard/reports/financial',
  REPORTS_SUBSCRIPTIONS: '/dashboard/reports/subscriptions',
  REPORTS_AUDIT: '/dashboard/reports/audit',
  REPORTS_COMPANIES: '/dashboard/reports/companies',
  REPORTS_CUSTOM: '/dashboard/reports/custom',
  SETTINGS: '/dashboard/settings',
  SETTINGS_GENERAL: '/dashboard/settings/general',
  SETTINGS_COMPANY: '/dashboard/settings/company',
  SETTINGS_FLEET: '/dashboard/settings/fleet',
  SETTINGS_MAINTENANCE: '/dashboard/settings/maintenance',
  SETTINGS_FUEL: '/dashboard/settings/fuel',
  SETTINGS_DOCUMENTS: '/dashboard/settings/documents',
  SETTINGS_NOTIFICATIONS: '/dashboard/settings/notifications',
  SETTINGS_USER: '/dashboard/settings/user',
  SETTINGS_APPEARANCE: '/dashboard/settings/appearance',
  SETTINGS_TABLES: '/dashboard/settings/tables',
  SETTINGS_REGIONAL: '/dashboard/settings/regional',
  SETTINGS_BILLING: '/dashboard/settings/billing',
  SETTINGS_SAAS: '/dashboard/settings/saas',
  SETTINGS_SECURITY: '/dashboard/settings/security',
  SETTINGS_SYSTEM: '/dashboard/settings/system',
  PROFILE: '/dashboard/profile',

  /* Espace Super Admin — Finance plateforme */
  SA_FINANCE: '/dashboard/sa-finance',
  SA_FINANCE_TRANSACTIONS: '/dashboard/sa-finance/transactions',
  SA_FINANCE_TRANSACTION_DETAIL: '/dashboard/sa-finance/transactions/:id',
  SA_FINANCE_REPORTS: '/dashboard/sa-finance/reports',

  /* Espace Client */
  CLIENT_ROOT: '/client',
  CLIENT_DASHBOARD: '/client/dashboard',
  CLIENT_SERVICES: '/client/services',
  CLIENT_VEHICLES: '/client/vehicles',
  CLIENT_VEHICLES_DETAIL: '/client/vehicles/:vehicleId',
  CLIENT_DRIVERS: '/client/drivers',
  CLIENT_DRIVERS_DETAIL: '/client/drivers/:driverId',
  CLIENT_ASSIGNMENTS: '/client/assignments',
  CLIENT_REQUESTS: '/client/requests',
  CLIENT_REQUESTS_NEW: '/client/requests/new',
  CLIENT_REQUESTS_DETAIL: '/client/requests/:id',
  CLIENT_TRIPS: '/client/trips',
  CLIENT_TRIPS_DETAIL: '/client/trips/:tripId',
  CLIENT_MAINTENANCE: '/client/maintenance',
  CLIENT_FUEL: '/client/fuel',
  CLIENT_DOCUMENTS: '/client/documents',
  CLIENT_INVOICES: '/client/invoices',
  CLIENT_REPORTS: '/client/reports',
  CLIENT_NOTIFICATIONS: '/client/notifications',
  CLIENT_PROFILE: '/client/profile',
  CLIENT_FINANCE: '/client/finance',
  CLIENT_FINANCE_FUNDS: '/client/finance/funds',
  CLIENT_FINANCE_TRANSACTIONS: '/client/finance/transactions',
  CLIENT_FINANCE_TRANSACTION_DETAIL: '/client/finance/transactions/:transactionId',

  /* Espace Chauffeur */
  DRIVER_ROOT: '/driver',
  DRIVER_DASHBOARD: '/driver/dashboard',
  DRIVER_TRIPS: '/driver/trips',
  DRIVER_TRIPS_DETAIL: '/driver/trips/:id',
  DRIVER_VEHICLE: '/driver/vehicle',
  DRIVER_FUEL: '/driver/fuel',
  DRIVER_MAINTENANCE: '/driver/maintenance',
  DRIVER_INCIDENTS: '/driver/incidents',
  DRIVER_DOCUMENTS: '/driver/documents',
  DRIVER_NOTIFICATIONS: '/driver/notifications',
  DRIVER_PROFILE: '/driver/profile',

  /* Espace Partenaire */
  PARTNER_ROOT: '/partner',
  PARTNER_DASHBOARD: '/partner/dashboard',
  PARTNER_VEHICLES: '/partner/vehicles',
  PARTNER_MISSIONS: '/partner/missions',
  PARTNER_MISSIONS_DETAIL: '/partner/missions/:id',
  PARTNER_MISSIONS_NEW: '/partner/missions/new',
  PARTNER_CLIENTS: '/partner/clients',
  PARTNER_CLIENTS_DETAIL: '/partner/clients/:id',
  PARTNER_CLIENTS_NEW: '/partner/clients/new',
  PARTNER_FINANCE: '/partner/finance',
  PARTNER_FINANCE_FUNDS: '/partner/finance/funds',
  PARTNER_FINANCE_TRANSACTIONS: '/partner/finance/transactions',
  PARTNER_FINANCE_TRANSACTION_DETAIL: '/partner/finance/transactions/:transactionId',
  PARTNER_FINANCE_REVENUE: '/partner/finance/revenue',
  PARTNER_FINANCE_REVENUE_DETAIL: '/partner/finance/revenue/:revenueId',
  PARTNER_FINANCE_INVOICES: '/partner/finance/invoices',
  PARTNER_FINANCE_INVOICE_DETAIL: '/partner/finance/invoices/:invoiceId',
  PARTNER_DOCUMENTS: '/partner/documents',
  PARTNER_DOCUMENTS_DETAIL: '/partner/documents/:id',
  PARTNER_NOTIFICATIONS: '/partner/notifications',
  PARTNER_REQUESTS: '/partner/requests',
  PARTNER_REQUESTS_DETAIL: '/partner/requests/:requestId',
  PARTNER_CONTRACTS: '/partner/contracts',
  PARTNER_CONTRACTS_DETAIL: '/partner/contracts/:contractId',
  PARTNER_ALERTS: '/partner/alerts',
  PARTNER_CALENDAR: '/partner/calendar',
  PARTNER_ANALYTICS: '/partner/analytics',
  PARTNER_SUPPORT: '/partner/support',
  PARTNER_SUPPORT_DETAIL: '/partner/support/:ticketId',
  PARTNER_PROFILE: '/partner/profile',
  PARTNER_SETTINGS: '/partner/settings',
};

export const PUBLIC_ROUTES = [ROUTES.HOME, ROUTES.MAINTENANCE];

export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.REGISTER_CLIENT,
  ROUTES.REGISTER_DRIVER,
  ROUTES.REGISTER_PARTNER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
];

/**
 * Route d'atterrissage post-connexion.
 * Retourne la page de destination valide pour l'utilisateur courant, sinon le
 * Dashboard. Point d'extension : une landing page dédiée (ou une landing par
 * rôle) pourra être branchée ici sans toucher aux guards.
 * @returns {string}
 */
export const resolveLandingRoute = (role) => {
  if (role === 'client_enterprise' || role === 'client_individual') {
    return ROUTES.CLIENT_DASHBOARD;
  }
  if (role === 'driver') {
    return ROUTES.DRIVER_DASHBOARD;
  }
  if (role === 'partner') {
    return ROUTES.PARTNER_DASHBOARD;
  }
  return ROUTES.DASHBOARD;
};

/* Path builders Client */
export const clientRequestDetailPath = (id) => `${ROUTES.CLIENT_REQUESTS}/${id}`;
export const clientTripDetailPath = (id) => `${ROUTES.CLIENT_TRIPS}/${id}`;
export const clientVehicleDetailPath = (id) => `${ROUTES.CLIENT_VEHICLES}/${id}`;
export const clientDriverDetailPath = (id) => `${ROUTES.CLIENT_DRIVERS}/${id}`;
export const transactionDetailPath = (id) => `${ROUTES.CLIENT_FINANCE_TRANSACTIONS}/${id}`;
export const partnerTransactionDetailPath = (id) => `${ROUTES.PARTNER_FINANCE_TRANSACTIONS}/${id}`;
export const partnerRevenueDetailPath = (id) => `${ROUTES.PARTNER_FINANCE_REVENUE}/${id}`;
export const partnerInvoiceDetailPath = (id) => `${ROUTES.PARTNER_FINANCE_INVOICES}/${id}`;
export const partnerRequestDetailPath = (id) => `${ROUTES.PARTNER_REQUESTS}/${id}`;
export const partnerContractDetailPath = (id) => `${ROUTES.PARTNER_CONTRACTS}/${id}`;

/** Construit le chemin de détail d'une entreprise. */
export const companyDetailPath = (id) => `${ROUTES.COMPANIES}/${id}`;

/** Construit le chemin d'édition d'une entreprise. */
export const companyEditPath = (id) => `${ROUTES.COMPANIES}/${id}/edit`;

/** Construit le chemin de détail d'une agence. */
export const agencyDetailPath = (id) => `${ROUTES.AGENCIES}/${id}`;

/** Construit le chemin d'édition d'une agence. */
export const agencyEditPath = (id) => `${ROUTES.AGENCIES}/${id}/edit`;

/** Construit le chemin des statistiques d'une agence. */
export const agencyStatisticsPath = (id) => `${ROUTES.AGENCIES}/${id}/statistics`;

/** Construit le chemin de détail d'un véhicule. */
export const vehicleDetailPath = (id) => `${ROUTES.VEHICLES}/${id}`;

/** Construit le chemin d'édition d'un véhicule. */
export const vehicleEditPath = (id) => `${ROUTES.VEHICLES}/${id}/edit`;

/** Construit le chemin de détail d'une mission partenaire. */
export const partnerMissionDetailPath = (id) => `${ROUTES.PARTNER_MISSIONS}/${id}`;

/** Construit le chemin de détail d'un client partenaire. */
export const partnerClientDetailPath = (id) => `${ROUTES.PARTNER_CLIENTS}/${id}`;

/** Construit le chemin de détail d'un chauffeur. */
export const driverDetailPath = (id) => `${ROUTES.DRIVERS}/${id}`;

/** Construit le chemin d'édition d'un chauffeur. */
export const driverEditPath = (id) => `${ROUTES.DRIVERS}/${id}/edit`;

/** Construit le chemin de détail d'une affectation. */
export const assignmentDetailPath = (id) => `${ROUTES.ASSIGNMENTS}/${id}`;

/** Construit le chemin d'édition d'une affectation. */
export const assignmentEditPath = (id) => `${ROUTES.ASSIGNMENTS}/${id}/edit`;

/** Construit le chemin de détail d'un trajet. */
export const tripDetailPath = (id) => `${ROUTES.TRIPS}/${id}`;

/** Construit le chemin de détail d'un trajet côté chauffeur. */
export const driverTripDetailPath = (id) => `${ROUTES.DRIVER_TRIPS}/${id}`;

/** Construit le chemin d'édition d'un trajet. */
export const tripEditPath = (id) => `${ROUTES.TRIPS}/${id}/edit`;

/** Construit le chemin de détail d'un plein de carburant. */
export const fuelDetailPath = (id) => `${ROUTES.FUEL}/${id}`;

/** Construit le chemin d'édition d'un plein de carburant. */
export const fuelEditPath = (id) => `${ROUTES.FUEL}/${id}/edit`;

/** Construit le chemin de détail d'un entretien. */
export const maintenanceDetailPath = (id) => `${ROUTES.ENTRETIENS}/${id}`;

/** Construit le chemin d'édition d'un entretien. */
export const maintenanceEditPath = (id) => `${ROUTES.ENTRETIENS}/${id}/edit`;

/** Construit le chemin de détail d'un partenaire. */
export const partnerDetailPath = (id) => `${ROUTES.PARTNERS}/${id}`;

/** Construit le chemin d'édition d'un partenaire. */
export const partnerEditPath = (id) => `${ROUTES.PARTNERS}/${id}/edit`;

/** Construit le chemin de détail d'un document. */
export const documentDetailPath = (id) => `${ROUTES.FILES}/${id}`;

/** Construit le chemin d'édition d'un document. */
export const documentEditPath = (id) => `${ROUTES.FILES}/${id}/edit`;

/** Construit le chemin de détail d'un abonnement. */
export const subscriptionDetailPath = (id) => `${ROUTES.SUBSCRIPTIONS}/${id}`;

/** Construit le chemin de détail d'une facture. */
export const invoiceDetailPath = (id) => `${ROUTES.BILLING_INVOICES}/${id}`;

/** Construit le chemin de détail d'un paiement. */
export const paymentDetailPath = (id) => `${ROUTES.BILLING_PAYMENTS}/${id}`;

/** Construit le chemin de détail d'une notification. */
export const notificationDetailPath = (id) => `${ROUTES.NOTIFICATIONS}/${id}`;

/** Construit le chemin de détail d'une entrée du journal des actions. */
export const auditLogDetailPath = (id) => `${ROUTES.AUDIT_LOGS}/${id}`;

/** Construit le chemin de l'activité d'un utilisateur dans le journal. */
export const auditUserActivityPath = (userId) => `${ROUTES.AUDIT_LOGS}/user/${userId}`;

/** Construit le chemin de détail d'un utilisateur. */
export const userDetailPath = (id) => `${ROUTES.USERS}/${id}`;

/** Construit le chemin d'édition d'un utilisateur. */
export const userEditPath = (id) => `${ROUTES.USERS}/${id}/edit`;

/** Construit le chemin de détail d'un rôle. */
export const roleDetailPath = (id) => `${ROUTES.ROLES}/${id}`;

/** Construit le chemin d'un rapport de catégorie. */
export const reportCategoryPath = (id) => `${ROUTES.REPORTS}/${id}`;

/** Construit le chemin du rapport personnalisé. */
export const customReportPath = () => ROUTES.REPORTS_CUSTOM;

/** Construit le chemin de détail d'une transaction Super Admin. */
export const saTransactionDetailPath = (id) => `${ROUTES.SA_FINANCE_TRANSACTIONS}/${id}`;
export const saFinanceReportsPath = () => ROUTES.SA_FINANCE_REPORTS;

export const PRIVATE_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.COMPANIES,
  ROUTES.COMPANIES_CREATE,
  ROUTES.COMPANIES_DETAIL,
  ROUTES.COMPANIES_EDIT,
  ROUTES.AGENCIES,
  ROUTES.AGENCIES_CREATE,
  ROUTES.AGENCIES_DETAIL,
  ROUTES.AGENCIES_EDIT,
  ROUTES.AGENCIES_STATISTICS,
  ROUTES.VEHICLES,
  ROUTES.VEHICLES_CREATE,
  ROUTES.VEHICLES_DETAIL,
  ROUTES.VEHICLES_EDIT,
  ROUTES.DRIVERS,
  ROUTES.DRIVERS_CREATE,
  ROUTES.DRIVERS_DETAIL,
  ROUTES.DRIVERS_EDIT,
  ROUTES.ASSIGNMENTS,
  ROUTES.ASSIGNMENTS_CREATE,
  ROUTES.ASSIGNMENTS_DETAIL,
  ROUTES.ASSIGNMENTS_EDIT,
  ROUTES.ASSIGNMENTS_HISTORY,
  ROUTES.TRIPS,
  ROUTES.TRIPS_CREATE,
  ROUTES.TRIPS_DETAIL,
  ROUTES.TRIPS_EDIT,
  ROUTES.TRIPS_HISTORY,
  ROUTES.FUEL,
  ROUTES.FUEL_CREATE,
  ROUTES.FUEL_DETAIL,
  ROUTES.FUEL_EDIT,
  ROUTES.FUEL_STATISTICS,
  ROUTES.ENTRETIENS,
  ROUTES.MAINTENANCE_CREATE,
  ROUTES.MAINTENANCE_DETAIL,
  ROUTES.MAINTENANCE_EDIT,
  ROUTES.MAINTENANCE_CALENDAR,
  ROUTES.MAINTENANCE_STATISTICS,
  ROUTES.PARTNERS,
  ROUTES.PARTNERS_CREATE,
  ROUTES.PARTNERS_DETAIL,
  ROUTES.PARTNERS_EDIT,
  ROUTES.FILES,
  ROUTES.FILES_CREATE,
  ROUTES.FILES_DETAIL,
  ROUTES.FILES_EDIT,
  ROUTES.FILE_TYPES,
  ROUTES.INVOICES,
  ROUTES.BILLING,
  ROUTES.BILLING_INVOICES,
  ROUTES.BILLING_INVOICE_DETAIL,
  ROUTES.BILLING_PAYMENTS,
  ROUTES.BILLING_PAYMENT_DETAIL,
  ROUTES.BILLING_HISTORY,
  ROUTES.BILLING_SETTINGS,
  ROUTES.SUBSCRIPTIONS,
  ROUTES.SUBSCRIPTIONS_PLANS,
  ROUTES.SUBSCRIPTIONS_USAGE,
  ROUTES.SUBSCRIPTIONS_DETAIL,
  ROUTES.NOTIFICATIONS,
  ROUTES.NOTIFICATIONS_DETAIL,
  ROUTES.AUDIT_LOGS,
  ROUTES.AUDIT_LOGS_DETAIL,
  ROUTES.AUDIT_USER_ACTIVITY,
  ROUTES.USERS,
  ROUTES.USERS_CREATE,
  ROUTES.USERS_DETAIL,
  ROUTES.USERS_EDIT,
  ROUTES.ROLES,
  ROUTES.ROLES_DETAIL,
  ROUTES.PERMISSIONS,
  ROUTES.REPORTS,
  ROUTES.REPORTS_FLEET,
  ROUTES.REPORTS_VEHICLES,
  ROUTES.REPORTS_DRIVERS,
  ROUTES.REPORTS_ASSIGNMENTS,
  ROUTES.REPORTS_TRIPS,
  ROUTES.REPORTS_FUEL,
  ROUTES.REPORTS_MAINTENANCE,
  ROUTES.REPORTS_DOCUMENTS,
  ROUTES.REPORTS_FINANCIAL,
  ROUTES.REPORTS_SUBSCRIPTIONS,
  ROUTES.REPORTS_AUDIT,
  ROUTES.REPORTS_COMPANIES,
  ROUTES.REPORTS_CUSTOM,
  ROUTES.SETTINGS,
  ROUTES.SETTINGS_GENERAL,
  ROUTES.SETTINGS_COMPANY,
  ROUTES.SETTINGS_FLEET,
  ROUTES.SETTINGS_MAINTENANCE,
  ROUTES.SETTINGS_FUEL,
  ROUTES.SETTINGS_DOCUMENTS,
  ROUTES.SETTINGS_NOTIFICATIONS,
  ROUTES.SETTINGS_USER,
  ROUTES.SETTINGS_APPEARANCE,
  ROUTES.SETTINGS_TABLES,
  ROUTES.SETTINGS_REGIONAL,
  ROUTES.SETTINGS_BILLING,
  ROUTES.SETTINGS_SAAS,
  ROUTES.SETTINGS_SECURITY,
  ROUTES.SETTINGS_SYSTEM,
  ROUTES.PROFILE,
  ROUTES.SA_FINANCE,
  ROUTES.SA_FINANCE_TRANSACTIONS,
  ROUTES.SA_FINANCE_TRANSACTION_DETAIL,
  ROUTES.SA_FINANCE_REPORTS,
  ROUTES.CLIENT_ROOT,
  ROUTES.CLIENT_DASHBOARD,
  ROUTES.CLIENT_SERVICES,
  ROUTES.CLIENT_VEHICLES,
  ROUTES.CLIENT_VEHICLES_DETAIL,
  ROUTES.CLIENT_DRIVERS,
  ROUTES.CLIENT_DRIVERS_DETAIL,
  ROUTES.CLIENT_ASSIGNMENTS,
  ROUTES.CLIENT_REQUESTS,
  ROUTES.CLIENT_REQUESTS_NEW,
  ROUTES.CLIENT_REQUESTS_DETAIL,
  ROUTES.CLIENT_TRIPS,
  ROUTES.CLIENT_TRIPS_DETAIL,
  ROUTES.CLIENT_MAINTENANCE,
  ROUTES.CLIENT_FUEL,
  ROUTES.CLIENT_DOCUMENTS,
  ROUTES.CLIENT_INVOICES,
  ROUTES.CLIENT_REPORTS,
  ROUTES.CLIENT_NOTIFICATIONS,
  ROUTES.CLIENT_PROFILE,
  ROUTES.CLIENT_FINANCE,
  ROUTES.CLIENT_FINANCE_FUNDS,
  ROUTES.CLIENT_FINANCE_TRANSACTIONS,
  ROUTES.CLIENT_FINANCE_TRANSACTION_DETAIL,
  ROUTES.DRIVER_ROOT,
  ROUTES.DRIVER_DASHBOARD,
  ROUTES.DRIVER_TRIPS,
  ROUTES.DRIVER_TRIPS_DETAIL,
  ROUTES.DRIVER_VEHICLE,
  ROUTES.DRIVER_FUEL,
  ROUTES.DRIVER_MAINTENANCE,
  ROUTES.DRIVER_INCIDENTS,
  ROUTES.DRIVER_DOCUMENTS,
  ROUTES.DRIVER_NOTIFICATIONS,
  ROUTES.DRIVER_PROFILE,
  ROUTES.PARTNER_ROOT,
  ROUTES.PARTNER_DASHBOARD,
  ROUTES.PARTNER_VEHICLES,
  ROUTES.PARTNER_MISSIONS,
  ROUTES.PARTNER_MISSIONS_DETAIL,
  ROUTES.PARTNER_MISSIONS_NEW,
  ROUTES.PARTNER_CLIENTS,
  ROUTES.PARTNER_CLIENTS_DETAIL,
  ROUTES.PARTNER_CLIENTS_NEW,
  ROUTES.PARTNER_FINANCE,
  ROUTES.PARTNER_FINANCE_FUNDS,
  ROUTES.PARTNER_FINANCE_TRANSACTIONS,
  ROUTES.PARTNER_FINANCE_TRANSACTION_DETAIL,
  ROUTES.PARTNER_FINANCE_REVENUE,
  ROUTES.PARTNER_FINANCE_REVENUE_DETAIL,
  ROUTES.PARTNER_FINANCE_INVOICES,
  ROUTES.PARTNER_FINANCE_INVOICE_DETAIL,
  ROUTES.PARTNER_DOCUMENTS,
  ROUTES.PARTNER_DOCUMENTS_DETAIL,
  ROUTES.PARTNER_REQUESTS,
  ROUTES.PARTNER_REQUESTS_DETAIL,
  ROUTES.PARTNER_CONTRACTS,
  ROUTES.PARTNER_CONTRACTS_DETAIL,
  ROUTES.PARTNER_NOTIFICATIONS,
  ROUTES.PARTNER_ALERTS,
  ROUTES.PARTNER_CALENDAR,
  ROUTES.PARTNER_ANALYTICS,
  ROUTES.PARTNER_SUPPORT,
  ROUTES.PARTNER_SUPPORT_DETAIL,
  ROUTES.PARTNER_PROFILE,
  ROUTES.PARTNER_SETTINGS,
];
