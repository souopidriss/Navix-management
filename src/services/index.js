/**
 * Navix Services — API publique de la couche HTTP.
 * --------------------------------------------------------------------------
 * Point d'entrée unique de l'architecture réseau :
 *   - configuration (apiConfig) ;
 *   - client unique (apiClient) ;
 *   - erreurs normalisées (ApiError) ;
 *   - utilitaires (delay, buildQuery, mockResponse) ;
 *   - services métier (authService, vehicleService, …).
 *
 * Règle : les composants React n'importent jamais Axios ; ils consomment
 * uniquement les services exportés ici.
 */
export { apiConfig } from './config';
export { ApiError } from './errors';
export { apiClient } from './client';
export { delay, buildQuery, mockResponse } from './utils';
export {
  authService,
  vehicleService,
  driverService,
  companyService,
  fuelService,
  maintenanceService,
  subscriptionService,
  invoiceService,
  notificationService,
} from './api';
