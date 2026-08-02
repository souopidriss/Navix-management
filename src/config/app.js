const env = import.meta.env;

/**
 * Navix Management — Métadonnées de l'application.
 * Source officielle du nom et des informations globales.
 * Tout affichage du nom de l'application doit utiliser APP_NAME / appConfig.
 */
export const APP_NAME = 'Navix Management';

export const appConfig = {
  name: env.VITE_APP_NAME || APP_NAME,
  env: env.VITE_APP_ENV || 'development',
  version: env.VITE_APP_VERSION || '0.1.0',
  description:
    env.VITE_APP_DESCRIPTION || 'Navix Management — Plateforme SaaS de gestion de flotte de véhicules',
  author: env.VITE_APP_AUTHOR || 'Navix Team',
  company: env.VITE_APP_COMPANY || 'Navix',
  url: env.VITE_APP_URL || 'https://navix.app',
};
