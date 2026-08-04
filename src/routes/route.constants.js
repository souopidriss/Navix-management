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
  FILES: '/dashboard/files',
  FILES_CREATE: '/dashboard/files/new',
  FILES_DETAIL: '/dashboard/files/:id',
  FILES_EDIT: '/dashboard/files/:id/edit',
  FILE_TYPES: '/dashboard/files/file-types',
  INVOICES: '/dashboard/invoices',
  SUBSCRIPTIONS: '/dashboard/subscriptions',
  NOTIFICATIONS: '/dashboard/notifications',
  SETTINGS: '/dashboard/settings',
  PROFILE: '/dashboard/profile',
};

export const PUBLIC_ROUTES = [ROUTES.HOME, ROUTES.MAINTENANCE];

export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD];

/** Construit le chemin de détail d'une entreprise. */
export const companyDetailPath = (id) => `${ROUTES.COMPANIES}/${id}`;

/** Construit le chemin d'édition d'une entreprise. */
export const companyEditPath = (id) => `${ROUTES.COMPANIES}/${id}/edit`;

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

/** Construit le chemin de détail d'un document. */
export const documentDetailPath = (id) => `${ROUTES.FILES}/${id}`;

/** Construit le chemin d'édition d'un document. */
export const documentEditPath = (id) => `${ROUTES.FILES}/${id}/edit`;

export const PRIVATE_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.COMPANIES,
  ROUTES.COMPANIES_CREATE,
  ROUTES.COMPANIES_DETAIL,
  ROUTES.COMPANIES_EDIT,
  ROUTES.AGENCIES,
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
  ROUTES.FILES,
  ROUTES.FILES_CREATE,
  ROUTES.FILES_DETAIL,
  ROUTES.FILES_EDIT,
  ROUTES.FILE_TYPES,
  ROUTES.INVOICES,
  ROUTES.SUBSCRIPTIONS,
  ROUTES.NOTIFICATIONS,
  ROUTES.SETTINGS,
  ROUTES.PROFILE,
];
