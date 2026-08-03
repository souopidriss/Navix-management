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
  DRIVERS: '/dashboard/drivers',
  ASSIGNMENTS: '/dashboard/assignments',
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

export const PRIVATE_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.COMPANIES,
  ROUTES.COMPANIES_CREATE,
  ROUTES.COMPANIES_DETAIL,
  ROUTES.COMPANIES_EDIT,
  ROUTES.AGENCIES,
  ROUTES.VEHICLES,
  ROUTES.DRIVERS,
  ROUTES.ASSIGNMENTS,
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
