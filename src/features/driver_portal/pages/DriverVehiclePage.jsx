/**
 * Navix Driver — DriverVehiclePage
 * --------------------------------------------------------------------------
 * Présentation du véhicule assigné : identité, statistiques, caractéristiques,
 * assurance et prochain entretien.
 */
import { Helmet } from 'react-helmet-async';
import { formatNumber } from '@/utils/format';
import { Button, Card } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  LoadingState,
  ErrorState,
  StatusBadge,
} from '@/components/core';
import { useDriverVehicle } from '../hooks/useDriverVehicle';
import { formatDriverMoney } from '../constants/driver.constants';
import './DriverPortal.css';

const SpecRow = ({ label, value }) => (
  <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary-subtle">
    <span className="text-muted small">{label}</span>
    <span className="fw-medium">{value || '—'}</span>
  </div>
);

const DriverVehiclePage = () => {
  const { data: vehicle, isLoading, error, refetch } = useDriverVehicle();

  if (isLoading && !vehicle) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement de votre véhicule…" />
      </PageContainer>
    );
  }

  if (error && !vehicle) {
    return (
      <PageContainer>
        <ErrorState
          title="Véhicule indisponible"
          description="Impossible de charger les informations de votre véhicule."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  const vehicleStatus =
    vehicle.status === 'available'
      ? { variant: 'success', label: 'Disponible' }
      : { variant: 'info', label: 'En service' };

  const breadcrumbs = [{ label: 'Espace Chauffeur' }, { label: 'Mon véhicule' }];

  return (
    <PageContainer>
      <Helmet>
        <title>Mon véhicule — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Mon véhicule"
        subtitle="Véhicule qui vous est assigné par la flotte."
        icon="bi-truck"
        breadcrumbs={breadcrumbs}
        actions={
          <Button variant="outline" size="sm" icon="bi-arrow-clockwise" onClick={refetch}>
            Actualiser
          </Button>
        }
      />

      {/* ── Identité du véhicule ───────────────────────────────────────── */}
      <div className="navix-card p-4 mb-4">
        <div className="row align-items-center g-4">
          <div className="col-lg-8">
            <div className="d-flex align-items-center gap-4">
              <span
                className="rounded-3 bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '4.5rem', height: '4.5rem', fontSize: '2.25rem' }}
                aria-hidden="true"
              >
                <i className="bi bi-truck-front" />
              </span>
              <div>
                <h2 className="h4 fw-bold mb-1">
                  {vehicle.brand} {vehicle.model}
                </h2>
                <p className="mb-2 text-muted">
                  <span className="badge bg-light text-dark border border-secondary-subtle me-2">
                    {vehicle.registrationNumber}
                  </span>
                  {vehicle.year} · {vehicle.color}
                </p>
                <StatusBadge variant={vehicleStatus.variant} label={vehicleStatus.label} />
              </div>
            </div>
          </div>
          <div className="col-lg-4 text-lg-end">
            <div className="text-muted small">Kilométrage actuel</div>
            <div className="fs-3 fw-bold text-primary">{formatNumber(vehicle.mileage)} km</div>
          </div>
        </div>
      </div>

      {/* ── Statistiques ───────────────────────────────────────────────── */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Distance ce mois-ci', value: vehicle.stats.distanceMonth, icon: 'bi-speedometer2', variant: 'info' },
          { label: 'Consommation moyenne', value: vehicle.stats.avgConsumption, icon: 'bi-fuel-pump', variant: 'warning' },
          {
            label: 'Coût carburant / mois',
            value: formatDriverMoney(vehicle.stats.fuelCostMonth),
            icon: 'bi-cash-stack',
            variant: 'success',
          },
          { label: 'Trajets ce mois-ci', value: formatNumber(vehicle.stats.tripsMonth), icon: 'bi-signpost-split', variant: 'primary' },
        ].map((stat) => (
          <div key={stat.label} className="col-6 col-lg-3">
            <Card className="h-100">
              <div className="d-flex align-items-center gap-3">
                <i className={`bi ${stat.icon} fs-4 text-${stat.variant}`} aria-hidden="true" />
                <div>
                  <div className="fw-bold fs-5">{stat.value}</div>
                  <div className="text-muted small">{stat.label}</div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* ── Caractéristiques & documents ───────────────────────────────── */}
      <div className="row g-3">
        <div className="col-lg-6">
          <Card
            title={
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-sliders text-primary" aria-hidden="true" />
                Caractéristiques
              </span>
            }
            className="h-100"
          >
            <SpecRow label="Immatriculation" value={vehicle.registrationNumber} />
            <SpecRow label="Modèle" value={`${vehicle.brand} ${vehicle.model}`} />
            <SpecRow label="Année" value={vehicle.year} />
            <SpecRow label="Couleur" value={vehicle.color} />
            <SpecRow label="Moteur" value={vehicle.engine} />
            <SpecRow label="Puissance" value={vehicle.horsepower} />
            <SpecRow label="Carburant" value={vehicle.fuelType} />
            <SpecRow label="Boîte de vitesses" value={vehicle.gearbox} />
            <SpecRow label="Places" value={vehicle.seats} />
            <SpecRow label="Capacité de chargement" value={vehicle.loadCapacity} />
          </Card>
        </div>

        <div className="col-lg-6">
          <Card
            title={
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-shield-check text-primary" aria-hidden="true" />
                Assurance
              </span>
            }
            className="mb-3"
          >
            <SpecRow label="Assureur" value={vehicle.insurance.provider} />
            <SpecRow label="N° de police" value={vehicle.insurance.policyNumber} />
            <SpecRow label="Échéance" value={vehicle.insurance.expiryDate} />
          </Card>

          <Card
            title={
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-wrench-adjustable text-primary" aria-hidden="true" />
                Entretiens
              </span>
            }
          >
            <SpecRow label="Dernier entretien" value={vehicle.lastMaintenance} />
            <SpecRow label="Prochain entretien" value={vehicle.nextMaintenance} />
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default DriverVehiclePage;
