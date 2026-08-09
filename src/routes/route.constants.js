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

  /* Authentification */
  LOGIN: '/login',
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
};

export const PUBLIC_ROUTES = [ROUTES.HOME, ROUTES.MAINTENANCE];

export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD];

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
];
