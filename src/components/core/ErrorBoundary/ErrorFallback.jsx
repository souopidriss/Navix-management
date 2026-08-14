/**
 * Navix Core — ErrorFallback
 * --------------------------------------------------------------------------
 * Interface de repli par défaut du ErrorBoundary global.
 *
 * Volontairement sans dépendance au contexte de routage (ni useNavigate,
 * ni <Link>) : les liens utilisent des ancres et l'historique natif, afin de
 * rester fonctionnels même si le router ou le layout ont eux-mêmes planté.
 *
 * Les détails techniques (message / stack) ne sont affichés qu'en
 * développement (import.meta.env.DEV) — jamais en production.
 */
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui';
import { ROUTES } from '@/routes/route.constants';

const ErrorFallback = ({ error, onRetry, title = "Une erreur inattendue s'est produite." }) => {
  const showDetails = import.meta.env.DEV && Boolean(error);

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
        <h1 className="h5 mt-2 mb-2">{title}</h1>
        <p className="text-secondary mb-4">
          L'application a rencontré un problème inattendu. Vous pouvez réessayer ou revenir à une
          page sûre.
        </p>
        <div className="d-flex flex-wrap justify-content-center gap-2">
          <Button variant="primary" icon="bi-arrow-clockwise" onClick={onRetry}>
            Réessayer
          </Button>
          <Button variant="outline" icon="bi-speedometer2" href={ROUTES.DASHBOARD}>
            Retour au Dashboard
          </Button>
          <Button variant="outline" icon="bi-arrow-left" onClick={() => window.history.back()}>
            Retour
          </Button>
        </div>
        {showDetails && (
          <details className="mt-4 text-start">
            <summary className="text-secondary small">Détails techniques (développement)</summary>
            <pre
              className="bg-body-tertiary border rounded p-3 mt-2 mb-0 small text-danger"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {error?.stack || error?.message}
            </pre>
          </details>
        )}
      </div>
    </section>
  );
};

export default ErrorFallback;
