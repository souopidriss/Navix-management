/**
 * Navix Users — UserDetails
 * --------------------------------------------------------------------------
 * Fiche détaillée d'un utilisateur : identité (avatar, nom, email), statut du
 * compte, rattachements (entreprise, agence), rôles, coordonnées et dates de
 * connexion. Composant déclaratif — les actions (modifier, désactiver, …)
 * sont portées par la page.
 *
 * Props :
 *   user  : utilisateur enrichi (companyName, agencyName, roleNames)
 *   roles : rôles de la portée (résolution des badges)
 */
import { Avatar } from '@/components/core';
import { Card } from '@/components/ui';
import { formatUserDateTime } from '../constants';
import UserStatusBadge from './UserStatusBadge';
import RoleBadges from './RoleBadges';
import './UserDetails.css';

const InfoRow = ({ icon, label, value }) => (
  <div className="navix-user-details__row">
    <dt className="navix-user-details__label">
      <i className={`bi ${icon} me-2`} aria-hidden="true" />
      {label}
    </dt>
    <dd className="navix-user-details__value">{value || '—'}</dd>
  </div>
);

const UserDetails = ({ user }) => {
  if (!user) return null;

  return (
    <Card className="navix-user-details" padding="lg">
      <div className="navix-user-details__header">
        <Avatar name={user.fullName} size="xl" />
        <div className="navix-user-details__identity">
          <h2 className="h4 mb-1">{user.fullName}</h2>
          <p className="text-muted mb-2">{user.jobTitle || user.email}</p>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <UserStatusBadge status={user.status} />
            <RoleBadges names={user.roleNames} />
          </div>
        </div>
      </div>

      <dl className="navix-user-details__grid">
        <InfoRow icon="bi-envelope" label="Email" value={user.email} />
        <InfoRow icon="bi-telephone" label="Téléphone" value={user.phone} />
        <InfoRow icon="bi-buildings" label="Entreprise" value={user.companyName} />
        <InfoRow icon="bi-diagram-3" label="Agence" value={user.agencyName} />
        <InfoRow
          icon="bi-clock-history"
          label="Dernière connexion"
          value={user.lastLoginAt ? formatUserDateTime(user.lastLoginAt) : 'Jamais'}
        />
        <InfoRow icon="bi-calendar-plus" label="Créé le" value={formatUserDateTime(user.createdAt)} />
      </dl>
    </Card>
  );
};

export default UserDetails;
