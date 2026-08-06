/**
 * Navix Users — Formulaire rôle (création / édition)
 * --------------------------------------------------------------------------
 * Enveloppe `useZodForm` (validations Zod, noValidate) avec les valeurs
 * par défaut du module. En édition, le code est affiché en lecture seule
 * (le composant évite toute modification) afin de ne pas casser les
 * références existantes.
 */
import { useZodForm } from '@/features/auth/hooks/useZodForm';
import { roleSchema, roleDefaultValues, toRoleFormValues } from '../schemas';

/**
 * @param {object} options
 * @param {object} [options.role]          — rôle édité (null = création)
 * @param {(values) => void} options.onSubmit — appelé si la validation passe
 * @returns {object} { values, errors, setField, reset, handleSubmit }
 */
export const useRoleForm = ({ role = null, onSubmit }) =>
  useZodForm({
    schema: roleSchema,
    defaultValues: role ? toRoleFormValues(role) : roleDefaultValues,
    onSubmit,
  });
