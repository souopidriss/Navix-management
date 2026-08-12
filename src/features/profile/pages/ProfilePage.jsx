/**
 * Navix Profile — ProfilePage
 * --------------------------------------------------------------------------
 * Espace du profil utilisateur courant (`/dashboard/profile`).
 * Identité (prénom, nom, téléphone, poste, avatar) éditée via le store auth
 * (mock) ; email, rôle, entreprise et tenant affichés en lecture seule.
 * Route protégée par les guards existants (ProtectedRoute + RBAC).
 */
import { Helmet } from 'react-helmet-async';
import { Alert, Card } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { useProfile, useProfileForm } from '../hooks';
import { toProfileFormValues } from '../schemas';
import { ProfileHeader, ProfileIdentityForm, ProfileAccountCard, ProfilePasswordCard } from '../components';
import '../profile.css';

const ProfilePage = () => {
  const { user, company, tenant, currentRole, isSaving, error, clearError, updateProfile } = useProfile();

  const { values, errors, setField, reset, handleSubmit } = useProfileForm({
    user,
    onSubmit: (payload) => updateProfile(payload),
  });

  if (!user) {
    return (
      <PageContainer>
        <Helmet>
          <title>Profil — Navix Management</title>
        </Helmet>
        <LoadingState variant="text" lines={6} label="Chargement du profil…" />
      </PageContainer>
    );
  }

  const handleReset = () => {
    reset(toProfileFormValues(user));
  };

  return (
    <PageContainer>
      <Helmet>
        <title>Profil — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Profil"
        subtitle="Gérez votre identité et vos informations de compte."
        icon="bi-person"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Profil' },
        ]}
      />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <ProfileHeader user={user} company={company} tenant={tenant} currentRole={currentRole} />

      <div className="row g-3 mt-1">
        <div className="col-lg-8">
          <Card
            title="Identité"
            subtitle="Ces informations sont visibles par les autres utilisateurs de votre espace."
          >
            <ProfileIdentityForm
              values={values}
              errors={errors}
              setField={setField}
              email={user.email}
              onSubmit={handleSubmit}
              isSaving={isSaving}
              onReset={handleReset}
            />
          </Card>
        </div>

        <div className="col-lg-4">
          <div className="navix-profile-side">
            <ProfileAccountCard user={user} company={company} tenant={tenant} currentRole={currentRole} />
            <ProfilePasswordCard />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ProfilePage;
