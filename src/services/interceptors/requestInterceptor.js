/**
 * Navix Services — Intercepteur de requêtes (request interceptor)
 * --------------------------------------------------------------------------
 * Exécuté pour chaque requête sortante de l'instance Axios unique :
 *   - injecte le header Authorization (Bearer token) depuis le store auth ;
 *   - journalise la requête en mode développement ;
 *   - prépare la future gestion JWT / retry idempotent / signature / correlation-id.
 */
import { apiConfig } from '../config';
import { useAuthStore } from '@/features/auth';

export const requestInterceptor = {
  /**
   * Succès — injecte le token d'accès puis journalise la requête.
   * @param {import('axios').InternalAxiosRequestConfig} request
   */
  onFulfilled: (request) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }

    if (apiConfig.isDev) {
      console.info(`[API REQ] ${request.method?.toUpperCase() ?? '?'} ${request.baseURL ?? ''}${request.url ?? ''}`);
    }

    return request;
  },

  /**
   * Échec — rejette tel quel (les erreurs de requête sont rares côté Axios).
   */
  onRejected: (error) => Promise.reject(error),
};
