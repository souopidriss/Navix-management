/**
 * Navix Profile — API publique de la feature.
 * Seuls les non-composants sont exportés ici ; les composants sont importés
 * via `@/features/profile/components`.
 */
export { useProfile, useProfileForm } from './hooks';
export { profileSchema, toProfileFormValues, toProfilePayload } from './schemas';
