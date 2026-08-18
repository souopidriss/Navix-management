export const STORAGE_KEYS = {
  AUTH: 'navix-auth',
  THEME: 'navix-theme',
  RBAC: 'navix-rbac',
};

/**
 * Version du schéma de persistance localStorage.
 * Incrémenter lorsque la structure du user, du company, du tenant ou
 * des tokens change. Le middleware `migrate` de Zustand nettoie
 * automatiquement les données obsolètes à la réhydratation.
 */
export const STORAGE_VERSION = 1;

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};
