import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  LoadingState,
  ErrorState,
  StatusBadge,
} from '@/components/core';
import {
  getDriverStatus,
  getDriverAvailability,
  getLicenseCategory,
  getGender,
  formatDriverDate,
  getDriverAge,
  getExpiryStatus,
} from '@/features/drivers/constants';
import { ASSIGNMENT_ICON } from '@/features/assignments/constants';
import { TRIP_ICON } from '@/features/trips/constants';
import { ROUTES, clientDriverDetailPath, clientTripDetailPath } from '@/routes/route.constants';
import { useClientData } from '../hooks/useClientData';
import { useClientDriver } from '../hooks/useClientDriver';
import { useClientAssignments } from '../hooks/useClientAssignments';
import { useClientTrips } from '../hooks/useClientTrips';
import '../components/ClientOperations/ClientOperations.css';

const DetailItem = ({ icon, label, value, mono }) => (
  <div className="navix-ops-detail-item">
    <div className="navix-ops-detail-item__label">
      <i className={`bi ${icon}`} aria-hidden="true" />
      {label}
    </div>
    <div className={`navix-ops-detail-item__value ${mono ? 'font-monospace' : ''}`}>{value}</div>
  </div>
);

const ClientDriverDetailsPage = () => {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const { isEnterprise } = useClientData();
  const { driver, isLoading, error, refetch } = useClientDriver(driverId);
  const { assignments, refetch: refetchAssignments } = useClientAssignments();
  const { trips } = useClientTrips();

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement de la fiche chauffeur…" />
      </PageContainer>
    );
  }

  if (error || !driver) {
    return (
      <PageContainer>
        <ErrorState
          title="Chauffeur introuvable"
          description={error || 'Ce chauffeur n’existe pas ou a été supprimé.'}
          retry={refetch}
        />
      </PageContainer>
    );
  }

  const driverAssignments = assignments.filter((a) => a.driverId === driver.id);
  const activeAssignment = driverAssignments.find((a) => a.status === 'active');
  const driverTrips = trips.filter((t) => t.driverId === driver.id);
  const inProgressTrip = driverTrips.find((t) => t.status === 'in_progress');

  const status = getDriverStatus(driver.status);
  const availability = getDriverAvailability(driver.availability);
  const licenseCategory = getLicenseCategory(driver.licenseCategory);
  const licenseExpiry = getExpiryStatus(driver.licenseExpiryDate);
  const age = getDriverAge(driver.birthDate);

  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchAssignments()]);
    toast.success('Fiche actualisée.');
  };

  return (
    <PageContainer>
      <Helmet>
        <title>{driver.fullName} — Navix Client</title>
      </Helmet>

      <PageHeader
        title={driver.fullName}
        subtitle={`Chauffeur ${driver.employeeCode} · ${driver.agencyId || 'Agence'} · Cameroun 🇨🇲`}
        icon="bi-person-vcard"
        breadcrumbs={[
          { label: 'Espace Client', to: ROUTES.CLIENT_DASHBOARD },
          { label: 'Mes chauffeurs', to: ROUTES.CLIENT_DRIVERS },
          { label: driver.fullName, to: clientDriverDetailPath(driver.id) },
        ]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" icon="bi-arrow-left" onClick={() => navigate(ROUTES.CLIENT_DRIVERS)}>
              Retour
            </Button>
            <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={handleRefresh} aria-label="Actualiser">
              <span className="visually-hidden">Actualiser</span>
            </Button>
          </div>
        }
      />

      {!isEnterprise ? (
        <ErrorState
          title="Profil non disponible"
          description="La gestion des chauffeurs n’est pas disponible pour un client particulier."
        />
      ) : (
        <>
          <div className="navix-ops-identity mb-4">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="navix-driver-avatar" style={{ width: 56, height: 56, fontSize: '1.5rem' }} aria-hidden="true">
                <i className="bi bi-person-badge" />
              </div>
              <div className="flex-grow-1 min-w-0">
                <h5 className="mb-1 fw-bold text-body-emphasis">
                  {driver.fullName}
                  {age != null ? <span className="text-body-secondary fw-normal ms-2 small">{age} ans</span> : null}
                </h5>
                <div className="d-flex gap-2 flex-wrap">
                  <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />
                  <StatusBadge variant={availability.variant} label={availability.label} icon={availability.icon} />
                </div>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                {activeAssignment ? (
                  <Link
                    to={ROUTES.CLIENT_ASSIGNMENTS}
                    className="btn btn-sm btn-outline-success"
                  >
                    <i className={`bi ${ASSIGNMENT_ICON} me-1`} aria-hidden="true" />
                    Affectation en cours
                  </Link>
                ) : (
                  <span className="badge bg-body-secondary px-3 py-2">Aucune affectation active</span>
                )}
                {inProgressTrip ? (
                  <Link to={clientTripDetailPath(inProgressTrip.id)} className="btn btn-sm btn-outline-info">
                    <i className={`bi ${TRIP_ICON} me-1`} aria-hidden="true" />
                    Trajet en cours
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12">
              <div className="navix-ops-panel">
                <h6 className="navix-ops-panel__title">
                  <i className="bi bi-person-badge" aria-hidden="true" />
                  Identité
                </h6>
                <div className="navix-ops-detail-grid">
                  <DetailItem icon="bi-upc-scan" label="Code employé" value={driver.employeeCode} mono />
                  <DetailItem icon="bi-gender-ambiguous" label="Genre" value={getGender(driver.gender).label} />
                  <DetailItem icon="bi-cake" label="Date de naissance" value={formatDriverDate(driver.birthDate)} />
                  <DetailItem icon="bi-telephone" label="Téléphone" value={driver.phone || '—'} mono />
                  <DetailItem icon="bi-envelope" label="Email" value={driver.email || '—'} />
                  <DetailItem icon="bi-building" label="Agence" value={driver.agencyId || '—'} />
                  <DetailItem icon="bi-geo-alt" label="Ville" value={driver.city || '—'} />
                  <DetailItem icon="bi-house" label="Adresse" value={driver.address || '—'} />
                  <DetailItem icon="bi-card-text" label="Pièce d’identité" value={driver.identityDocument || '—'} mono />
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="navix-ops-panel">
                <h6 className="navix-ops-panel__title">
                  <i className="bi bi-card-checklist" aria-hidden="true" />
                  Permis de conduire
                </h6>
                <div className="navix-ops-detail-grid">
                  <DetailItem icon="bi-person-vcard" label="Numéro" value={driver.licenseNumber || '—'} mono />
                  <DetailItem icon="bi-grid" label="Catégorie" value={driver.licenseCategory || '—'} />
                  <DetailItem icon="bi-card-list" label="Libellé" value={licenseCategory.label} />
                  <DetailItem icon="bi-calendar-plus" label="Délivré le" value={formatDriverDate(driver.licenseIssueDate)} />
                  <DetailItem icon="bi-calendar-x" label="Expire le" value={formatDriverDate(driver.licenseExpiryDate)} />
                  <DetailItem icon="bi-shield-check" label="Validité" value={licenseExpiry.label} />
                  <DetailItem icon="bi-briefcase" label="Expérience" value={`${driver.yearsExperience ?? 0} ans`} />
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="navix-ops-panel">
                <h6 className="navix-ops-panel__title">
                  <i className="bi bi-shield-plus" aria-hidden="true" />
                  Contact d’urgence
                </h6>
                <div className="navix-ops-detail-grid">
                  <DetailItem icon="bi-person" label="Nom" value={driver.emergencyContactName || '—'} />
                  <DetailItem icon="bi-telephone" label="Téléphone" value={driver.emergencyContactPhone || '—'} mono />
                  <DetailItem icon="bi-journal-text" label="Notes" value={driver.notes || '—'} />
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="navix-ops-panel">
                <h6 className="navix-ops-panel__title">
                  <i className={ASSIGNMENT_ICON} aria-hidden="true" />
                  Affectations ({driverAssignments.length})
                </h6>
                {driverAssignments.length === 0 ? (
                  <p className="text-secondary small mb-0">Aucune affectation enregistrée pour ce chauffeur.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Affectation</th>
                          <th>Début</th>
                          <th>Fin</th>
                          <th>Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {driverAssignments.map((a) => (
                          <tr key={a.id}>
                            <td>
                              <span className="fw-semibold font-monospace">{a.assignmentNumber}</span>
                            </td>
                            <td>{a.startDate || '—'}</td>
                            <td>{a.endDate || '—'}</td>
                            <td>
                              <span className="badge bg-secondary-subtle text-body">{a.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="col-12">
              <div className="navix-ops-panel">
                <h6 className="navix-ops-panel__title">
                  <i className={TRIP_ICON} aria-hidden="true" />
                  Trajets ({driverTrips.length})
                </h6>
                {driverTrips.length === 0 ? (
                  <p className="text-secondary small mb-0">Aucun trajet enregistré pour ce chauffeur.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Trajet</th>
                          <th>Itinéraire</th>
                          <th>Date</th>
                          <th>Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {driverTrips.map((t) => (
                          <tr key={t.id}>
                            <td>
                              <Link to={clientTripDetailPath(t.id)} className="fw-semibold font-monospace">
                                {t.tripNumber}
                              </Link>
                            </td>
                            <td>
                              {t.departureLocation || '—'} → {t.arrivalLocation || '—'}
                            </td>
                            <td>{t.departureDate || '—'}</td>
                            <td>
                              <span className="badge bg-secondary-subtle text-body">{t.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
};

export default ClientDriverDetailsPage;
