/**
 * Navix Auth — RoleSelection
 * --------------------------------------------------------------------------
 * Cartes de sélection de rôle pour l'inscription.
 * Trois options : Client, Chauffeur, Partenaire – Station.
 * Chaque carte redirige vers le formulaire d'inscription correspondant.
 */
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import './RoleSelection.css';

const ROLES = [
  {
    key: 'client',
    label: 'Client',
    description: 'Gérez votre flotte de véhicules et suivez vos opérations en temps réel.',
    icon: 'bi-building',
    to: ROUTES.REGISTER_CLIENT,
  },
  {
    key: 'driver',
    label: 'Chauffeur',
    description: 'Accédez à vos missions, trajets et documents depuis votre espace dédié.',
    icon: 'bi-truck',
    to: ROUTES.REGISTER_DRIVER,
  },
  {
    key: 'partner',
    label: 'Partenaire – Station',
    description: 'Proposez vos services de station et gérez vos clients partenaires.',
    icon: 'bi-fuel-pump',
    to: ROUTES.REGISTER_PARTNER,
  },
];

const RoleSelection = () => (
  <div className="nv-role-selection d-grid gap-3">
    {ROLES.map((role) => (
      <Link
        key={role.key}
        to={role.to}
        className="nv-role-card text-decoration-none"
      >
        <div className="nv-role-card__icon">
          <i className={`bi ${role.icon}`} aria-hidden="true" />
        </div>
        <div className="nv-role-card__content">
          <h3 className="nv-role-card__title">{role.label}</h3>
          <p className="nv-role-card__desc">{role.description}</p>
        </div>
        <i className="bi bi-chevron-right nv-role-card__arrow" aria-hidden="true" />
      </Link>
    ))}
  </div>
);

export default RoleSelection;
