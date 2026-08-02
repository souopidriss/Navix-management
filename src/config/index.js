import { APP_NAME, appConfig } from './app';
import { API_ENDPOINTS } from './endpoints';
import { STORAGE_KEYS, THEME_MODES } from './constants';

export { APP_NAME, appConfig };
export { API_ENDPOINTS };
export { STORAGE_KEYS, THEME_MODES };

const config = {
  app: appConfig,
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  },
  theme: {
    defaultMode: import.meta.env.VITE_DEFAULT_THEME || 'dark',
  },
};

export default config;
