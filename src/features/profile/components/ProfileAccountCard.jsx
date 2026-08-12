/**
 * Navix Profile — ProfileAccountCard
 * --------------------------------------------------------------------------
 * Récapitulatif en lecture seule du compte courant : rôle (catalogue RBAC),
 * entreprise, tenant, statut et date d'ouverture. Source : session auth.
 */
import { Card } from '@/components/ui';
import { getRole } from '@/features/rbac/utils/access';
import { getUserStatus } from '@/features/users/constants';
import { formatUserDate } from '@/features/users/constants';

const Row = ({ icon, label, value, strong = false }) => (
  <div className="navix-profile-row">
    <i className={`bi ${icon} navix-profile-row__icon`} aria-hidden="true" />
    <div className="navix-profile-row__body">
      <span className="navix-profile-row__label">{label}</span>
      <span className={`navix-profile-row__value ${strong ? 'navix-profile-row__value--strong' : ''}`}>
        {value ?? '—'}
      </span>
    </div>
  </div>
);

const ProfileAccountCard = ({ user, company, tenant, currentRole }) => {
  const role = getRole(currentRole ?? user?.role);
  const status = getUserStatus(user?.status);

  return (
    <Card title="Informations du compte" subtitle="Données non modifiables depuis le profil.">
      <div className="navix-profile-rows">
        <Row icon="bi-shield-check" label="Rôle" value={role?.label} strong />
        <Row icon={status.icon} label="Statut" value={status.label} />
        {company && <Row icon="bi-buildings" label="Entreprise" value={company.name} />}
        {company?.slug && <Row icon="bi-link-45deg" label="Slug entreprise" value={company.slug} />}
        {tenant && <Row icon="bi-box" label="Tenant" value={tenant.name} />}
        {user?.createdAt && <Row icon="bi-calendar-plus" label="Membre depuis" value={formatUserDate(user.createdAt)} />}
        {user?.lastLoginAt && <Row icon="bi-clock-history" label="Dernière connexion" value={formatUserDate(user.lastLoginAt)} />}
      </div>
    </Card>
  );
};

export default ProfileAccountCard;
