/**
 * Navix Assignments — AssignmentDetailsPage
 * --------------------------------------------------------------------------
 * Détail d'une affectation : en-tête (numéro, statut, type, progression),
 * cartes véhicule et chauffeur, informations d'affectation, chronologie et
 * notes. Actions (modifier / terminer / supprimer) et états chargement /
 * erreur / introuvable.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Badge, Button, Card, Spinner } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES, assignmentEditPath, vehicleDetailPath, driverDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '@/features/vehicles';
import { useDriversStore } from '@/features/drivers';
import { useAssignmentsStore } from '../store';
import {
  AssignmentStatusBadge,
  AssignmentVehicleCard,
  AssignmentDriverCard,
  AssignmentTimeline,
  DeleteAssignmentModal,
  FinishAssignmentModal,
} from '../components';
import {
  getAssignmentType,
  getAssignmentStatus,
  getAssignmentProgress,
  formatAssignmentDate,
  formatAssignmentLongDate,
  formatAssignmentMileage,
} from '../constants';
import './AssignmentDetailsPage.css';

const InfoRow = ({ icon, label, children }) => (
  <div className="d-flex align-items-start gap-3 py-2">
    <span className="navix-assignment-detail__icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <div className="min-w-0">
      <dt className="navix-assignment-detail__label">{label}</dt>
      <dd className="navix-assignment-detail__value mb-0">{children}</dd>
    </div>
  </div>
);

const AssignmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedAssignment = useAssignmentsStore((state) => state.selectedAssignment);
  const isLoading = useAssignmentsStore((state) => state.isLoading);
  const error = useAssignmentsStore((state) => state.error);
  const fetchAssignment = useAssignmentsStore((state) => state.fetchAssignment);
  const finishAssignment = useAssignmentsStore((state) => state.finishAssignment);
  const deleteAssignment = useAssignmentsStore((state) => state.deleteAssignment);
  const clearError = useAssignmentsStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const vehicles = useVehiclesStore((state) => state.vehicles);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);

  const drivers = useDriversStore((state) => state.drivers);
  const agencies = useDriversStore((state) => state.agencies);
  const fetchDrivers = useDriversStore((state) => state.fetchDrivers);
  const fetchAgencies = useDriversStore((state) => state.fetchAgencies);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [finishOpen, setFinishOpen] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState('');

  useEffect(() => {
    if (id) fetchAssignment(id);
    fetchCompanies();
    fetchAgencies();
    fetchVehicles();
    fetchDrivers();
  }, [id, fetchAssignment, fetchCompanies, fetchAgencies, fetchVehicles, fetchDrivers]);

  const assignment = selectedAssignment?.id === id ? selectedAssignment : null;

  const company = useMemo(
    () => (assignment ? companies.find((item) => item.id === assignment.companyId) : null),
    [companies, assignment],
  );

  const agency = useMemo(
    () => (assignment ? agencies.find((item) => item.id === assignment.agencyId) : null),
    [agencies, assignment],
  );

  const vehicle = useMemo(
    () => (assignment ? vehicles.find((item) => item.id === assignment.vehicleId) : null),
    [vehicles, assignment],
  );

  const driver = useMemo(
    () => (assignment ? drivers.find((item) => item.id === assignment.driverId) : null),
    [drivers, assignment],
  );

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteAssignment(id);
    setIsDeleting(false);

    if (result.success) {
      toast.success('Affectation supprimée.');
      navigate(ROUTES.ASSIGNMENTS);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer l’affectation.');
    }
  };

  const handleFinish = async (values) => {
    if (!id) return;
    setIsFinishing(true);
    setFinishError('');

    const result = await finishAssignment(id, values);
    setIsFinishing(false);

    if (result.success) {
      toast.success('Affectation terminée.');
      setFinishOpen(false);
    } else {
      setFinishError(result.error || 'Impossible de terminer l’affectation.');
    }
  };

  const type = assignment ? getAssignmentType(assignment.assignmentType) : null;
  const status = assignment ? getAssignmentStatus(assignment.status) : null;
  const progress = assignment ? getAssignmentProgress(assignment) : null;

  const breadcrumbs = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Affectations', to: ROUTES.ASSIGNMENTS },
    { label: assignment ? assignment.assignmentNumber : '…' },
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>
          {assignment ? `${assignment.assignmentNumber} — Navix Management` : 'Affectation — Navix Management'}
        </title>
      </Helmet>

      <PageHeader
        title={assignment ? assignment.assignmentNumber : 'Affectation'}
        subtitle={assignment ? `Du ${formatAssignmentDate(assignment.startDate)}` : undefined}
        icon="bi-shuffle"
        breadcrumbs={breadcrumbs}
        actions={
          assignment ? (
            <div className="d-flex gap-2 flex-wrap">
              <Button variant="outline" icon="bi-pencil" onClick={() => navigate(assignmentEditPath(assignment.id))}>
                Modifier
              </Button>
              {assignment.status === 'active' && (
                <Button variant="success" icon="bi-check2-circle" onClick={() => setFinishOpen(true)}>
                  Terminer
                </Button>
              )}
              <Button variant="outline" icon="bi-trash3" onClick={() => setDeleteOpen(true)}>
                Supprimer
              </Button>
            </div>
          ) : undefined
        }
      />

      {isLoading && !assignment ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner size="lg" label="Chargement de l’affectation…" />
        </div>
      ) : error || !assignment ? (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error || 'Affectation introuvable.'}
        </Alert>
      ) : (
        <>
          <div className="card mb-3">
            <div className="card-body d-flex flex-wrap align-items-center gap-3">
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex flex-wrap gap-2">
                  <AssignmentStatusBadge status={assignment.status} />
                  {type && (
                    <Badge variant={type.variant} soft>
                      <i className={`bi ${type.icon} me-1`} aria-hidden="true" />
                      {type.label}
                    </Badge>
                  )}
                  {progress && (
                    <Badge variant={progress.variant} soft>
                      <i className="bi bi-clock me-1" aria-hidden="true" />
                      {progress.label}
                    </Badge>
                  )}
                  {company && (
                    <Badge variant="dark" soft>
                      {company.name}
                    </Badge>
                  )}
                </div>
                <p className="text-secondary mb-0 mt-2">
                  {driver?.fullName ?? '—'} · {vehicle?.registrationNumber ?? '—'}
                </p>
              </div>
              <div className="navix-assignment-detail__stats d-flex gap-2 flex-wrap">
                <div className="navix-assignment-detail__stat">
                  <span className="navix-assignment-detail__stat-icon" aria-hidden="true">
                    <i className="bi bi-calendar-plus" />
                  </span>
                  <span className="navix-assignment-detail__stat-body">
                    <span className="navix-assignment-detail__stat-value">
                      {formatAssignmentDate(assignment.startDate)}
                    </span>
                    <span className="navix-assignment-detail__stat-label">Début</span>
                  </span>
                </div>
                <div className="navix-assignment-detail__stat">
                  <span className="navix-assignment-detail__stat-icon" aria-hidden="true">
                    <i className="bi bi-calendar-check" />
                  </span>
                  <span className="navix-assignment-detail__stat-body">
                    <span className="navix-assignment-detail__stat-value">
                      {formatAssignmentDate(assignment.expectedEndDate)}
                    </span>
                    <span className="navix-assignment-detail__stat-label">Fin prévue</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-6">
              <AssignmentVehicleCard vehicle={vehicle} startMileage={assignment.startMileage} onView={vehicle ? (vehicleId) => navigate(vehicleDetailPath(vehicleId)) : undefined} />
            </div>
            <div className="col-lg-6">
              <AssignmentDriverCard driver={driver} onView={driver ? (driverId) => navigate(driverDetailPath(driverId)) : undefined} />
            </div>
          </div>

          <div className="row g-3 mt-0">
            <div className="col-lg-7">
              <Card title="Informations de l’affectation">
                <dl className="mb-0">
                  <InfoRow icon="bi-buildings" label="Entreprise">
                    {company?.name || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-diagram-3" label="Agence">
                    {agency?.name || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-upc-scan" label="Type">
                    {type?.label || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-flag" label="Statut">
                    <Badge variant={status.variant} soft>
                      {status.label}
                    </Badge>
                  </InfoRow>
                  <InfoRow icon="bi-geo-alt" label="Destination">
                    {assignment.destination || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-question-circle" label="Motif">
                    {assignment.reason || '—'}
                  </InfoRow>
                </dl>
              </Card>

              <Card title="Période & état du véhicule" className="mt-3">
                <dl className="mb-0">
                  <InfoRow icon="bi-calendar-plus" label="Date de début">
                    {formatAssignmentLongDate(assignment.startDate)}
                  </InfoRow>
                  <InfoRow icon="bi-calendar-check" label="Date de fin prévue">
                    {formatAssignmentLongDate(assignment.expectedEndDate)}
                  </InfoRow>
                  {assignment.endDate && (
                    <InfoRow icon="bi-flag" label="Date de fin réelle">
                      {formatAssignmentLongDate(assignment.endDate)}
                    </InfoRow>
                  )}
                  <InfoRow icon="bi-speedometer" label="Kilométrage de départ">
                    {formatAssignmentMileage(assignment.startMileage)}
                    {assignment.endMileage !== undefined && assignment.endMileage !== null
                      ? ` → ${formatAssignmentMileage(assignment.endMileage)}`
                      : ''}
                  </InfoRow>
                  <InfoRow icon="bi-fuel-pump" label="Carburant au départ">
                    {assignment.fuelLevelStart !== undefined && assignment.fuelLevelStart !== null
                      ? `${assignment.fuelLevelStart} %`
                      : '—'}
                    {assignment.fuelLevelEnd !== undefined && assignment.fuelLevelEnd !== null
                      ? ` → ${assignment.fuelLevelEnd} %`
                      : ''}
                  </InfoRow>
                  <InfoRow icon="bi-person-badge" label="Créé par">
                    {assignment.createdBy || '—'}
                  </InfoRow>
                  {assignment.validatedBy && (
                    <InfoRow icon="bi-shield-check" label="Validé par">
                      {assignment.validatedBy}
                    </InfoRow>
                  )}
                </dl>
              </Card>
            </div>

            <div className="col-lg-5">
              <Card title="Chronologie">
                <AssignmentTimeline assignment={assignment} />
              </Card>

              <Card title="Notes" className="mt-3">
                <p className="mb-0 text-secondary">{assignment.notes || 'Aucune note.'}</p>
              </Card>
            </div>
          </div>

          <DeleteAssignmentModal
            assignment={assignment}
            open={deleteOpen}
            loading={isDeleting}
            error={deleteError}
            onConfirm={handleDelete}
            onClose={() => {
              setDeleteOpen(false);
              setDeleteError('');
            }}
          />

          <FinishAssignmentModal
            assignment={assignment}
            open={finishOpen}
            loading={isFinishing}
            error={finishError}
            onSubmit={handleFinish}
            onClose={() => {
              setFinishOpen(false);
              setFinishError('');
            }}
          />
        </>
      )}
    </PageContainer>
  );
};

export default AssignmentDetailsPage;
