import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Badge, Button, Card, Spinner } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  DeleteModal,
  ConfirmDialog,
  StatusBadge,
} from '@/components/core';
import { Can } from '@/features/rbac/components';
import { PERMISSIONS } from '@/features/rbac/constants';
import {
  getVehicleStatus,
  getVehicleGroup,
  getFuelType,
  getTransmission,
  getExpiryStatus,
  formatMileage,
  formatVehicleDate,
} from '@/features/vehicles/constants';
import { ROUTES } from '@/routes/route.constants';
import { useClientData } from '../hooks/useClientData';
import { useClientVehicle } from '../hooks/useClientVehicle';
import { clientVehicleService, getNextVehicleStatuses } from '../services/clientVehicleService';
import ClientVehicleFormModal from '../components/ClientFleet/ClientVehicleFormModal';
import FleetVehicleImage from '../components/ClientFleet/FleetVehicleImage';
import '../components/ClientFleet/ClientFleet.css';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

const InfoRow = ({ icon, label, children }) => (
  <div className="d-flex align-items-start gap-3 py-2">
    <span className="navix-fleet-details__icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <div className="min-w-0">
      <dt className="navix-fleet-details__label">{label}</dt>
      <dd className="navix-fleet-details__value mb-0">{children}</dd>
    </div>
  </div>
);

const StatBox = ({ icon, label, value }) => (
  <div className="navix-fleet-details__stat">
    <span className="navix-fleet-details__stat-icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <span className="navix-fleet-details__stat-body">
      <span className="navix-fleet-details__stat-value">{value}</span>
      <span className="navix-fleet-details__stat-label">{label}</span>
    </span>
  </div>
);

const ExpiryRow = ({ icon, label, date }) => {
  const expiry = getExpiryStatus(date);
  return (
    <div className="d-flex align-items-start gap-3 py-2">
      <span className="navix-fleet-details__icon" aria-hidden="true">
        <i className={`bi ${icon}`} />
      </span>
      <div className="min-w-0 flex-grow-1">
        <dt className="navix-fleet-details__label">{label}</dt>
        <dd className="navix-fleet-details__value mb-1">{formatVehicleDate(date)}</dd>
        <Badge variant={expiry.variant} soft size="sm">
          {expiry.label}
        </Badge>
      </div>
    </div>
  );
};

