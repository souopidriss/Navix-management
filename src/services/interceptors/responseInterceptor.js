/**
 * Navix Services — Intercepteur de réponses (response interceptor)
 * --------------------------------------------------------------------------
 * Exécuté pour chaque réponse (ou erreur) de l'instance Axios unique :
 *   - journalise la réponse en mode développement ;
 *   - normalise TOUTE erreur en `ApiError` avant rejet ;
 *   - prépare la future gestion Refresh Token / Retry.
 *
 * Points d'extension futurs (quand le backend sera prêt) :
 *   - Refresh Token : sur 401, tenter un refresh unique puis relancer la
 *     requête initiale (file d'attente des requêtes concurrentes) ;
 *   - Retry : relancer les erreurs réseau/temporaires avec backoff.
 */
import { apiConfig } from '../config';
import { ApiError } from '../errors';

export const responseInterceptor = {
  /**
   * Succès — journalise la réponse en mode développement puis la retourne
   * intacte (les headers restent accessibles, ex. pagination).
   * @param {import('axios').AxiosResponse} response
   */
  onFulfilled: (response) => {
    if (apiConfig.isDev) {
      console.info(
        `[API RES] ${response.status} ${response.config?.method?.toUpperCase() ?? '?'} ${response.config?.url ?? ''}`,
      );
    }

    return response;
  },

  /**
   * Échec — normalise l'erreur Axios en ApiError puis rejette.
   * @param {unknown} error
   */
  onRejected: (error) => {
    const apiError = ApiError.fromAxiosError(error);

    if (apiConfig.isDev) {
      console.error(`[API ERR] ${apiError.status} ${apiError.code} — ${apiError.message}`);
    }

    return Promise.reject(apiError);
  },
};
