import { APP_NAME, appConfig } from './app';
import { API_ENDPOINTS } from './endpoints';
import { STORAGE_KEYS, THEME_MODES } from './constants';

export { APP_NAME, appConfig };
export { API_ENDPOINTS };
export { STORAGE_KEYS, THEME_MODES };

/*
 * La configuration HTTP (baseURL, timeout, version, mode mock) est
 * centralisée dans `src/services/config/apiConfig` — source unique de
 * vérité pour le client Axios. Ne pas recréer de config API ici.
 */
const config = {
  app: appConfig,
  theme: {
    defaultMode: import.meta.env.VITE_DEFAULT_THEME || 'dark',
  },
};

export default config;
