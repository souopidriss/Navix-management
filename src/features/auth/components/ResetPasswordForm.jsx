/**
 * Navix Auth — ResetPasswordForm
 * --------------------------------------------------------------------------
 * Formulaire de réinitialisation : nouveau mot de passe + confirmation,
 * validation Zod (longueur, lettre, chiffre, correspondance). Simulation.
 *
 * Le token de réinitialisation est fourni par la page (query param `?token=`).
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button } from '@/components/ui';
import { ROUTES } from '@/routes/route.constants';
import { useAuthStore } from '../store';
import { useZodForm } from '../hooks';
import { resetPasswordSchema, resetPasswordDefaultValues, PASSWORD_MIN_LENGTH } from '../schemas';
import PasswordInput from './PasswordInput';

const ResetPasswordForm = ({ token }) => {
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const clearError = useAuthStore((state) => state.clearError);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const [submitted, setSubmitted] = useState(false);

  const { values, errors, setField, handleSubmit } = useZodForm({
    schema: resetPasswordSchema,
    defaultValues: resetPasswordDefaultValues,
    onSubmit: async (data) => {
      const result = await resetPassword({ ...data, token });
      if (!result.success) return;

      setSubmitted(true);
    },
  });

  if (submitted) {
    return (
      <div className="text-center d-grid gap-3">
        <i className="bi bi-check-circle-fill display-4 text-success" aria-hidden="true" />
        <div>
          <h2 className="h5">Mot de passe réinitialisé</h2>
          <p className="text-secondary mb-0">
            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </p>
        </div>
        <Link to={ROUTES.LOGIN} className="btn btn-outline-primary w-100">
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form className="d-grid gap-3" onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert variant="danger" closable onClose={clearError}>
          {error}
        </Alert>
      )}

      <PasswordInput
        id="reset-password"
        label="Nouveau mot de passe"
        value={values.password}
        onChange={(value) => setField('password', value)}
        error={errors.password}
        autoComplete="new-password"
        hint={`${PASSWORD_MIN_LENGTH} caractères minimum, au moins une lettre et un chiffre.`}
      />

      <PasswordInput
        id="reset-confirm"
        label="Confirmer le mot de passe"
        value={values.confirmPassword}
        onChange={(value) => setField('confirmPassword', value)}
        error={errors.confirmPassword}
        autoComplete="new-password"
        placeholder="Confirmez votre mot de passe"
      />

      <Button type="submit" size="lg" fullWidth loading={isLoading}>
        Réinitialiser le mot de passe
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
