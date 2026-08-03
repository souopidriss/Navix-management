/**
 * Navix Services — Intercepteur de requêtes (request interceptor)
 * --------------------------------------------------------------------------
 * Exécuté pour chaque requête sortante de l'instance Axios unique.
 * Pour le moment, il ne gère PAS les tokens (conformément au périmètre) :
 *   - journalise la requête en mode développement ;
 *   - prépare la future gestion JWT.
 *
 * Branchement JWT (quand le backend sera prêt) : injecter ici le header
 * Authorization en lisant le token de session, ex.
 *   const token = getAccessToken(); // à câbler sur le store auth
 *   if (token) request.headers.Authorization = `Bearer ${token}`;
 *
 * Points d'extension futurs : retry idempotent, signature, correlation-id.
 */
import { apiConfig } from '../config';

export const requestInterceptor = {
  /**
   * Succès — journalise la requête sortante en mode développement.
   * @param {import('axios').InternalAxiosRequestConfig} request
   */
  onFulfilled: (request) => {
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
