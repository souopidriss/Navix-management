import { Helmet } from 'react-helmet-async';
import { Spinner } from '@/components/ui';

/**
 * LoadingPage — écran de chargement officiel de l'application.
 * Utilisé comme fallback global de Suspense (App.jsx) pour toutes les
 * routes chargées avec React.lazy().
 *
 * Props :
 *   label    : texte affiché sous le spinner (défaut : 'Chargement…')
 *   fullPage : centrage plein écran (défaut : true)
 */
const LoadingPage = ({ label = 'Chargement…', fullPage = true }) => (
  <div
    className={`d-flex flex-column align-items-center justify-content-center gap-3 ${
      fullPage ? 'min-vh-100' : 'py-5'
    }`.trim()}
  >
    {fullPage && (
      <Helmet>
        <title>Chargement</title>
      </Helmet>
    )}
    <Spinner size="lg" color="primary" label={label} />
    <p className="text-secondary small mb-0">{label}</p>
  </div>
);

export default LoadingPage;
