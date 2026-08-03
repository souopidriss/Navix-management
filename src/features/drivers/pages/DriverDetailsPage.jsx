/**
 * Navix Drivers — DriverDetailsPage
 * --------------------------------------------------------------------------
 * Détail d'un chauffeur : en-tête (photo, nom, code employé, badges,
 * statistiques), informations personnelles, professionnelles, entreprise,
 * permis de conduire, contact, documents (mock), historique (mock) et notes.
 * Actions (modifier / supprimer) et états chargement / erreur / introuvable.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Badge, Button, Card, Spinner } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES, driverEditPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useDriversStore } from '../store';
import { DriverAvatar, DriverStatusBadge, DriverLicenseBadge, DeleteDriverModal } from '../components';
import {
  getDriverStatus,
  getDriverAvailability,
  getGender,
  getDriverAge,
  getExpiryStatus,
} from '../constants';
import './DriverDetailsPage.css';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

const getTenureYears = (createdAt) => {
  if (!createdAt) return null;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;
  return Math.max(0, new Date().getFullYear() - created.getFullYear());
};

const InfoRow = ({ icon, label, children }) => (
  <div className="d-flex align-items-start gap-3 py-2">
    <span className="navix-driver-detail__icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <div className="min-w-0">
      <dt className="navix-driver-detail__label">{label}</dt>
      <dd className="navix-driver-detail__value mb-0">{children}</dd>
    </div>
  </div>
);

const StatBox = ({ icon, label, value }) => (
  <div className="navix-driver-detail__stat">
    <span className="navix-driver-detail__stat-icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <span className="navix-driver-detail__stat-body">
      <span className="navix-driver-detail__stat-value">{value}</span>
      <span className="navix-driver-detail__stat-label">{label}</span>
    </span>
  </div>
);

/** Historique simulé (affectations et trajets seront fournis par leurs modules). */
const MOCK_HISTORY = [
  { date: '2026-07-18', type: 'trip', label: 'Trajet Abidjan → Yamoussoukro (420 km)', icon: 'bi-signpost-2' },
  { date: '2026-06-27', type: 'assignment', label: 'Affecté au véhicule VHC-0021', icon: 'bi-truck' },
  { date: '2026-05-21', type: 'maintenance', label: 'Visite médicale à jour', icon: 'bi-heart-pulse' },
];

/** Documents simulés (la gestion réelle des documents sera traitée à part). */
const MOCK_DOCUMENTS = ['Contrat de travail', 'Visite médicale', 'Attestation de formation'];

const DriverDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedDriver = useDriversStore((state) => state.selectedDriver);
  const agencies = useDriversStore((state) => state.agencies);
  const isLoading = useDriversStore((state) => state.isLoading);
  const error = useDriversStore((state) => state.error);
  const fetchDriver = useDriversStore((state) => state.fetchDriver);
  const fetchAgencies = useDriversStore((state) => state.fetchAgencies);
  const deleteDriver = useDriversStore((state) => state.deleteDriver);
  const clearError = useDriversStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (id) fetchDriver(id);
    fetchCompanies();
    fetchAgencies();
  }, [id, fetchDriver, fetchCompanies, fetchAgencies]);

  const driver = selectedDriver?.id === id ? selectedDriver : null;

  const company = useMemo(
    () => (driver ? companies.find((item) => item.id === driver.companyId) : null),
    [companies, driver],
  );

  const agency = useMemo(
    () => (driver ? agencies.find((item) => item.id === driver.agencyId) : null),
    [agencies, driver],
  );

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteDriver(id);
    setIsDeleting(false);

    if (result.success) {
      toast.success('Chauffeur supprimé.');
      navigate(ROUTES.DRIVERS);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer le chauffeur.');
    }
  };

  const age = driver ? getDriverAge(driver.birthDate) : null;
  const tenure = driver ? getTenureYears(driver.createdAt) : null;
  const expiry = driver ? getExpiryStatus(driver.licenseExpiryDate) : null;
  const availability = driver ? getDriverAvailability(driver.availability) : null;
  const status = driver ? getDriverStatus(driver.status) : null;
  const gender = driver ? getGender(driver.gender) : null;

  const breadcrumbs = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Chauffeurs', to: ROUTES.DRIVERS },
    { label: driver ? driver.fullName : '…' },
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>{driver ? `${driver.fullName} — Navix Management` : 'Chauffeur — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title={driver ? driver.fullName : 'Chauffeur'}
        subtitle={driver ? `${driver.employeeCode} · ${driver.phone}` : undefined}
        icon="bi-person-badge"
        breadcrumbs={breadcrumbs}
        actions={
          driver ? (
            <div className="d-flex gap-2 flex-wrap">
              <Button variant="outline" icon="bi-pencil" onClick={() => navigate(driverEditPath(driver.id))}>
                Modifier
              </Button>
              <Button variant="outline" icon="bi-trash3" onClick={() => setDeleteOpen(true)}>
                Supprimer
              </Button>
            </div>
          ) : undefined
        }
      />

      {isLoading && !driver ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner size="lg" label="Chargement du chauffeur…" />
        </div>
      ) : error || !driver ? (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error || 'Chauffeur introuvable.'}
        </Alert>
      ) : (
        <>
          <div className="card mb-3">
            <div className="card-body d-flex flex-wrap align-items-center gap-3">
              <DriverAvatar src={driver.photo} fullName={driver.fullName} size="xl" />
              <div className="flex-grow-1 min-w-0">
                <h2 className="h4 mb-1">{driver.fullName}</h2>
                <p className="text-secondary mb-1">
                  {driver.employeeCode}
                  {gender?.label ? ` · ${gender.label}` : ''}
                  {driver.nationality ? ` · ${driver.nationality}` : ''}
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <DriverStatusBadge status={driver.status} />
                  <Badge variant={availability.variant} soft>
                    {availability.label}
                  </Badge>
                  <DriverLicenseBadge category={driver.licenseCategory} showLabel />
                  {company && (
                    <Badge variant="dark" soft>
                      {company.name}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="navix-driver-detail__stats d-flex gap-2 flex-wrap">
                <StatBox icon="bi-cake2" label="Âge" value={age ?? '—'} />
                <StatBox icon="bi-award" label="Expérience" value={driver.yearsExperience} />
                <StatBox icon="bi-calendar2-week" label="Ancienneté" value={tenure ?? '—'} />
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-7">
              <Card title="Informations personnelles">
                <dl className="mb-0">
                  <InfoRow icon="bi-gender-ambiguous" label="Genre">
                    {gender?.label || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-cake2" label="Date de naissance">
                    {formatDate(driver.birthDate)}
                    {age !== null ? ` (${age} ans)` : ''}
                  </InfoRow>
                  <InfoRow icon="bi-geo-alt" label="Adresse">
                    {[driver.address, driver.city, driver.country].filter(Boolean).join(', ') || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-telephone" label="Téléphone">
                    {driver.phone || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-envelope" label="Email">
                    {driver.email || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-shield-plus" label="Contact d’urgence">
                    {driver.emergencyContactName
                      ? `${driver.emergencyContactName}${driver.emergencyContactPhone ? ` · ${driver.emergencyContactPhone}` : ''}`
                      : '—'}
                  </InfoRow>
                </dl>
              </Card>

              <Card title="Informations professionnelles" className="mt-3">
                <dl className="mb-0">
                  <InfoRow icon="bi-upc-scan" label="Code employé">
                    <code>{driver.employeeCode}</code>
                  </InfoRow>
                  <InfoRow icon="bi-award" label="Années d’expérience">
                    {driver.yearsExperience}
                  </InfoRow>
                  <InfoRow icon="bi-check2-circle" label="Statut">
                    <Badge variant={status.variant} soft>
                      {status.label}
                    </Badge>
                  </InfoRow>
                  <InfoRow icon="bi-person-check" label="Disponibilité">
                    <Badge variant={availability.variant} soft>
                      {availability.label}
                    </Badge>
                  </InfoRow>
                  <InfoRow icon="bi-briefcase" label="Date d’embauche">
                    {formatDate(driver.createdAt)}
                  </InfoRow>
                </dl>
              </Card>

              <Card title="Entreprise" className="mt-3">
                <dl className="mb-0">
                  <InfoRow icon="bi-buildings" label="Entreprise">
                    {company ? company.name : '—'}
                  </InfoRow>
                  <InfoRow icon="bi-diagram-3" label="Agence">
                    {agency ? agency.name : '—'}
                  </InfoRow>
                  <InfoRow icon="bi-geo-alt" label="Ville de l’agence">
                    {agency?.city || '—'}
                  </InfoRow>
                </dl>
              </Card>
            </div>

            <div className="col-lg-5">
              <Card title="Permis de conduire">
                <dl className="mb-0">
                  <InfoRow icon="bi-card-text" label="Numéro">
                    {driver.licenseNumber || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-person-vcard" label="Catégorie">
                    <DriverLicenseBadge category={driver.licenseCategory} showLabel />
                  </InfoRow>
                  <InfoRow icon="bi-calendar-plus" label="Délivrance">
                    {formatDate(driver.licenseIssueDate)}
                  </InfoRow>
                  <InfoRow icon="bi-calendar-x" label="Expiration">
                    {formatDate(driver.licenseExpiryDate)}
                    {' '}
                    <Badge variant={expiry.variant} soft size="sm">
                      {expiry.label}
                    </Badge>
                  </InfoRow>
                </dl>
              </Card>

              <Card title="Documents" className="mt-3">
                <ul className="navix-driver-detail__docs mb-0">
                  {driver.identityDocument && (
                    <li>
                      <i className="bi bi-person-vcard me-2" aria-hidden="true" />
                      Pièce d’identité : <strong>{driver.identityDocument}</strong>
                    </li>
                  )}
                  {driver.photo && (
                    <li>
                      <i className="bi bi-image me-2" aria-hidden="true" />
                      <a href={driver.photo} target="_blank" rel="noreferrer" className="text-break">
                        Photo du chauffeur
                      </a>
                    </li>
                  )}
                  {MOCK_DOCUMENTS.map((document) => (
                    <li key={document}>
                      <i className="bi bi-file-earmark-text me-2" aria-hidden="true" />
                      {document}
                    </li>
                  ))}
                </ul>
                <p className="text-secondary small mb-0 mt-2">
                  Documents simulés — la gestion documentaire sera intégrée ultérieurement.
                </p>
              </Card>

              <Card title="Historique" className="mt-3">
                <ul className="navix-driver-detail__timeline mb-0">
                  {MOCK_HISTORY.map((entry) => (
                    <li key={`${entry.date}-${entry.label}`}>
                      <span className="navix-driver-detail__timeline-icon" aria-hidden="true">
                        <i className={`bi ${entry.icon}`} />
                      </span>
                      <span className="navix-driver-detail__timeline-body">
                        <span className="navix-driver-detail__timeline-label">{entry.label}</span>
                        <span className="navix-driver-detail__timeline-date">{formatDate(entry.date)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-secondary small mb-0 mt-2">
                  Historique simulé — affectations et trajets seront fournis par leurs modules.
                </p>
              </Card>

              <Card title="Notes" className="mt-3">
                <p className="mb-0 text-secondary">{driver.notes || 'Aucune note.'}</p>
              </Card>

              <Card title="Informations" className="mt-3">
                <dl className="mb-0">
                  <InfoRow icon="bi-calendar-plus" label="Ajouté le">
                    {formatDate(driver.createdAt)}
                  </InfoRow>
                  <InfoRow icon="bi-calendar-check" label="Mis à jour le">
                    {formatDate(driver.updatedAt)}
                  </InfoRow>
                </dl>
              </Card>
            </div>
          </div>

          <DeleteDriverModal
            driver={driver}
            open={deleteOpen}
            loading={isDeleting}
            error={deleteError}
            onConfirm={handleDelete}
            onClose={() => {
              setDeleteOpen(false);
              setDeleteError('');
            }}
          />
        </>
      )}
    </PageContainer>
  );
};

export default DriverDetailsPage;
