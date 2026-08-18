/**
 * Navix Auth — Hook de formulaire basé sur la validation Zod.
 * --------------------------------------------------------------------------
 * Gère l'état des champs, les erreurs de validation (issues Zod → erreurs par
 * champ) et le déclenchement de la soumission. L'appel async (`onSubmit`)
 * est laissé au formulaire appelant (le chargement / succès / erreur globale
 * sont pilotés par le store auth ou un état local).
 *
 * @param {{ schema, defaultValues, onSubmit }} options
 *   schema        : schéma Zod (safeParse)
 *   defaultValues : valeurs initiales
 *   onSubmit      : (values) => void — appelé uniquement si la validation passe
 *
 * @returns {{ values, errors, setField, reset, handleSubmit }}
 */
import { useState } from 'react';

export const useZodForm = ({ schema, defaultValues, onSubmit }) => {
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const reset = (nextValues = defaultValues) => {
    setValues(nextValues);
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();

    if (isSubmitting) return;

    const result = schema.safeParse(values);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field !== undefined && fieldErrors[field] === undefined) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit(result.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { values, errors, isSubmitting, setField, reset, handleSubmit };
};
