/**
 * Navix Driver — DriverProfilePage
 * --------------------------------------------------------------------------
 * Profil du chauffeur connecté : identité, coordonnées, permis de conduire,
 * contact d'urgence et adresse.
 */
import { Helmet } from 'react-helmet-async';
import { formatDate } from '@/utils/format';
import { Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState, ErrorState, StatusBadge } from '@/components/core';
import { useDriverProfile } from '../hooks/useDriverProfile';
import {
  computeDriverDocumentStatus,
  getDriverDocumentStatus,
  daysUntil,
} from '../constants/driver.constants';

const InfoRow = ({ label, value }) => (
  <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary-subtle">
    <span className="text-muted small">{label}</span>
    <span className="fw-medium text-end">{value || '—'}</span>
  </div>
);

const DriverProfilePage = () => {
  const { data: profile, isLoading, error, refetch } = useDriverProfile();

  if (isLoading && !profile) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement de votre profil…" />
      </PageContainer>
    );
  }

  if (error && !profile) {
    return (
      <PageContainer>
        <ErrorState
          title="Profil indisponible"
          description="Impossible de charger votre profil pour le moment."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  const initials = `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase();

  const breadcrumbs = [{ label: 'Espace Chauffeur' }, { label: 'Mon profil' }];

  return (
    <PageContainer>
      <Helmet>
        <title>Mon profil — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Mon profil"
        subtitle="Vos informations personnelles et professionnelles."
        icon="bi-person-badge"
        breadcrumbs={breadcrumbs}
        actions={
          <Button variant="outline" size="sm" icon="bi-arrow-clockwise" onClick={refetch}>
            Actualiser
          </Button>
        }
      />

      <div className="row g-3">
        {/* ── Identité ─────────────────────────────────────────────────── */}
        <div className="col-lg-7">
          <Card
            title={
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-person text-primary" aria-hidden="true" />
                Identité
              </span>
            }
            className="mb-3"
          >
            <div className="d-flex align-items-center gap-3 pb-3 border-bottom border-secondary-subtle mb-2">
              <span
                className="rounded-3 bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                style={{ width: '4.5rem', height: '4.5rem', fontSize: '1.75rem' }}
                aria-hidden="true"
              >
                {initials}
              </span>
              <div>
                <h2 className="h4 fw-bold mb-1">{profile.displayName}</h2>
                <p className="mb-2 text-muted">{profile.role}</p>
                <StatusBadge variant="success" label="Actif" icon="bi-check-circle" />
              </div>
            </div>

            <InfoRow label="Entreprise" value={profile.company} />
            <InfoRow label="Agence" value={profile.agency} />
            <InfoRow label="N° d\u2019immatriculation" value={profile.registrationNumber} />
            <InfoRow label="Date d\u2019embauche" value={formatDate(profile.joinDate)} />
          </Card>

          <Card
            title={
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-geo-alt text-primary" aria-hidden="true" />
                Adresse
              </span>
            }
          >
            <p className="mb-0">{profile.address}</p>
          </Card>
        </div>

        {/* ── Coordonnées, permis & urgence ─────────────────────────────── */}
        <div className="col-lg-5">
          <Card
            title={
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-envelope text-primary" aria-hidden="true" />
                Coordonnées
              </span>
            }
            className="mb-3"
          >
            <InfoRow label="E-mail" value={profile.email} />
            <InfoRow label="Téléphone" value={profile.phone} />
          </Card>

          <Card
            title={
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-person-vcard text-primary" aria-hidden="true" />
                Permis de conduire
              </span>
            }
            className="mb-3"
          >
            <div className="pb-2 mb-1 d-flex justify-content-between align-items-center">
              <span className="text-muted small">Validité</span>
              {(() => {
                const status = computeDriverDocumentStatus({
                  status: 'valid',
                  expiryDate: profile.license.expiryDate,
                });
                const meta = getDriverDocumentStatus(status);
                const days = daysUntil(profile.license.expiryDate);
                return (
                  <span className="d-flex align-items-center gap-2">
                    <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} />
                    {Number.isFinite(days) && days >= 0 && (
                      <span className="text-muted small">J-{days}</span>
                    )}
                  </span>
                );
              })()}
            </div>
            <InfoRow label="N° de permis" value={profile.license.number} />
            <InfoRow label="Catégorie" value={profile.license.category} />
            <InfoRow label="Délivré le" value={formatDate(profile.license.issuedDate)} />
            <InfoRow label="Expire le" value={formatDate(profile.license.expiryDate)} />
          </Card>

          <Card
            title={
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-shield-plus text-primary" aria-hidden="true" />
                Contact d\u2019urgence
              </span>
            }
          >
            <InfoRow label="Nom" value={profile.emergencyContact.name} />
            <InfoRow label="Téléphone" value={profile.emergencyContact.phone} />
            <InfoRow label="Lien" value={profile.emergencyContact.relation} />
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default DriverProfilePage;
