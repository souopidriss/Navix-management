import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import './NotFoundPage.css';

const NotFoundPage = () => (
  <main className="nv-404" aria-labelledby="nf-title">
    <Helmet>
      <title>Page introuvable — Navix Management</title>
      <meta name="description" content="La page que vous recherchez est introuvable ou a été déplacée." />
      <meta property="og:title" content="Page introuvable — Navix Management" />
      <meta property="og:description" content="La page que vous recherchez est introuvable ou a été déplacée." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://navixmanagement.com/404" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="Page introuvable — Navix Management" />
      <meta name="twitter:description" content="La page que vous recherchez est introuvable ou a été déplacée." />
    </Helmet>
    <div className="nv-container">
      <div className="nv-404__content">
        <span className="nv-404__icon" aria-hidden="true">
          <i className="bi bi-compass" />
        </span>
        <p className="nv-404__code">404</p>
        <h1 id="nf-title" className="nv-404__title">Page introuvable</h1>
        <p className="nv-404__desc">
          La page demand&eacute;e est introuvable ou a &eacute;t&eacute; d&eacute;plac&eacute;e.
        </p>
        <div className="nv-404__actions">
          <Link to={ROUTES.HOME} className="nv-btn-orange nv-btn-orange--lg">
            <i className="bi bi-house" aria-hidden="true" />
            Retour &agrave; l&apos;accueil
          </Link>
          <Link to={ROUTES.PUBLIC_FEATURES} className="nv-btn-outline-navy">
            D&eacute;couvrir les fonctionnalit&eacute;s
          </Link>
        </div>
      </div>
    </div>
  </main>
);

export default NotFoundPage;
