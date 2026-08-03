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
  FUEL: '/dashboard/fuel',
  ENTRETIENS: '/dashboard/maintenance',
  FILES: '/dashboard/files',
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
  ROUTES.FUEL,
  ROUTES.ENTRETIENS,
  ROUTES.FILES,
  ROUTES.INVOICES,
  ROUTES.SUBSCRIPTIONS,
  ROUTES.NOTIFICATIONS,
  ROUTES.SETTINGS,
  ROUTES.PROFILE,
];