const ClientVehicleDetailsPage = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { currentClient, isEnterprise } = useClientData();
  const { vehicle, isLoading, error, refetch } = useClientVehicle(vehicleId);

  const [editOpen, setEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [statusOpen, setStatusOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusError, setStatusError] = useState('');

  const statusOptions = vehicle ? getNextVehicleStatuses(vehicle.status) : [];

  const handleFormSubmit = async (payload) => {
    if (!vehicle) return;
    setIsSaving(true);
    setFormError('');
    try {
      await clientVehicleService.update(vehicle.id, payload);
      toast.success('Véhicule mis à jour.');
      setEditOpen(false);
      refetch();
    } catch (err) {
      setFormError(err?.message || 'Impossible d’enregistrer le véhicule.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!vehicle) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await clientVehicleService.remove(vehicle.id);
      toast.success('Véhicule supprimé de votre flotte.');
      navigate(ROUTES.CLIENT_VEHICLES);
    } catch (err) {
      setDeleteError(err?.message || 'Impossible de supprimer le véhicule.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!vehicle || !nextStatus) return;
    setIsUpdating(true);
    setStatusError('');
    try {
      await clientVehicleService.updateStatus(vehicle.id, nextStatus);
      toast.success('Statut du véhicule mis à jour.');
      setStatusOpen(false);
      setNextStatus('');
      refetch();
    } catch (err) {
      setStatusError(err?.message || 'Changement de statut refusé.');
    } finally {
      setIsUpdating(false);
    }
  };

  const breadcrumbs = [
    { label: 'Espace Client', to: ROUTES.CLIENT_DASHBOARD },
    { label: 'Ma flotte', to: ROUTES.CLIENT_VEHICLES },
    { label: vehicle ? vehicle.registrationNumber : '…' },
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>{vehicle ? `${vehicle.registrationNumber} — Navix Client` : 'Véhicule — Navix Client'}</title>
      </Helmet>

      <PageHeader
        title={vehicle ? vehicle.registrationNumber : 'Véhicule'}
        subtitle={vehicle ? `${vehicle.brand} ${vehicle.model}${vehicle.version ? ` · ${vehicle.version}` : ''}` : undefined}
        icon="bi-truck"
        breadcrumbs={breadcrumbs}
        actions={
          vehicle && isEnterprise ? (
            <div className="d-flex gap-2 flex-wrap">
              {statusOptions.length > 0 && (
                <Can permission={PERMISSIONS.CLIENT_VEHICLES_UPDATE}>
                  <Button
                    variant="outline"
                    icon="bi-arrow-repeat"
                    onClick={() => {
                      setNextStatus('');
                      setStatusError('');
                      setStatusOpen(true);
                    }}
                  >
                    Changer le statut
                  </Button>
                </Can>
              )}
              <Can permission={PERMISSIONS.CLIENT_VEHICLES_UPDATE}>
                <Button
                  variant="outline"
                  icon="bi-pencil"
                  onClick={() => {
                    setFormError('');
                    setEditOpen(true);
                  }}
                >
                  Modifier
                </Button>
              </Can>
              <Can permission={PERMISSIONS.CLIENT_VEHICLES_DELETE}>
                <Button variant="outline" icon="bi-trash3" onClick={() => setDeleteOpen(true)}>
                  Supprimer
                </Button>
              </Can>
            </div>
          ) : undefined
        }
      />

      {isLoading && !vehicle ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner size="lg" label="Chargement du véhicule…" />
        </div>
      ) : error || !vehicle ? (
        <Alert variant="danger" closable onClose={() => refetch()} className="mb-3">
          {error || 'Véhicule introuvable.'}
        </Alert>
      ) : (
        <>
          <div className="card mb-3">
            <div className="card-body d-flex flex-wrap align-items-center gap-3">
              <FleetVehicleImage vehicle={vehicle} size="xl" />
              <div className="flex-grow-1 min-w-0">
                <h2 className="h4 mb-1">
                  {vehicle.brand} {vehicle.model}
                </h2>
                <p className="text-secondary mb-1">
                  {vehicle.category}
                  {vehicle.version ? ` · ${vehicle.version}` : ''} · {vehicle.year}
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <StatusBadge
                    variant={getVehicleStatus(vehicle.status).variant}
                    label={getVehicleStatus(vehicle.status).label}
                    icon={getVehicleStatus(vehicle.status).icon}
                  />
                  <span className="badge bg-secondary-subtle text-body">
                    <i className={`bi ${getVehicleGroup(vehicle.group).icon} me-1`} aria-hidden="true" />
                    Groupe {vehicle.group} · {getVehicleGroup(vehicle.group).label}
                  </span>
                  {vehicle.agency && (
                    <Badge variant="dark" soft>
                      {vehicle.agency}
                    </Badge>
                  )}
                  <Badge variant="info" soft>
                    🇨🇲 {vehicle.location || 'Cameroun'}
                  </Badge>
                </div>
              </div>
              <div className="navix-fleet-details__stats d-flex gap-2 flex-wrap">
                <StatBox icon="bi-speedometer2" label="Kilométrage" value={formatMileage(vehicle.mileage)} />
                <StatBox icon="bi-people" label="Capacité" value={vehicle.capacity} />
                <StatBox icon="bi-calendar2-week" label="Année" value={vehicle.year} />
                <StatBox
                  icon="bi-tools"
                  label="Prochaine maintenance"
                  value={vehicle.nextServiceKm ? formatMileage(vehicle.nextServiceKm) : '—'}
                />
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
                    {getFuelType(vehicle.fuelType).label}
                  </InfoRow>
                  <InfoRow icon="bi-arrow-repeat" label="Transmission">
                    {getTransmission(vehicle.transmission).label}
                  </InfoRow>
                  <InfoRow icon="bi-palette" label="Couleur">
                    {vehicle.color || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-qr-code" label="QR Code">
                    <code className="text-break">{vehicle.qrCode || '—'}</code>
                  </InfoRow>
                </dl>
              </Card>

              <Card title="Entreprise & affectation" className="mt-3">
                <dl className="mb-0">
                  <InfoRow icon="bi-buildings" label="Entreprise">
                    {currentClient?.companyName || 'Transports Express Cameroun'}
                  </InfoRow>
                  <InfoRow icon="bi-diagram-3" label="Agence">
                    {vehicle.agency || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-person-badge" label="Conducteur actuel">
                    {vehicle.currentDriver || 'Non affecté'}
                  </InfoRow>
                  <InfoRow icon="bi-geo-alt" label="Localisation">
                    {vehicle.location || '—'}
                  </InfoRow>
                </dl>
              </Card>

              <Card title="Maintenance & consommation" className="mt-3">
                <dl className="mb-0">
                  <InfoRow icon="bi-tools" label="Prochaine maintenance">
                    {vehicle.nextServiceKm ? formatMileage(vehicle.nextServiceKm) : '—'}
                  </InfoRow>
                  <InfoRow icon="bi-fuel-pump" label="Consommation moyenne">
                    {vehicle.fuelAvg ? `${vehicle.fuelAvg} L/100 km` : '—'}
                  </InfoRow>
                  <InfoRow icon="bi-graph-up" label="Kilométrage / mois">
                    {formatMileage(vehicle.kmMonth)}
                  </InfoRow>
                </dl>
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
            </div>
          </div>

          <ClientVehicleFormModal
            key={`${vehicle.id}-${editOpen}`}
            open={editOpen}
            onClose={() => setEditOpen(false)}
            vehicle={vehicle}
            vehicles={[vehicle]}
            onSubmit={handleFormSubmit}
            loading={isSaving}
            error={formError}
          />

          <DeleteModal
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            entityName={`${vehicle.brand} ${vehicle.model} (${vehicle.registrationNumber})`}
            title="Supprimer ce véhicule"
            loading={isDeleting}
            error={deleteError}
            onConfirm={handleDelete}
          />

          <ConfirmDialog
            open={statusOpen}
            onClose={() => setStatusOpen(false)}
            title="Changer le statut"
            icon="bi-arrow-repeat"
            confirmLabel="Appliquer"
            confirmVariant="primary"
            loading={isUpdating}
            error={statusError}
            onConfirm={handleStatusChange}
            message={
              <>
                <p className="mb-3">
                  Statut actuel :{' '}
                  <StatusBadge
                    variant={getVehicleStatus(vehicle.status).variant}
                    label={getVehicleStatus(vehicle.status).label}
                  />
                </p>
                {statusOptions.length === 0 ? (
                  <p className="text-secondary small mb-0">Aucune transition de statut autorisée depuis cet état.</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {statusOptions.map((status) => {
                      const meta = getVehicleStatus(status);
                      return (
                        <label key={status} className="navix-fleet-status-option">
                          <input
                            type="radio"
                            name="next-status"
                            value={status}
                            checked={nextStatus === status}
                            onChange={() => setNextStatus(status)}
                          />
                          <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} />
                        </label>
                      );
                    })}
                  </div>
                )}
              </>
            }
          />
        </>
      )}
    </PageContainer>
  );
};

export default ClientVehicleDetailsPage;
