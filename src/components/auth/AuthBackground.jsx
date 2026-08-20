/**
 * Navix Auth — AuthBackground
 * --------------------------------------------------------------------------
 * Fond visuel premium pour toutes les pages d'authentification.
 * Composant purement décoratif (aria-hidden), aucune interaction.
 * Couche multi-niveaux :
 *   1. Gradient base navy
 *   2. Radials bleu / indigo
 *   3. Glow violet
 *   4. Grille géométrique subtile
 *   5. Image fleet/transport
 *   6. Overlay sombre
 *   7. Halos lumineux animés
 */
import './AuthBackground.css';

const AuthBackground = () => (
  <div className="navix-auth-bg" aria-hidden="true">
    <div className="navix-auth-bg__gradient" />
    <div className="navix-auth-bg__radial navix-auth-bg__radial--blue" />
    <div className="navix-auth-bg__radial navix-auth-bg__radial--indigo" />
    <div className="navix-auth-bg__radial navix-auth-bg__radial--violet" />
    <div className="navix-auth-bg__image" />
    <div className="navix-auth-bg__overlay" />
    <div className="navix-auth-bg__grid" />
    <div className="navix-auth-bg__glow navix-auth-bg__glow--1" />
    <div className="navix-auth-bg__glow navix-auth-bg__glow--2" />
    <div className="navix-auth-bg__glow navix-auth-bg__glow--3" />
  </div>
);

export default AuthBackground;
