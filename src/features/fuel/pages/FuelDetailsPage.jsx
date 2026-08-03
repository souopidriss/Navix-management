/**
 * Navix Fuel — FuelDetailsPage
 * --------------------------------------------------------------------------
 * Détail d'un plein de carburant : en-tête (statut, type, entreprise),
 * statistiques, informations complètes (véhicule, chauffeur, trajet,
 * station, paiement), reçu, alerte de consommation anormale et notes.
 * Actions (modifier / supprimer) et états chargement / erreur / introuvable.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Badge, Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState } from '@/components/core';
import {
  ROUTES,
  fuelEditPath,
  vehicleDetailPath,
  driverDetailPath,
  tripDetailPath,
} from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '@/features/vehicles';
import { useDriversStore } from '@/features/drivers';
import { useTripsStore } from '@/features/trips';
import { useFuelStore } from '../store';
import { FuelStatusBadge, FuelReceiptCard, DeleteFuelModal } from '../components';
import {
  getFuelType,
  getPaymentMethod,
  formatFuelLongDate,
  formatFuelMoney,
  formatFuelQuantity,
  formatFuelUnitPrice,
  formatFuelConsumption,
  formatFuelMileage,
  isAbnormalFuelConsumption,
} from '../constants';
import './FuelDetailsPage.css';

const InfoRow = ({ icon, label, children }) => (
  <div className="d-flex align-items-start gap-3 py-2">
    <span className="navix-fuel-detail__icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <div className="min-w-0">
      <dt className="navix-fuel-detail__label">{label}</dt>
      <dd className="navix-fuel-detail__value mb-0">{children}</dd>
    </div>
  </div>
);

const FuelDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedFuel = useFuelStore((state) => state.selectedFuel);
  const isLoading = useFuelStore((state) => state.isLoading);
  const error = useFuelStore((state) => state.error);
  const fetchFuel = useFuelStore((state) => state.fetchFuel);
  const deleteFuel = useFuelStore((state) => state.deleteFuel);
  const clearError = useFuelStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const vehicles = useVehiclesStore((state) => state.vehicles);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);

  const drivers = useDriversStore((state) => state.drivers);
  const fetchDrivers = useDriversStore((state) => state.fetchDrivers);

  const trips = useTripsStore((state) => state.trips);
  const fetchTrips = useTripsStore((state) => state.fetchTrips);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (id) fetchFuel(id);
    fetchCompanies();
    fetchVehicles();
    fetchDrivers();
    fetchTrips();
  }, [id, fetchFuel, fetchCompanies, fetchVehicles, fetchDrivers, fetchTrips]);

  const fuel = selectedFuel?.id === id ? selectedFuel : null;

  const company = useMemo(
    () => (fuel ? companies.find((item) => item.id === fuel.companyId) : null),
    [companies, fuel],
  );

  const vehicle = useMemo(
    () => (fuel ? vehicles.find((item) => item.id === fuel.vehicleId) : null),
    [vehicles, fuel],
  );

  const driver = useMemo(
    () => (fuel ? drivers.find((item) => item.id === fuel.driverId) : null),
    [drivers, fuel],
  );

  const trip = useMemo(
    () => (fuel ? trips.find((item) => item.id === fuel.tripId) : null),
    [trips, fuel],
  );

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteFuel(id);
    setIsDeleting(false);

    if (result.success) {
      toast.success('Plein supprimé.');
      navigate(ROUTES.FUEL);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer le plein.');
    }
  };

  const type = fuel ? getFuelType(fuel.fuelType) : null;
  const payment = fuel ? getPaymentMethod(fuel.paymentMethod) : null;
  const abnormal = fuel ? isAbnormalFuelConsumption(fuel.consumptionAverage, vehicle?.category || '') : false;

  const breadcrumbs = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Carburant', to: ROUTES.FUEL },
    { label: fuel ? fuel.fuelNumber : '…' },
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>{fuel ? `${fuel.fuelNumber} — Navix Management` : 'Plein — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title={fuel ? fuel.fuelNumber : 'Plein de carburant'}
        subtitle={fuel ? formatFuelLongDate(fuel.createdAt) : undefined}
        icon="bi-fuel-pump"
        breadcrumbs={breadcrumbs}
        actions={
          fuel ? (
            <div className="d-flex gap-2 flex-wrap">
              <Button variant="outline" icon="bi-pencil" onClick={() => navigate(fuelEditPath(fuel.id))}>
                Modifier
              </Button>
              <Button variant="outline" icon="bi-trash3" onClick={() => setDeleteOpen(true)}>
                Supprimer
              </Button>
            </div>
          ) : undefined
        }
      />

      {isLoading && !fuel ? (
        <LoadingState variant="text" lines={6} label="Chargement du plein…" />
      ) : error || !fuel ? (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error || 'Plein introuvable.'}
        </Alert>
      ) : (
        <>
          <div className="card mb-3">
            <div className="card-body d-flex flex-wrap align-items-center gap-3">
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex flex-wrap gap-2">
                  <FuelStatusBadge status={fuel.status} />
                  {type && (
                    <Badge variant={type.variant} soft>
                      <i className={`bi ${type.icon} me-1`} aria-hidden="true" />
                      {type.label}
                    </Badge>
                  )}
                  {company && (
                    <Badge variant="dark" soft>
                      {company.name}
                    </Badge>
                  )}
                  {payment && (
                    <Badge variant={payment.variant} soft>
                      <i className={`bi ${payment.icon} me-1`} aria-hidden="true" />
                      {payment.label}
                    </Badge>
                  )}
                </div>
                <p className="text-secondary mb-0 mt-2">
                  {vehicle?.registrationNumber ?? '—'} · {driver?.fullName ?? '—'}
                </p>
              </div>
              <div className="navix-fuel-detail__stats d-flex gap-2 flex-wrap">
                <div className="navix-fuel-detail__stat">
                  <span className="navix-fuel-detail__stat-icon" aria-hidden="true">
                    <i className="bi bi-cash-stack" />
                  </span>
                  <span className="navix-fuel-detail__stat-body">
                    <span className="navix-fuel-detail__stat-value">
                      {formatFuelMoney(fuel.totalCost, fuel.currency)}
                    </span>
                    <span className="navix-fuel-detail__stat-label">Montant</span>
                  </span>
                </div>
                <div className="navix-fuel-detail__stat">
                  <span className="navix-fuel-detail__stat-icon" aria-hidden="true">
                    <i className="bi bi-droplet" />
                  </span>
                  <span className="navix-fuel-detail__stat-body">
                    <span className="navix-fuel-detail__stat-value">
                      {formatFuelQuantity(fuel.quantity)}
                    </span>
                    <span className="navix-fuel-detail__stat-label">Quantité</span>
                  </span>
                </div>
                <div className="navix-fuel-detail__stat">
                  <span className="navix-fuel-detail__stat-icon" aria-hidden="true">
                    <i className="bi bi-speedometer2" />
                  </span>
                  <span className="navix-fuel-detail__stat-body">
                    <span className="navix-fuel-detail__stat-value">
                      {formatFuelConsumption(fuel.consumptionAverage)}
                    </span>
                    <span className="navix-fuel-detail__stat-label">Conso</span>
                  </span>
                </div>
                <div className="navix-fuel-detail__stat">
                  <span className="navix-fuel-detail__stat-icon" aria-hidden="true">
                    <i className="bi bi-signpost" />
                  </span>
                  <span className="navix-fuel-detail__stat-body">
                    <span className="navix-fuel-detail__stat-value">
                      {formatFuelMileage(fuel.mileage)}
                    </span>
                    <span className="navix-fuel-detail__stat-label">Kilométrage</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-7">
              <Card title="Informations du plein">
                <dl className="mb-0">
                  <InfoRow icon="bi-buildings" label="Entreprise">
                    {company?.name || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-truck" label="Véhicule">
                    {vehicle ? (
                      <Button
                        variant="link"
                        className="p-0 navix-fuel-detail__link"
                        onClick={() => navigate(vehicleDetailPath(vehicle.id))}
                      >
                        {vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim()}
                      </Button>
                    ) : (
                      '—'
                    )}
                  </InfoRow>
                  <InfoRow icon="bi-person-badge" label="Chauffeur">
                    {driver ? (
                      <Button
                        variant="link"
                        className="p-0 navix-fuel-detail__link"
                        onClick={() => navigate(driverDetailPath(driver.id))}
                      >
                        {driver.fullName}
                      </Button>
                    ) : (
                      '—'
                    )}
                  </InfoRow>
                  <InfoRow icon="bi-signpost-split" label="Trajet lié">
                    {trip ? (
                      <Button
                        variant="link"
                        className="p-0 navix-fuel-detail__link"
                        onClick={() => navigate(tripDetailPath(trip.id))}
                      >
                        {trip.tripNumber}
                      </Button>
                    ) : (
                      '—'
                    )}
                  </InfoRow>
                  <InfoRow icon="bi-fuel-pump" label="Station">
                    {fuel.stationName || '—'}
                    {fuel.stationCity ? ` · ${fuel.stationCity}` : ''}
                  </InfoRow>
                  <InfoRow icon="bi-cash-coin" label="Mode de paiement">
                    {payment?.label || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-receipt-cutoff" label="N° de facture">
                    {fuel.invoiceNumber || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-tag" label="Prix unitaire">
                    {formatFuelUnitPrice(fuel.unitPrice, fuel.currency)}
                  </InfoRow>
                  <InfoRow icon="bi-droplet" label="Quantité">
                    {formatFuelQuantity(fuel.quantity)}
                  </InfoRow>
                  <InfoRow icon="bi-cash-stack" label="Montant total">
                    {formatFuelMoney(fuel.totalCost, fuel.currency)}
                  </InfoRow>
                  <InfoRow icon="bi-speedometer2" label="Consommation moyenne">
                    {formatFuelConsumption(fuel.consumptionAverage)}
                  </InfoRow>
                  <InfoRow icon="bi-signpost" label="Kilométrage">
                    {formatFuelMileage(fuel.mileage)}
                  </InfoRow>
                  <InfoRow icon="bi-calendar2-event" label="Créé le">
                    {formatFuelLongDate(fuel.createdAt)}
                    {fuel.createdBy ? ` par ${fuel.createdBy}` : ''}
                  </InfoRow>
                  <InfoRow icon="bi-calendar-check" label="Mis à jour le">
                    {formatFuelLongDate(fuel.updatedAt)}
                  </InfoRow>
                </dl>
              </Card>

              {abnormal && (
                <Alert variant="warning" className="mt-3">
                  <i className="bi bi-exclamation-triangle-fill me-1" aria-hidden="true" />
                  Consommation moyenne anormale ({formatFuelConsumption(fuel.consumptionAverage)}) par
                  rapport à la référence de la catégorie « {vehicle?.category ?? '—'} ».
                </Alert>
              )}

              <Card title="Notes" className="mt-3">
                <p className="mb-0 text-secondary">{fuel.notes || 'Aucune note.'}</p>
              </Card>
            </div>

            <div className="col-lg-5">
              <FuelReceiptCard fuel={fuel} />
            </div>
          </div>

          <DeleteFuelModal
            fuel={fuel}
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

export default FuelDetailsPage;
