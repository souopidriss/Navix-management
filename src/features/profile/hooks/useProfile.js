/**
 * Navix Profile — Hook du profil courant
 * --------------------------------------------------------------------------
 * Source de vérité : `useAuthStore` (session). Le profil expose l'utilisateur
 * courant, son rôle/entreprise/tenant (affichage) et l'action `updateProfile`
 * qui enveloppe le store avec des toasts (react-hot-toast, système existant).
 * Les composants ne manipulent jamais le service directement.
 */
import { useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/features/auth';
import { useRbacStore } from '@/features/rbac';
import { useZodForm } from '@/features/auth/hooks/useZodForm';
import { profileSchema, toProfileFormValues, toProfilePayload } from '../schemas';

export const useProfile = () => {
  const user = useAuthStore((state) => state.user);
  const company = useAuthStore((state) => state.company);
  const tenant = useAuthStore((state) => state.tenant);
  const isSaving = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const updateProfileAction = useAuthStore((state) => state.updateProfile);

  const currentRole = useRbacStore((state) => state.currentRole);

  const updateProfile = useCallback(
    async (payload) => {
      const result = await updateProfileAction(payload);
      if (result.success) {
        toast.success('Profil mis à jour.');
      } else {
        toast.error(result.error || 'Impossible de mettre à jour votre profil.');
      }
      return result;
    },
    [updateProfileAction],
  );

  return useMemo(
    () => ({ user, company, tenant, currentRole, isSaving, error, clearError, updateProfile }),
    [user, company, tenant, currentRole, isSaving, error, clearError, updateProfile],
  );
};

/**
 * Formulaire du profil courant (useZodForm + profileSchema).
 * @param {object} options
 * @param {object} [options.user]              — utilisateur courant
 * @param {(values) => void} options.onSubmit  — appelé si la validation passe
 * @returns {object} { values, errors, setField, reset, handleSubmit }
 */
export const useProfileForm = ({ user = {}, onSubmit }) =>
  useZodForm({
    schema: profileSchema,
    defaultValues: toProfileFormValues(user),
    onSubmit: (values) => onSubmit(toProfilePayload(values)),
  });
