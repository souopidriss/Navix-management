/**
 * Navix Maintenance — MaintenanceDetailsPage
 * --------------------------------------------------------------------------
 * Détail d'un entretien : en-tête (statut, type, priorité, entreprise,
 * alertes), statistiques, informations complètes, cycle de vie (Timeline),
 * pièces jointes (FileUploader) et notes. Actions (modifier / supprimer) et
 * états chargement / erreur / introuvable.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Badge, Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState } from '@/components/core';
import {
  ROUTES,
  maintenanceEditPath,
  vehicleDetailPath,
} from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '@/features/vehicles';
import { useMaintenanceStore } from '../store';
import {
  MaintenanceStatusBadge,
  MaintenancePriorityBadge,
  MaintenanceTypeBadge,
  MaintenanceAlertBadge,
  MaintenanceTimeline,
  MaintenanceDocuments,
  DeleteMaintenanceModal,
} from '../components';
import {
  getMaintenanceType,
  formatMaintenanceDate,
  formatMaintenanceMoney,
  formatMaintenanceMileage,
  isMaintenanceFinished,
  isMaintenanceLate,
  isMaintenanceUrgent,
} from '../constants';
import './MaintenanceDetailsPage.css';

const InfoRow = ({ icon, label, children }) => (
  <div className="d-flex align-items-start gap-3 py-2">
    <span className="navix-maint-detail__icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <div className="min-w-0">
      <dt className="navix-maint-detail__label">{label}</dt>
      <dd className="navix-maint-detail__value mb-0">{children}</dd>
    </div>
  </div>
);

const MaintenanceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedMaintenance = useMaintenanceStore((state) => state.selectedMaintenance);
  const isLoading = useMaintenanceStore((state) => state.isLoading);
  const error = useMaintenanceStore((state) => state.error);
  const fetchMaintenance = useMaintenanceStore((state) => state.fetchMaintenance);
  const updateMaintenance = useMaintenanceStore((state) => state.updateMaintenance);
  const deleteMaintenance = useMaintenanceStore((state) => state.deleteMaintenance);
  const clearError = useMaintenanceStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const vehicles = useVehiclesStore((state) => state.vehicles);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isSavingDocs, setIsSavingDocs] = useState(false);
  const [docsSaved, setDocsSaved] = useState(false);

  useEffect(() => {
    if (id) fetchMaintenance(id);
    fetchCompanies();
    fetchVehicles();
  }, [id, fetchMaintenance, fetchCompanies, fetchVehicles]);

  const maintenance = selectedMaintenance?.id === id ? selectedMaintenance : null;

  const company = useMemo(
    () => (maintenance ? companies.find((item) => item.id === maintenance.companyId) : null),
    [companies, maintenance],
  );

  const vehicle = useMemo(
    () => (maintenance ? vehicles.find((item) => item.id === maintenance.vehicleId) : null),
    [vehicles, maintenance],
  );

  const finished = maintenance ? isMaintenanceFinished(maintenance) : false;
  const late = maintenance ? isMaintenanceLate(maintenance, vehicle) : false;
  const urgent = maintenance ? isMaintenanceUrgent(maintenance) : false;

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteMaintenance(id);
    setIsDeleting(false);

    if (result.success) {
      toast.success('Entretien supprimé.');
      navigate(ROUTES.ENTRETIENS);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer l’entretien.');
    }
  };

  const handleSaveAttachments = async (attachments) => {
    if (!id || finished) return;
    setIsSavingDocs(true);
    setDocsSaved(false);

    const result = await updateMaintenance(id, { attachments });
    setIsSavingDocs(false);

    if (result.success) {
      setDocsSaved(true);
      toast.success('Pièces jointes enregistrées.');
    }
  };

  const type = maintenance ? getMaintenanceType(maintenance.maintenanceType) : null;

  const breadcrumbs = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Entretiens', to: ROUTES.ENTRETIENS },
    { label: maintenance ? maintenance.maintenanceNumber : '…' },
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>{maintenance ? `${maintenance.maintenanceNumber} — Navix Management` : 'Entretien — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title={maintenance ? maintenance.maintenanceNumber : 'Entretien'}
        subtitle={maintenance ? formatMaintenanceDate(maintenance.scheduledDate) : undefined}
        icon="bi-wrench-adjustable"
        breadcrumbs={breadcrumbs}
        actions={
          maintenance ? (
            <div className="d-flex gap-2 flex-wrap">
              <Button
                variant="outline"
                icon="bi-pencil"
                disabled={finished}
                title={finished ? 'Entretien clôturé' : undefined}
                onClick={() => navigate(maintenanceEditPath(maintenance.id))}
              >
                Modifier
              </Button>
              <Button variant="outline" icon="bi-trash3" onClick={() => setDeleteOpen(true)}>
                Supprimer
              </Button>
            </div>
          ) : undefined
        }
      />

      {isLoading && !maintenance ? (
        <LoadingState variant="text" lines={6} label="Chargement de l’entretien…" />
      ) : error || !maintenance ? (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error || 'Entretien introuvable.'}
        </Alert>
      ) : (
        <>
          <div className="card mb-3">
            <div className="card-body d-flex flex-wrap align-items-center gap-3">
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex flex-wrap gap-2">
                  <MaintenanceStatusBadge status={maintenance.status} />
                  {type && <MaintenanceTypeBadge type={maintenance.maintenanceType} />}
                  <MaintenancePriorityBadge priority={maintenance.priority} />
                  {company && (
                    <Badge variant="dark" soft>
                      {company.name}
                    </Badge>
                  )}
                </div>
                <div className="navix-maint-detail__alerts">
                  <MaintenanceAlertBadge maintenance={maintenance} vehicle={vehicle} />
                </div>
                <p className="text-secondary mb-0 mt-2">
                  {vehicle?.registrationNumber ?? '—'}
                  {vehicle?.brand && vehicle?.model ? ` · ${vehicle.brand} ${vehicle.model}` : ''}
                  {maintenance.workshop ? ` · ${maintenance.workshop}` : ''}
                </p>
              </div>
              <div className="navix-maint-detail__stats d-flex gap-2 flex-wrap">
                <div className="navix-maint-detail__stat">
                  <span className="navix-maint-detail__stat-icon" aria-hidden="true">
                    <i className="bi bi-cash-stack" />
                  </span>
                  <span className="navix-maint-detail__stat-body">
                    <span className="navix-maint-detail__stat-value">
                      {formatMaintenanceMoney(maintenance.actualCost || maintenance.estimatedCost, maintenance.currency)}
                    </span>
                    <span className="navix-maint-detail__stat-label">Coût</span>
                  </span>
                </div>
                <div className="navix-maint-detail__stat">
                  <span className="navix-maint-detail__stat-icon" aria-hidden="true">
                    <i className="bi bi-speedometer2" />
                  </span>
                  <span className="navix-maint-detail__stat-body">
                    <span className="navix-maint-detail__stat-value">
                      {formatMaintenanceMileage(maintenance.mileage)}
                    </span>
                    <span className="navix-maint-detail__stat-label">Kilométrage</span>
                  </span>
                </div>
                <div className="navix-maint-detail__stat">
                  <span className="navix-maint-detail__stat-icon" aria-hidden="true">
                    <i className="bi bi-calendar3" />
                  </span>
                  <span className="navix-maint-detail__stat-body">
                    <span className="navix-maint-detail__stat-value">
                      {formatMaintenanceDate(maintenance.scheduledDate)}
                    </span>
                    <span className="navix-maint-detail__stat-label">Date prévue</span>
                  </span>
                </div>
                <div className="navix-maint-detail__stat">
                  <span className="navix-maint-detail__stat-icon" aria-hidden="true">
                    <i className="bi bi-signpost" />
                  </span>
                  <span className="navix-maint-detail__stat-body">
                    <span className="navix-maint-detail__stat-value">
                      {formatMaintenanceMileage(maintenance.nextMileage)}
                    </span>
                    <span className="navix-maint-detail__stat-label">Prochain km</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-7">
              <Card title="Informations de l’entretien">
                <dl className="mb-0">
                  <InfoRow icon="bi-buildings" label="Entreprise">
                    {company?.name || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-truck" label="Véhicule">
                    {vehicle ? (
                      <Button
                        variant="link"
                        className="p-0 navix-maint-detail__link"
                        onClick={() => navigate(vehicleDetailPath(vehicle.id))}
                      >
                        {vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim()}
                      </Button>
                    ) : (
                      '—'
                    )}
                  </InfoRow>
                  <InfoRow icon="bi-tools" label="Atelier">
                    {maintenance.workshop || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-person-gear" label="Mécanicien">
                    {maintenance.mechanic || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-box-seam" label="Fournisseur">
                    {maintenance.supplier || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-journal-text" label="Description">
                    {maintenance.description || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-stethoscope" label="Diagnostic">
                    {maintenance.diagnostic || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-hammer" label="Travaux effectués">
                    {maintenance.performedWork || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-gear" label="Pièces remplacées">
                    {Array.isArray(maintenance.replacedParts) && maintenance.replacedParts.length > 0 ? (
                      <ul className="navix-maint-detail__parts mb-0">
                        {maintenance.replacedParts.map((part) => (
                          <li key={part}>{part}</li>
                        ))}
                      </ul>
                    ) : (
                      '—'
                    )}
                  </InfoRow>
                  <InfoRow icon="bi-cash-stack" label="Coût estimé">
                    {formatMaintenanceMoney(maintenance.estimatedCost, maintenance.currency)}
                  </InfoRow>
                  <InfoRow icon="bi-receipt" label="Coût réel">
                    {formatMaintenanceMoney(maintenance.actualCost, maintenance.currency)}
                  </InfoRow>
                  <InfoRow icon="bi-currency-exchange" label="Devise">
                    {maintenance.currency || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-calendar2-check" label="Prochain entretien">
                    {formatMaintenanceDate(maintenance.nextMaintenanceDate)}
                    {maintenance.nextMileage
                      ? ` ou ${formatMaintenanceMileage(maintenance.nextMileage)}`
                      : ''}
                  </InfoRow>
                  <InfoRow icon="bi-person-plus" label="Créé le">
                    {formatMaintenanceDate(maintenance.createdAt)}
                    {maintenance.createdBy ? ` par ${maintenance.createdBy}` : ''}
                  </InfoRow>
                  <InfoRow icon="bi-arrow-repeat" label="Mis à jour le">
                    {formatMaintenanceDate(maintenance.updatedAt)}
                  </InfoRow>
                </dl>
              </Card>

              {urgent && (
                <Alert variant="danger" className="mt-3">
                  <i className="bi bi-exclamation-triangle-fill me-1" aria-hidden="true" />
                  Entretien prioritaire : intervention à planifier sans délai.
                </Alert>
              )}

              {late && (
                <Alert variant="warning" className="mt-3">
                  <i className="bi bi-clock-history me-1" aria-hidden="true" />
                  Cet entretien est en retard : échéance dépassée ou seuil kilométrique atteint.
                </Alert>
              )}

              <Card title="Notes" className="mt-3">
                <p className="mb-0 text-secondary">{maintenance.notes || 'Aucune note.'}</p>
              </Card>
            </div>

            <div className="col-lg-5">
              <Card title="Cycle de vie">
                <MaintenanceTimeline maintenance={maintenance} />
              </Card>

              <Card title="Pièces jointes" className="mt-3">
                <MaintenanceDocuments
                  maintenance={maintenance}
                  readOnly={finished}
                  onSave={handleSaveAttachments}
                  saving={isSavingDocs}
                  saved={docsSaved}
                  onResetSaved={() => setDocsSaved(false)}
                />
              </Card>
            </div>
          </div>

          <DeleteMaintenanceModal
            maintenance={maintenance}
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

export default MaintenanceDetailsPage;
