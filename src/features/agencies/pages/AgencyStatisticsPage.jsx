/**
 * Navix Agencies — AgencyStatisticsPage
 * --------------------------------------------------------------------------
 * Synthèse statistique d'une agence / site : volumes (véhicules, chauffeurs),
 * activité du mois courant (trajets, distance, carburant, entretiens,
 * documents), coûts année en cours, répartitions (statut des véhicules,
 * disponibilité des chauffeurs, groupes) et activité récente.
 */
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Alert, Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, StatsCards, LoadingState } from '@/components/core';
import { ROUTES, agencyDetailPath } from '@/routes/route.constants';
import { getVehicleStatus } from '@/features/vehicles';
import { getDriverAvailability } from '@/features/drivers';
import { useAgenciesStore } from '../store';
import { AgencyActivity } from '../components';
import {
  VEHICLE_GROUPS,
  formatAgencyMoney,
  formatAgencyDistance,
} from '../constants';
import './AgencyStatisticsPage.css';

const Distribution = ({ title, items, renderLabel, renderRight, getWidth, empty }) => (
  <Card title={title}>
    {items.length === 0 ? (
      <p className="text-secondary mb-0">{empty}</p>
    ) : (
      <ul className="list-group list-group-flush navix-agency-stat__distribution">
        {items.map((item, index) => {
          const width = getWidth(item, index);
          return (
            <li key={`${title}-${item.group ?? item.status ?? index}`} className="list-group-item px-0">
              <div className="d-flex align-items-center justify-content-between gap-2">
                <span className="navix-agency-stat__sub">
                  {renderLabel(item)}
                </span>
                <span className="navix-agency-stat__sub">{renderRight(item)}</span>
              </div>
              <div className="navix-agency-stat__progress">
                <div className="navix-agency-stat__progress-bar" style={{ width: `${width}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </Card>
);

const MetricLine = ({ label, icon, value }) => (
  <div className="navix-agency-stat__metric">
    <span className="navix-agency-stat__metric-icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <span className="navix-agency-stat__metric-label">{label}</span>
    <span className="navix-agency-stat__metric-value">{value}</span>
  </div>
);

const AgencyStatisticsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedAgency = useAgenciesStore((state) => state.selectedAgency);
  const statistics = useAgenciesStore((state) => state.statistics);
  const isLoading = useAgenciesStore((state) => state.isLoading);
  const error = useAgenciesStore((state) => state.error);
  const fetchAgency = useAgenciesStore((state) => state.fetchAgency);
  const fetchStatistics = useAgenciesStore((state) => state.fetchStatistics);
  const clearError = useAgenciesStore((state) => state.clearError);

  useEffect(() => {
    if (id) {
      fetchAgency(id);
      fetchStatistics(id);
    }
  }, [id, fetchAgency, fetchStatistics]);

  const agency = selectedAgency?.id === id ? selectedAgency : null;

  const stats = statistics
    ? [
        {
          key: 'vehicleCount',
          label: 'Véhicules',
          value: statistics.vehicleCount,
          icon: 'bi-truck',
          variant: 'primary',
        },
        {
          key: 'driverCount',
          label: 'Chauffeurs',
          value: statistics.driverCount,
          icon: 'bi-person-badge',
          variant: 'info',
        },
        {
          key: 'monthTrips',
          label: 'Trajets du mois',
          value: statistics.monthTrips,
          icon: 'bi-sign-turn-right',
          variant: 'success',
        },
        {
          key: 'monthDistance',
          label: 'Distance du mois',
          value: formatAgencyDistance(statistics.monthDistance),
          icon: 'bi-speedometer2',
          variant: 'warning',
        },
      ]
    : [];

  const costStats = statistics
    ? [
        {
          key: 'monthFuelCost',
          label: 'Carburant du mois',
          value: formatAgencyMoney(statistics.monthFuelCost),
          icon: 'bi-fuel-pump',
          variant: 'warning',
        },
        {
          key: 'fuelYtd',
          label: 'Carburant (année)',
          value: formatAgencyMoney(statistics.fuelYtd),
          icon: 'bi-cash-stack',
          variant: 'primary',
        },
        {
          key: 'monthMaintenanceCost',
          label: 'Entretiens du mois',
          value: formatAgencyMoney(statistics.monthMaintenanceCost),
          icon: 'bi-wrench-adjustable',
          variant: 'danger',
        },
        {
          key: 'maintenanceYtd',
          label: 'Entretiens (année)',
          value: formatAgencyMoney(statistics.maintenanceYtd),
          icon: 'bi-clipboard2-pulse',
          variant: 'info',
        },
      ]
    : [];

  const totalVehicles = statistics
    ? statistics.vehicleStatus.available +
      statistics.vehicleStatus.inUse +
      statistics.vehicleStatus.maintenance +
      statistics.vehicleStatus.outOfService
    : 0;

  const totalDrivers = statistics
    ? statistics.driverAvailability.available +
      statistics.driverAvailability.busy +
      statistics.driverAvailability.unavailable
    : 0;

  const vehicleStatusItems = statistics
    ? Object.entries(statistics.vehicleStatus).map(([status, count]) => ({ status, count }))
    : [];

  const driverAvailabilityItems = statistics
    ? Object.entries(statistics.driverAvailability).map(([availability, count]) => ({ availability, count }))
    : [];

  const pct = (count, total) => (total > 0 ? Math.round((count / total) * 100) : 0);

  return (
    <PageContainer>
      <Helmet>
        <title>{agency ? `Statistiques ${agency.name} — Navix Management` : 'Statistiques agence — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title={agency ? `Statistiques — ${agency.name}` : 'Statistiques de l’agence'}
        subtitle="Volumes, activité du mois et coûts de l’agence."
        icon="bi-bar-chart-line"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Agences', to: ROUTES.AGENCIES },
          { label: agency ? agency.name : '…', to: agency ? agencyDetailPath(agency.id) : undefined },
          { label: 'Statistiques' },
        ]}
        actions={
          <Button
            variant="outline"
            icon="bi-arrow-left"
            onClick={() => navigate(agency ? agencyDetailPath(agency.id) : ROUTES.AGENCIES)}
          >
            Retour
          </Button>
        }
      />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      {isLoading && !statistics ? (
        <LoadingState variant="cards" rows={4} label="Chargement des statistiques…" />
      ) : statistics ? (
        <>
          <StatsCards stats={stats} />
          <StatsCards stats={costStats} />

          <div className="row g-3 mt-0">
            <div className="col-lg-6">
              <Card title="Statut des véhicules">
                <div className="navix-agency-stat__metrics">
                  {vehicleStatusItems.map((item) => (
                    <MetricLine
                      key={item.status}
                      icon={getVehicleStatus(item.status).icon}
                      label={getVehicleStatus(item.status).label}
                      value={item.count}
                    />
                  ))}
                </div>
              </Card>

              <Card title="Disponibilité des chauffeurs" className="mt-3">
                <div className="navix-agency-stat__metrics">
                  {driverAvailabilityItems.map((item) => (
                    <MetricLine
                      key={item.availability}
                      icon={getDriverAvailability(item.availability).icon}
                      label={getDriverAvailability(item.availability).label}
                      value={item.count}
                    />
                  ))}
                </div>
              </Card>
            </div>

            <div className="col-lg-6">
              <Card title="Activité du mois">
                <div className="navix-agency-stat__metrics">
                  <MetricLine icon="bi-sign-turn-right" label="Trajets" value={statistics.monthTrips} />
                  <MetricLine icon="bi-fuel-pump" label="Pleins carburant" value={`${formatAgencyMoney(statistics.monthFuelCost)} · ${statistics.monthFuelQuantity} L`} />
                  <MetricLine icon="bi-wrench-adjustable" label="Entretiens" value={statistics.monthMaintenanceCount} />
                  <MetricLine icon="bi-file-earmark-arrow-up" label="Documents" value={statistics.monthDocuments} />
                </div>
              </Card>

              <Card title="Répartition par groupe de véhicules" className="mt-3">
                {statistics.groupDistribution.length === 0 ? (
                  <p className="text-secondary mb-0">Aucun véhicule rattaché.</p>
                ) : (
                  <ul className="list-group list-group-flush navix-agency-stat__distribution">
                    {statistics.groupDistribution.map((item) => {
                      const group = VEHICLE_GROUPS.find((g) => g.value === item.group);
                      const width = statistics.vehicleCount > 0 ? (item.count / statistics.vehicleCount) * 100 : 0;
                      return (
                        <li key={item.group} className="list-group-item px-0">
                          <div className="d-flex align-items-center justify-content-between gap-2">
                            <span className="navix-agency-stat__sub">
                              <i className={`bi ${group?.icon ?? 'bi-truck'} me-1`} aria-hidden="true" />
                              {group?.label ?? item.group}
                            </span>
                            <span className="navix-agency-stat__sub">
                              {item.count} · {pct(item.count, statistics.vehicleCount)} %
                            </span>
                          </div>
                          <div className="navix-agency-stat__progress">
                            <div className="navix-agency-stat__progress-bar" style={{ width: `${width}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            </div>
          </div>

          <div className="row g-3 mt-0">
            <div className="col-lg-6">
              <Distribution
                title="Répartition par statut (véhicules)"
                items={vehicleStatusItems}
                empty="Aucun véhicule rattaché."
                renderLabel={(item) => (
                  <>
                    <i className={`bi ${getVehicleStatus(item.status).icon} me-1`} aria-hidden="true" />
                    {getVehicleStatus(item.status).label}
                  </>
                )}
                renderRight={(item) => `${item.count} · ${pct(item.count, totalVehicles)} %`}
                getWidth={(item) => (totalVehicles > 0 ? (item.count / totalVehicles) * 100 : 0)}
              />
            </div>
            <div className="col-lg-6">
              <Distribution
                title="Répartition par disponibilité (chauffeurs)"
                items={driverAvailabilityItems}
                empty="Aucun chauffeur rattaché."
                renderLabel={(item) => (
                  <>
                    <i className={`bi ${getDriverAvailability(item.availability).icon} me-1`} aria-hidden="true" />
                    {getDriverAvailability(item.availability).label}
                  </>
                )}
                renderRight={(item) => `${item.count} · ${pct(item.count, totalDrivers)} %`}
                getWidth={(item) => (totalDrivers > 0 ? (item.count / totalDrivers) * 100 : 0)}
              />
            </div>
          </div>

          <Card title="Activité récente de l’agence" className="mt-3">
            <AgencyActivity activity={statistics.recentActivity ?? []} />
          </Card>
        </>
      ) : (
        <Alert variant="danger" className="mb-3">
          Statistiques indisponibles.
        </Alert>
      )}
    </PageContainer>
  );
};

export default AgencyStatisticsPage;
