/**
 * Navix Management — Points d'accès API (endpoints)
 * --------------------------------------------------------------------------
 * Source unique de vérité des chemins HTTP de chaque ressource. Les services
 * (`src/services/api`) référencent ces constantes — jamais d'URL codée en dur.
 * Les fonctions (ex. DETAIL) acceptent les paramètres d'identifiant.
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  VEHICLES: {
    LIST: '/vehicles',
    DETAIL: (id) => `/vehicles/${id}`,
  },
  DRIVERS: {
    LIST: '/drivers',
    DETAIL: (id) => `/drivers/${id}`,
  },
  COMPANIES: {
    LIST: '/companies',
    DETAIL: (id) => `/companies/${id}`,
  },
  ASSIGNMENTS: {
    LIST: '/assignments',
    DETAIL: (id) => `/assignments/${id}`,
    HISTORY: '/assignments/history',
  },
  FUEL: {
    LIST: '/fuel',
    STATS: '/fuel/stats',
  },
  MAINTENANCE: {
    LIST: '/maintenance',
    DETAIL: (id) => `/maintenance/${id}`,
  },
  SUBSCRIPTIONS: {
    LIST: '/subscriptions',
    CURRENT: '/subscriptions/current',
  },
  INVOICES: {
    LIST: '/invoices',
    DETAIL: (id) => `/invoices/${id}`,
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
  },
};
