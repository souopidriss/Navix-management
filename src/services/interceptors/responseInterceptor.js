/**
 * Navix Services — Intercepteur de réponses (response interceptor)
 * --------------------------------------------------------------------------
 * Exécuté pour chaque réponse (ou erreur) de l'instance Axios unique :
 *   - journalise la réponse en mode développement ;
 *   - normalise TOUTE erreur en `ApiError` avant rejet ;
 *   - sur 401 (Unauthorized), tente un refresh token unique avant de
 *     détruire la session.
 *
 * Refresh Token :
 *   - Mutex centralisé : un seul refresh en cours à la fois ;
 *   - File d'attente : les requêtes concurrentes qui reçoivent un 401 sont
 *     mises en attente et relancées après un refresh réussi ;
 *   - Protection contre les boucles : après MAX_REFRESH_ATTEMPTS échecs,
 *     la session est détruite sans tenter de nouveau refresh.
 */
import axios from 'axios';
import { STORAGE_KEYS } from '@/config';
import { apiConfig } from '../config';
import { ApiError } from '../errors';
import { useAuthStore } from '@/features/auth';
import { useRbacStore } from '@/features/rbac';

const MAX_REFRESH_ATTEMPTS = 3;

let isRefreshing = false;
let refreshAttempts = 0;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

const forceLogout = () => {
  /* Vider le store synchronously (pas d'async logout qui pourrait ne pas terminer avant le reload). */
  try {
    useAuthStore.setState({
      user: null,
      company: null,
      tenant: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      status: 'unauthenticated',
      currentRole: null,
      loginAt: null,
      isLoading: false,
      error: null,
    });
  } catch {
    /* fallback silencieux si le store n'est pas encore monté */
  }
  try {
    useRbacStore.getState().reset();
  } catch {
    /* ignore */
  }
  localStorage.removeItem(STORAGE_KEYS.AUTH);
  localStorage.removeItem(STORAGE_KEYS.RBAC);
  window.location.href = '/login';
};

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
   * Sur 401, tente un refresh token unique puis relance les requêtes en
   * attente. Si le refresh échoue ou si la limite de tentatives est atteinte,
   * détruit la session et redirige vers /login.
   * @param {unknown} error
   */
  onRejected: async (error) => {
    const originalRequest = error.config;
    const apiError = ApiError.fromAxiosError(error);

    if (apiConfig.isDev) {
      console.error(`[API ERR] ${apiError.status} ${apiError.code} — ${apiError.message}`);
    }

    if (apiError.status !== 401 || !originalRequest) {
      return Promise.reject(apiError);
    }

    /* Ne pas tenter de refresh sur les routes d'auth elles-mêmes. */
    const url = originalRequest.url ?? '';
    if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh')) {
      forceLogout();
      return Promise.reject(apiError);
    }

    /* Déjà un refresh en cours → mise en file d'attente. */
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        })
        .catch((err) => Promise.reject(err instanceof ApiError ? err : ApiError.fromAxiosError(err)));
    }

    /* Protection contre les boucles de refresh. */
    if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      refreshAttempts = 0;
      forceLogout();
      return Promise.reject(apiError);
    }

    isRefreshing = true;
    refreshAttempts += 1;

    try {
      const result = await useAuthStore.getState().refresh();

      if (!result.success) {
        throw apiError;
      }

      const newToken = useAuthStore.getState().accessToken;
      refreshAttempts = 0;
      processQueue(null, newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axios(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      forceLogout();
      return Promise.reject(refreshError instanceof ApiError ? refreshError : ApiError.fromAxiosError(refreshError));
    } finally {
      isRefreshing = false;
    }
  },
};
