/**
 * Navix Services — ApiError (normalisation des erreurs HTTP)
 * --------------------------------------------------------------------------
 * Toute erreur traversant la couche HTTP est normalisée en `ApiError`.
 * Structure :
 *   - status    : code HTTP (0 pour une erreur réseau / sans réponse)
 *   - code      : code machine (ex. 'UNAUTHORIZED', 'AUTH_INVALID_CREDENTIALS')
 *   - message   : message lisible (fidèle à la réponse serveur si présente)
 *   - details   : détails additionnels (validation, champs, etc.)
 *   - timestamp : date ISO de survenue de l'erreur
 *
 * `fromAxiosError` transforme n'importe quelle erreur Axios (réponse HTTP,
 * erreur réseau, timeout) en ApiError exploitable par l'UI et les stores.
 */

const STATUS_CODES = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_SERVER_ERROR',
  502: 'BAD_GATEWAY',
  503: 'SERVICE_UNAVAILABLE',
  504: 'GATEWAY_TIMEOUT',
};

const readServerPayload = (error) => {
  const data = error?.response?.data;
  return typeof data === 'object' && data !== null ? data : {};
};

export class ApiError extends Error {
  /**
   * @param {{ status?: number, code?: string, message?: string, details?: unknown, timestamp?: string }} [options]
   */
  constructor({ status = 0, code = 'UNKNOWN_ERROR', message = 'Une erreur est survenue.', details = null, timestamp } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = timestamp ?? new Date().toISOString();
  }

  /**
   * Normalise une erreur Axios en ApiError (statut, payload serveur, réseau).
   * @param {unknown} error — erreur rejetée par Axios
   */
  static fromAxiosError(error) {
    const status = error?.response?.status ?? 0;
    const payload = readServerPayload(error);
    const code = payload.code || error?.code || STATUS_CODES[status] || 'NETWORK_ERROR';
    const message = payload.message || error?.message || 'Une erreur réseau est survenue.';
    const details = payload.details ?? null;

    return new ApiError({ status, code, message, details });
  }

  /** Erreur générique 400 (requête invalide). */
  static badRequest(message = 'Requête invalide.', details = null) {
    return new ApiError({ status: 400, code: STATUS_CODES[400], message, details });
  }

  /** Erreur générique 401 (non authentifié). */
  static unauthorized(message = 'Non authentifié.') {
    return new ApiError({ status: 401, code: STATUS_CODES[401], message });
  }

  /** Erreur générique 403 (accès refusé). */
  static forbidden(message = 'Accès refusé.') {
    return new ApiError({ status: 403, code: STATUS_CODES[403], message });
  }

  /** Erreur générique 404 (introuvable). */
  static notFound(message = 'Ressource introuvable.') {
    return new ApiError({ status: 404, code: STATUS_CODES[404], message });
  }

  /** Erreur générique 500 (erreur serveur). */
  static internal(message = 'Erreur interne du serveur.') {
    return new ApiError({ status: 500, code: STATUS_CODES[500], message });
  }

  /** Représentation sérialisable (logging, debug). */
  toJSON() {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}
