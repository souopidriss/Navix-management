/**
 * Navix Auth — API publique de la feature.
 * Seuls les non-composants sont exportés ici ; les composants sont importés
 * via `@/features/auth/components`.
 * `authService` est redirigé vers la couche HTTP centralisée (`src/services`).
 */
export { useZodForm } from './hooks';
export { useAuthStore } from './store';
export { authService } from '@/services/api';
export {
  emailSchema,
  loginSchema,
  loginDefaultValues,
  forgotPasswordSchema,
  forgotPasswordDefaultValues,
  resetPasswordSchema,
  resetPasswordDefaultValues,
  PASSWORD_MIN_LENGTH,
} from './schemas';
