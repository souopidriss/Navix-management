/**
 * Navix Users — Formulaire utilisateur (création / édition)
 * --------------------------------------------------------------------------
 * Enveloppe `useZodForm` (validations Zod, noValidate) avec les valeurs
 * par défaut du module et la réinitialisation du champ agence lorsque
 * l'entreprise change.
 */
import { useZodForm } from '@/features/auth/hooks/useZodForm';
import { userSchema, userDefaultValues, toUserFormValues } from '../schemas';

/**
 * @param {object} options
 * @param {object} [options.user]          — utilisateur édité (null = création)
 * @param {(values) => void} options.onSubmit — appelé si la validation passe
 * @returns {object} { values, errors, setField, reset, handleSubmit }
 */
export const useUserForm = ({ user = null, onSubmit }) =>
  useZodForm({
    schema: userSchema,
    defaultValues: user ? toUserFormValues(user) : userDefaultValues,
    onSubmit,
  });

/**
 * Lie le changement d'entreprise au nettoyage de l'agence sélectionnée
 * (l'agence appartient à une entreprise : valeur incompatible à ignorer).
 * @param {(name, value) => void} setField — depuis useUserForm
 * @param {(value: string) => void} onCompanyChange
 * @returns {(value: string) => void}
 */
export const bindCompanyChange = (setField, onCompanyChange = () => {}) => (value) => {
  setField('companyId', value);
  setField('agencyId', '');
  onCompanyChange(value);
};
