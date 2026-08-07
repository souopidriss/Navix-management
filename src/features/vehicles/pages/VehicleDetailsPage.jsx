/**
 * Navix Vehicles — VehicleDetailsPage
 * --------------------------------------------------------------------------
 * Détail d'un véhicule : en-tête (photo, immatriculation, badges), carte
 * d'identification, validité des documents, entreprise & affectation,
 * QR code et notes, actions (modifier / supprimer).
 * États chargement / erreur / introuvable gérés.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Badge, Button, Card, Spinner } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES, vehicleEditPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { AuditResourceActivity } from '@/features/audit/components';
import { useAuditPermissions } from '@/features/audit/hooks';
import { useVehiclesStore } from '../store';
import {
  VehicleImage,
  VehicleStatusBadge,
  VehicleGroupBadge,
  VehicleQRCode,
  DeleteVehicleModal,
} from '../components';
import {
  getFuelType,
  getTransmission,
  getExpiryStatus,
  formatMileage,
  formatVehicleDate,
} from '../constants';
import './VehicleDetailsPage.css';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

const InfoRow = ({ icon, label, children }) => (
  <div className="d-flex align-items-start gap-3 py-2">
    <span className="navix-details__icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <div className="min-w-0">
      <dt className="navix-details__label">{label}</dt>
      <dd className="navix-details__value mb-0">{children}</dd>
    </div>
  </div>
);

const StatBox = ({ icon, label, value }) => (
  <div className="navix-details__stat">
    <span className="navix-details__stat-icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <span className="navix-details__stat-body">
      <span className="navix-details__stat-value">{value}</span>
      <span className="navix-details__stat-label">{label}</span>
    </span>
  </div>
);

const ExpiryRow = ({ icon, label, date }) => {
  const expiry = getExpiryStatus(date);

  return (
    <div className="d-flex align-items-start gap-3 py-2">
      <span className="navix-details__icon" aria-hidden="true">
        <i className={`bi ${icon}`} />
      </span>
      <div className="min-w-0 flex-grow-1">
        <dt className="navix-details__label">{label}</dt>
        <dd className="navix-details__value mb-1">{formatVehicleDate(date)}</dd>
        <Badge variant={expiry.variant} soft size="sm">
          {expiry.label}
        </Badge>
      </div>
    </div>
  );
};

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedVehicle = useVehiclesStore((state) => state.selectedVehicle);
  const isLoading = useVehiclesStore((state) => state.isLoading);
  const error = useVehiclesStore((state) => state.error);
  const fetchVehicle = useVehiclesStore((state) => state.fetchVehicle);
  const deleteVehicle = useVehiclesStore((state) => state.deleteVehicle);
  const clearError = useVehiclesStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const { canView: canViewAudit } = useAuditPermissions();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (id) fetchVehicle(id);
    fetchCompanies();
  }, [id, fetchVehicle, fetchCompanies]);

  const vehicle = selectedVehicle?.id === id ? selectedVehicle : null;

  const company = useMemo(
    () => (vehicle ? companies.find((item) => item.id === vehicle.companyId) : null),
    [companies, vehicle],
  );

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteVehicle(id);
    setIsDeleting(false);

    if (result.success) {
      toast.success('Véhicule supprimé.');
      navigate(ROUTES.VEHICLES);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer le véhicule.');
    }
  };

  const fuel = vehicle ? getFuelType(vehicle.fuelType) : null;
  const transmission = vehicle ? getTransmission(vehicle.transmission) : null;

  const breadcrumbs = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Véhicules', to: ROUTES.VEHICLES },
    { label: vehicle ? vehicle.registrationNumber : '…' },
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>{vehicle ? `${vehicle.registrationNumber} — Navix Management` : 'Véhicule — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title={vehicle ? vehicle.registrationNumber : 'Véhicule'}
        subtitle={vehicle ? `${vehicle.brand} ${vehicle.model}${vehicle.version ? ` · ${vehicle.version}` : ''}` : undefined}
        icon="bi-truck"
        breadcrumbs={breadcrumbs}
        actions={
          vehicle ? (
            <div className="d-flex gap-2 flex-wrap">
              <Button variant="outline" icon="bi-pencil" onClick={() => navigate(vehicleEditPath(vehicle.id))}>
                Modifier
              </Button>
              <Button variant="outline" icon="bi-trash3" onClick={() => setDeleteOpen(true)}>
                Supprimer
              </Button>
            </div>
          ) : undefined
        }
      />

      {isLoading && !vehicle ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner size="lg" label="Chargement du véhicule…" />
        </div>
      ) : error || !vehicle ? (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error || 'Véhicule introuvable.'}
        </Alert>
      ) : (
        <>
          <div className="card mb-3">
            <div className="card-body d-flex flex-wrap align-items-center gap-3">
              <VehicleImage src={vehicle.photo} name={`${vehicle.brand} ${vehicle.model}`} size="xl" />
              <div className="flex-grow-1 min-w-0">
                <h2 className="h4 mb-1">
                  {vehicle.brand} {vehicle.model}
                </h2>
                <p className="text-secondary mb-1">
                  {vehicle.category}
                  {vehicle.version ? ` · ${vehicle.version}` : ''} · {vehicle.year}
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <VehicleStatusBadge status={vehicle.status} />
                  <VehicleGroupBadge group={vehicle.group} />
                  {company && (
                    <Badge variant="dark" soft>
                      {company.name}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="navix-details__stats d-flex gap-2 flex-wrap">
                <StatBox icon="bi-speedometer2" label="Kilométrage" value={formatMileage(vehicle.mileage)} />
                <StatBox icon="bi-people" label="Capacité" value={vehicle.capacity} />
                <StatBox icon="bi-calendar2-week" label="Année" value={vehicle.year} />
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-7">
              <Card title="Identification">
                <dl className="mb-0">
                  <InfoRow icon="bi-upc-scan" label="VIN">
                    <code className="text-break">{vehicle.vin}</code>
                  </InfoRow>
                  <InfoRow icon="bi-gear" label="N° moteur">
                    {vehicle.engineNumber || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-droplet" label="Carburant">
                    {fuel?.label || vehicle.fuelType || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-arrow-repeat" label="Transmission">
                    {transmission?.label || vehicle.transmission || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-palette" label="Couleur">
                    {vehicle.color || '—'}
                  </InfoRow>
                </dl>
              </Card>

              <Card title="Entreprise & affectation" className="mt-3">
                <dl className="mb-0">
                  <InfoRow icon="bi-buildings" label="Entreprise">
                    {company ? company.name : '—'}
                  </InfoRow>
                  <InfoRow icon="bi-diagram-3" label="Agence">
                    {vehicle.agency || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-person-badge" label="Conducteur actuel">
                    {vehicle.currentDriver || 'Non affecté'}
                  </InfoRow>
                </dl>
              </Card>

              <Card title="QR Code" className="mt-3">
                <div className="d-flex flex-column align-items-center gap-2 py-2">
                  <VehicleQRCode value={vehicle.qrCode} />
                  <p className="text-secondary small mb-0">
                    QR code simulé — la génération réelle sera intégrée ultérieurement.
                  </p>
                </div>
              </Card>
            </div>

            <div className="col-lg-5">
              <Card title="Validité des documents">
                <dl className="mb-0">
                  <ExpiryRow icon="bi-calendar-plus" label="Date d’achat" date={vehicle.purchaseDate} />
                  <ExpiryRow icon="bi-shield-check" label="Assurance" date={vehicle.insuranceExpiry} />
                  <ExpiryRow icon="bi-wrench-adjustable" label="Visite technique" date={vehicle.inspectionExpiry} />
                  <ExpiryRow icon="bi-file-earmark-text" label="Carte grise" date={vehicle.registrationExpiry} />
                </dl>
              </Card>

              <Card title="Notes" className="mt-3">
                <p className="mb-0 text-secondary">{vehicle.notes || 'Aucune note.'}</p>
              </Card>

              <Card title="Informations" className="mt-3">
                <dl className="mb-0">
                  <InfoRow icon="bi-calendar-plus" label="Ajouté le">
                    {formatDate(vehicle.createdAt)}
                  </InfoRow>
                  <InfoRow icon="bi-calendar-check" label="Mis à jour le">
                    {formatDate(vehicle.updatedAt)}
                  </InfoRow>
                </dl>
              </Card>

              {canViewAudit && (
                <AuditResourceActivity
                  resourceType="vehicle"
                  resourceId={vehicle.id}
                  title="Activité récente (journal)"
                  className="mt-3"
                />
              )}
            </div>
          </div>

          <DeleteVehicleModal
            vehicle={vehicle}
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

export default VehicleDetailsPage;
