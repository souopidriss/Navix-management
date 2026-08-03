/**
 * Navix Services — Client HTTP unique (instance Axios)
 * --------------------------------------------------------------------------
 * Une seule instance Axios pour toute l'application, configurée depuis
 * `apiConfig` (source centralisée) et équipée des intercepteurs
 * (requestInterceptor, responseInterceptor).
 *
 * Règles :
 *   - Les composants React n'importent JAMAIS Axios : ils passent par les
 *     services (`src/services/api`), seuls consommateurs de `apiClient`.
 *   - En mode mock (`apiConfig.mock === true`), aucun appel réseau n'est
 *     émis : les services retournent des Promises simulées.
 *
 * Points d'extension futurs (sans changement d'instance) :
 *   - JWT : injection du header Authorization dans requestInterceptor ;
 *   - Refresh Token / Retry : traitement dans responseInterceptor ;
 *   - Upload : POST multipart (FormData) via apiClient.post ;
 *   - Download : GET avec `{ responseType: 'blob' }` via apiClient.get ;
 *   - Pagination : params (page, limit) via buildQuery ou `params` Axios.
 */
import axios from 'axios';
import { apiConfig } from '../config';
import { requestInterceptor, responseInterceptor } from '../interceptors';

export const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: apiConfig.headers,
});

apiClient.interceptors.request.use(requestInterceptor.onFulfilled, requestInterceptor.onRejected);
apiClient.interceptors.response.use(responseInterceptor.onFulfilled, responseInterceptor.onRejected);

export default apiClient;
