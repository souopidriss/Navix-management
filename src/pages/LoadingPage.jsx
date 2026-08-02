import { Helmet } from 'react-helmet-async';

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
    <div className="spinner-border text-primary" role="status" aria-label={label}>
      <span className="visually-hidden">{label}</span>
    </div>
    <p className="text-secondary small mb-0">{label}</p>
  </div>
);

export default LoadingPage;
