/**
 * Navix Services — Configuration centralisée du client HTTP
 * --------------------------------------------------------------------------
 * Source unique de vérité pour le comportement réseau de l'application :
 *   - baseURL   : URL de base (API_URL + API_VERSION), pilotée par env Vite ;
 *   - timeout   : délai maximal d'une requête (ms) ;
 *   - headers   : en-têtes JSON par défaut (Accept, Content-Type) ;
 *   - mock      : active le mode simulé (backend absent) — actif par défaut ;
 *   - isDev     : flag de développement (logging des interceptors).
 *
 * Variables d'environnement :
 *   VITE_API_URL      → URL de base (défaut : '/api', relatif → proxy)
 *   VITE_API_VERSION  → version d'API (défaut : 'v1')
 *   VITE_API_TIMEOUT  → timeout en ms (défaut : 15000)
 *   VITE_API_MOCK     → 'false' désactive le mode mock (défaut : activé)
 *
 * Aucune URL n'est codée en dur hors de ce module.
 */
const env = import.meta.env;

const API_URL = env.VITE_API_URL || env.VITE_API_BASE_URL || '/api';
const API_VERSION = env.VITE_API_VERSION || 'v1';
const API_TIMEOUT = Number(env.VITE_API_TIMEOUT) || 15000;

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

export const apiConfig = {
  baseURL: `${trimTrailingSlash(API_URL)}/${API_VERSION}`,
  timeout: API_TIMEOUT,
  version: API_VERSION,
  mock: env.VITE_API_MOCK !== 'false',
  isDev: Boolean(env.DEV),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
};
