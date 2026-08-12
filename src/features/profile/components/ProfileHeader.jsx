/**
 * Navix Profile — ProfileHeader
 * --------------------------------------------------------------------------
 * Bandeau d'identité du profil courant : avatar, nom complet, rôle, statut du
 * compte, entreprise et tenant. Données exclusivement en lecture (source :
 * session auth). Le rôle est libellé via le catalogue RBAC existant.
 */
import { Avatar, StatusBadge } from '@/components/core';
import { getRole } from '@/features/rbac/utils/access';
import { getUserStatus } from '@/features/users/constants';

const ProfileHeader = ({ user, company, tenant, currentRole }) => {
  const role = getRole(currentRole ?? user?.role);
  const status = getUserStatus(user?.status);

  return (
    <div className="navix-profile-header">
      <div className="navix-profile-header__main">
        <Avatar
          src={user?.avatar || null}
          name={user?.name}
          size="xl"
          variant="primary"
          className="navix-profile-header__avatar"
        />
        <div className="navix-profile-header__identity">
          <h2 className="navix-profile-header__name">{user?.name || '—'}</h2>
          <p className="navix-profile-header__email">{user?.email}</p>
          <div className="d-flex flex-wrap gap-2">
            {role && <StatusBadge variant="primary" icon="bi-shield-check" label={role.label} />}
            <StatusBadge variant={status.variant} icon={status.icon} label={status.label} />
          </div>
        </div>
      </div>
      <div className="navix-profile-header__meta">
        {company && (
          <div className="navix-profile-header__item">
            <i className="bi bi-buildings" aria-hidden="true" />
            <div>
              <span className="navix-profile-header__item-label">Entreprise</span>
              <span className="navix-profile-header__item-value">{company.name}</span>
            </div>
          </div>
        )}
        {tenant && (
          <div className="navix-profile-header__item">
            <i className="bi bi-box" aria-hidden="true" />
            <div>
              <span className="navix-profile-header__item-label">Tenant</span>
              <span className="navix-profile-header__item-value">{tenant.name}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
