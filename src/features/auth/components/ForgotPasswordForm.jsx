/**
 * Navix Auth — ForgotPasswordForm
 * --------------------------------------------------------------------------
 * Formulaire « mot de passe oublié » : email + envoi du lien (simulé).
 * Après succès, un écran de confirmation anti-énumération est affiché.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button } from '@/components/ui';
import { ROUTES } from '@/routes/route.constants';
import { useAuthStore } from '../store';
import { useZodForm } from '../hooks';
import { forgotPasswordSchema, forgotPasswordDefaultValues } from '../schemas';
import EmailInput from './EmailInput';

const ForgotPasswordForm = () => {
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const clearError = useAuthStore((state) => state.clearError);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const [submitted, setSubmitted] = useState(false);

  const { values, errors, setField, handleSubmit } = useZodForm({
    schema: forgotPasswordSchema,
    defaultValues: forgotPasswordDefaultValues,
    onSubmit: async (data) => {
      const result = await forgotPassword({ email: data.email });
      if (!result.success) return;

      setSubmitted(true);
    },
  });

  if (submitted) {
    return (
      <div className="text-center d-grid gap-3">
        <i className="bi bi-envelope-check display-4 text-success" aria-hidden="true" />
        <div>
          <h2 className="h5">Lien envoyé</h2>
          <p className="text-secondary mb-0">
            Si un compte est associé à <strong>{values.email}</strong>, un lien de
            réinitialisation vient de vous être envoyé.
          </p>
        </div>
        <Link to={ROUTES.LOGIN} className="btn btn-outline-primary w-100">
          Retour à la connexion
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

      <EmailInput
        id="forgot-email"
        label="Adresse email"
        value={values.email}
        onChange={(value) => setField('email', value)}
        error={errors.email}
        placeholder="vous@entreprise.com"
      />

      <Button type="submit" size="lg" fullWidth loading={isLoading}>
        Envoyer le lien
      </Button>

      <p className="text-center mb-0">
        <Link to={ROUTES.LOGIN} className="small text-decoration-none">
          <i className="bi bi-arrow-left me-1" aria-hidden="true" />
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
};

export default ForgotPasswordForm;
