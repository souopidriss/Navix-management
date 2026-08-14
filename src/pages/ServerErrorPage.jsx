/**
 * Navix — ServerErrorPage
 * --------------------------------------------------------------------------
 * Page d'erreur générique (500 / erreur inattendue) utilisée comme
 * `errorElement` du routeur (erreurs de rendu de route, de chargement de
 * chunk lazy ou de loader). Contrairement au ErrorFallback global, elle
 * dispose du contexte de routage (useRouteError / useNavigate).
 *
 * Les détails techniques ne sont affichés qu'en développement.
 */
import { Helmet } from 'react-helmet-async';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ROUTES } from '@/routes/route.constants';

const ServerErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  const code = isRouteErrorResponse(error) ? String(error.status) : '500';
  const title = isNotFound ? 'Page introuvable' : "Une erreur inattendue s'est produite.";
  const message = isNotFound
    ? 'La page demandée est introuvable ou a été déplacée.'
    : "L'application a rencontré un problème inattendu. Réessayez dans quelques instants.";
  const details = import.meta.env.DEV ? error?.message || error?.stack : null;

  return (
    <section className="d-flex align-items-center justify-content-center min-vh-100 bg-body py-5">
      <Helmet>
        <title>Erreur inattendue</title>
      </Helmet>
      <div
        className="text-center px-3"
        style={{ maxWidth: '32rem', width: '100%' }}
        role="alert"
        aria-live="assertive"
      >
        <span
          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 text-danger"
          style={{ width: '5rem', height: '5rem', backgroundColor: 'rgba(var(--navix-danger-rgb), 0.12)' }}
          aria-hidden="true"
        >
          <i className="bi bi-exclamation-octagon fs-1" />
        </span>
        <p className="display-4 fw-bold mb-0">{code}</p>
        <h1 className="h5 mt-2 mb-2">{title}</h1>
        <p className="text-secondary mb-4">{message}</p>
        <div className="d-flex flex-wrap justify-content-center gap-2">
          <Button variant="primary" icon="bi-arrow-clockwise" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
          <Button variant="outline" icon="bi-speedometer2" onClick={() => navigate(ROUTES.DASHBOARD)}>
            Retour au Dashboard
          </Button>
          <Button variant="outline" icon="bi-arrow-left" onClick={() => navigate(-1)}>
            Retour
          </Button>
        </div>
        {details && (
          <details className="mt-4 text-start">
            <summary className="text-secondary small">Détails techniques (développement)</summary>
            <pre
              className="bg-body-tertiary border rounded p-3 mt-2 mb-0 small text-danger"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {details}
            </pre>
          </details>
        )}
      </div>
    </section>
  );
};

export default ServerErrorPage;
