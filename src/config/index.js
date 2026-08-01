export { API_ENDPOINTS } from './endpoints';
export { APP_NAME, STORAGE_KEYS, THEME_MODES } from './constants';

const config = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Navix Management',
    env: import.meta.env.VITE_APP_ENV || 'development',
  },
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  },
  theme: {
    defaultMode: import.meta.env.VITE_DEFAULT_THEME || 'light',
  },
};

export default config;
