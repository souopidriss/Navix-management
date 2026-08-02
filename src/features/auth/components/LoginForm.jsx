/**
 * Navix Auth — LoginForm
 * --------------------------------------------------------------------------
 * Formulaire de connexion : email, mot de passe, remember me, lien
 * « mot de passe oublié ». Validation exclusive Zod, états loading / error
 * pilotés par le store auth (simulation — aucun appel backend).
 */
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Alert, Button } from '@/components/ui';
import { ROUTES } from '@/routes/route.constants';
import { useAuthStore } from '../store';
import { useZodForm } from '../hooks';
import { loginSchema, loginDefaultValues } from '../schemas';
import EmailInput from './EmailInput';
import PasswordInput from './PasswordInput';
import RememberMe from './RememberMe';

const LoginForm = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const clearError = useAuthStore((state) => state.clearError);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const { values, errors, setField, handleSubmit } = useZodForm({
    schema: loginSchema,
    defaultValues: loginDefaultValues,
    onSubmit: async (data) => {
      const result = await login(data);
      if (!result.success) return;

      toast.success('Connexion réussie. Bienvenue !');
      navigate(ROUTES.DASHBOARD);
    },
  });

  return (
    <form className="d-grid gap-3" onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert variant="danger" closable onClose={clearError}>
          {error}
        </Alert>
      )}

      <EmailInput
        id="login-email"
        label="Adresse email"
        value={values.email}
        onChange={(value) => setField('email', value)}
        error={errors.email}
        placeholder="vous@entreprise.com"
      />

      <PasswordInput
        id="login-password"
        label="Mot de passe"
        value={values.password}
        onChange={(value) => setField('password', value)}
        error={errors.password}
        autoComplete="current-password"
        placeholder="Votre mot de passe"
      />

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <RememberMe
          id="login-remember"
          checked={values.rememberMe}
          onChange={(value) => setField('rememberMe', value)}
        />
        <Link to={ROUTES.FORGOT_PASSWORD} className="small text-decoration-none">
          Mot de passe oublié&nbsp;?
        </Link>
      </div>

      <Button type="submit" size="lg" fullWidth loading={isLoading}>
        Connexion
      </Button>
    </form>
  );
};

export default LoginForm;
