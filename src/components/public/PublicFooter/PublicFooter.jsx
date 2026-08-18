import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import { appConfig } from '@/config';
import './PublicFooter.css';

const PRODUIT = [
  { label: 'Fonctionnalités', to: ROUTES.PUBLIC_FEATURES },
  { label: 'Tarifs', to: ROUTES.PUBLIC_PRICING },
];

const ENTREPRISE = [
  { label: 'À propos', to: ROUTES.PUBLIC_ABOUT },
  { label: 'Contact', to: ROUTES.PUBLIC_CONTACT },
];

const RESSOURCES = [
  { label: 'Ressources', to: ROUTES.PUBLIC_RESOURCES },
];

const CONNEXION = [
  { label: 'Super Admin', to: ROUTES.LOGIN },
  { label: 'Client', to: ROUTES.LOGIN },
  { label: 'Chauffeur', to: ROUTES.LOGIN },
  { label: 'Partenaire – Station', to: ROUTES.LOGIN },
];

const PublicFooter = () => (
  <footer className="nv-footer" role="contentinfo">
    <div className="nv-container">
      <div className="nv-footer__grid">
        {/* Présentation */}
        <div>
          <div className="nv-footer__brand">
            <span className="nv-footer__brand-mark" aria-hidden="true">
              <i className="bi bi-geo-alt-fill" />
            </span>
            <span className="nv-footer__brand-name">NAVIX MANAGEMENT</span>
          </div>
          <p className="nv-footer__desc">
            Solution SaaS professionnelle de gestion de flotte de v&eacute;hicules pour
            entreprises, particuliers et acteurs partenaires.
          </p>
        </div>

        {/* Produit */}
        <div>
          <h4 className="nv-footer__heading">Produit</h4>
          <ul className="nv-footer__links">
            {PRODUIT.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="nv-footer__link">
                  {item.label}
                  <i className="bi bi-arrow-right" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Entreprise */}
        <div>
          <h4 className="nv-footer__heading">Entreprise</h4>
          <ul className="nv-footer__links">
            {ENTREPRISE.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="nv-footer__link">
                  {item.label}
                  <i className="bi bi-arrow-right" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Ressources */}
        <div>
          <h4 className="nv-footer__heading">Ressources</h4>
          <ul className="nv-footer__links">
            {RESSOURCES.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="nv-footer__link">
                  {item.label}
                  <i className="bi bi-arrow-right" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Connexion */}
        <div>
          <h4 className="nv-footer__heading">Connexion</h4>
          <ul className="nv-footer__links">
            {CONNEXION.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="nv-footer__link">
                  {item.label}
                  <i className="bi bi-arrow-right" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="nv-footer__bottom">
        <p className="nv-footer__copyright">
          &copy; {new Date().getFullYear()} {appConfig.name}. Tous droits r&eacute;serv&eacute;s.
        </p>
        <ul className="nv-footer__legal">
          <li>
            <span>Politique de confidentialit&eacute;</span>
          </li>
          <li>
            <span>Conditions d&apos;utilisation</span>
          </li>
          <li>
            <span>Mentions l&eacute;gales</span>
          </li>
        </ul>
      </div>
    </div>
  </footer>
);

export default PublicFooter;
