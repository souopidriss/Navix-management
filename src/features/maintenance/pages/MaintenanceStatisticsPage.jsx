/**
 * Navix Maintenance — MaintenanceStatisticsPage
 * --------------------------------------------------------------------------
 * Synthèse statistique des entretiens : volumes, coûts (année / mois /
 * moyen), alertes (retard, échéances proches, urgences, véhicules
 * immobilisés), évolution mensuelle (6 mois, graphique CSS pur), distribution
 * par type, top ateliers et top véhicules.
 */
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Alert, Badge, Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, StatsCards, LoadingState } from '@/components/core';
import { ROUTES, maintenanceDetailPath } from '@/routes/route.constants';
import { useVehiclesStore } from '@/features/vehicles';
import { useMaintenanceStore } from '../store';
import { MaintenanceStatusBadge } from '../components';
import {
  getMaintenanceType,
  formatMaintenanceDate,
  formatMaintenanceMoney,
  isMaintenanceImmobilizing,
} from '../constants';
import './MaintenanceStatisticsPage.css';

const MaintenanceStatisticsPage = () => {
  const navigate = useNavigate();

  const statistics = useMaintenanceStore((state) => state.statistics);
  const maintenanceRecords = useMaintenanceStore((state) => state.maintenanceRecords);
  const isLoading = useMaintenanceStore((state) => state.isLoading);
  const error = useMaintenanceStore((state) => state.error);
  const fetchStatistics = useMaintenanceStore((state) => state.fetchStatistics);
  const fetchMaintenanceRecords = useMaintenanceStore((state) => state.fetchMaintenanceRecords);
  const clearError = useMaintenanceStore((state) => state.clearError);

  const vehicles = useVehiclesStore((state) => state.vehicles);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);

  useEffect(() => {
    fetchStatistics();
    fetchMaintenanceRecords();
    fetchVehicles();
  }, [fetchStatistics, fetchMaintenanceRecords, fetchVehicles]);

  const vehicleById = useMemo(
    () => Object.fromEntries(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles],
  );

  const vehicleLabel = (id) => {
    const vehicle = vehicleById[id] ?? {};
    return (
      vehicle.registrationNumber ||
      `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim() ||
      '—'
    );
  };

  const immobilized = maintenanceRecords.filter(isMaintenanceImmobilizing);

  const stats = statistics
    ? [
        {
          key: 'totalCount',
          label: 'Entretiens',
          value: statistics.totalCount,
          icon: 'bi-wrench-adjustable',
          variant: 'primary',
        },
        {
          key: 'yearCost',
          label: 'Coût de l’année',
          value: formatMaintenanceMoney(statistics.yearCost),
          icon: 'bi-cash-stack',
          variant: 'success',
        },
        {
          key: 'monthCost',
          label: 'Coût du mois',
          value: formatMaintenanceMoney(statistics.monthCost),
          icon: 'bi-calendar-month',
          variant: 'info',
        },
        {
          key: 'averageCost',
          label: 'Coût moyen',
          value: formatMaintenanceMoney(statistics.averageCost),
          icon: 'bi-bar-chart',
          variant: 'warning',
        },
      ]
    : [];

  const maxMonthCost = statistics?.monthlyEvolution?.length
    ? Math.max(...statistics.monthlyEvolution.map((item) => item.totalCost), 0)
    : 0;

  const maxTypeCost = statistics?.typeDistribution?.length
    ? Math.max(...statistics.typeDistribution.map((item) => item.totalCost), 0)
    : 0;

  return (
    <PageContainer>
      <Helmet>
        <title>Statistiques entretiens — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Statistiques entretiens"
        subtitle="Analyse des coûts et du suivi de la maintenance des véhicules."
        icon="bi-bar-chart-line"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Entretiens', to: ROUTES.ENTRETIENS },
          { label: 'Statistiques' },
        ]}
        actions={
          <Button variant="outline" icon="bi-arrow-left" onClick={() => navigate(ROUTES.ENTRETIENS)}>
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

          <div className="row g-3">
            <div className="col-lg-6">
              <Card title="Alertes & prochaines échéances">
                <div className="navix-maint-stat__metrics">
                  <div className="navix-maint-stat__metric">
                    <Badge variant="danger" soft>
                      {statistics.lateCount}
                    </Badge>
                    <span>En retard</span>
                  </div>
                  <div className="navix-maint-stat__metric">
                    <Badge variant="warning" soft>
                      {statistics.dueSoonCount}
                    </Badge>
                    <span>Échéances proches</span>
                  </div>
                  <div className="navix-maint-stat__metric">
                    <Badge variant="danger" soft>
                      {statistics.urgentCount}
                    </Badge>
                    <span>Urgents</span>
                  </div>
                  <div className="navix-maint-stat__metric">
                    <Badge variant="primary" soft>
                      {statistics.immobilizedCount}
                    </Badge>
                    <span>Véhicules immobilisés</span>
                  </div>
                </div>

                {statistics.nextDueSoon.length === 0 ? (
                  <p className="text-secondary mb-0">Aucune échéance proche.</p>
                ) : (
                  <ul className="list-group list-group-flush navix-maint-stat__ranking">
                    {statistics.nextDueSoon.map((record) => (
                      <li key={`${record.id}-${record.eventDate}`} className="list-group-item d-flex align-items-center gap-3 px-0">
                        <span className="flex-grow-1 min-w-0">
                          <button
                            type="button"
                            className="navix-maint-stat__link"
                            onClick={() => navigate(maintenanceDetailPath(record.id))}
                          >
                            {record.maintenanceNumber}
                          </button>
                          <span className="navix-maint-stat__sub d-block">
                            {getMaintenanceType(record.maintenanceType).label} · {vehicleLabel(record.vehicleId)}
                          </span>
                        </span>
                        <span className="text-end">
                          <span className="navix-maint-stat__date">{formatMaintenanceDate(record.eventDate)}</span>
                          <MaintenanceStatusBadge status={record.status} size="sm" className="d-inline-block mt-1" />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              {immobilized.length > 0 && (
                <Card title="Véhicules immobilisés" className="mt-3">
                  <ul className="list-group list-group-flush navix-maint-stat__ranking">
                    {immobilized.map((record) => (
                      <li key={record.id} className="list-group-item d-flex align-items-center gap-3 px-0">
                        <span className="navix-maint-stat__icon" aria-hidden="true">
                          <i className="bi bi-pause-circle-fill" />
                        </span>
                        <span className="flex-grow-1 min-w-0">
                          <button
                            type="button"
                            className="navix-maint-stat__link"
                            onClick={() => navigate(maintenanceDetailPath(record.id))}
                          >
                            {record.maintenanceNumber}
                          </button>
                          <span className="navix-maint-stat__sub d-block">
                            {vehicleLabel(record.vehicleId)} · {getMaintenanceType(record.maintenanceType).label}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>

            <div className="col-lg-6">
              <Card title="Évolution mensuelle — Coût">
                {statistics.monthlyEvolution.length === 0 ? (
                  <p className="text-secondary mb-0">Aucune donnée.</p>
                ) : (
                  <div className="navix-maint-stat__chart">
                    {statistics.monthlyEvolution.map((item) => {
                      const height = maxMonthCost > 0 ? (item.totalCost / maxMonthCost) * 100 : 0;
                      return (
                        <div key={item.month} className="navix-maint-stat__bar-col">
                          <span className="navix-maint-stat__bar-value">{formatMaintenanceMoney(item.totalCost)}</span>
                          <div className="navix-maint-stat__bar-track" title={`${item.label} : ${formatMaintenanceMoney(item.totalCost)}`}>
                            <div className="navix-maint-stat__bar" style={{ height: `${height}%` }} />
                          </div>
                          <span className="navix-maint-stat__bar-label">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              <Card title="Distribution par type" className="mt-3">
                {statistics.typeDistribution.length === 0 ? (
                  <p className="text-secondary mb-0">Aucune donnée.</p>
                ) : (
                  <ul className="list-group list-group-flush navix-maint-stat__ranking">
                    {statistics.typeDistribution.map((item) => {
                      const type = getMaintenanceType(item.type);
                      const width = maxTypeCost > 0 ? (item.totalCost / maxTypeCost) * 100 : 0;
                      return (
                        <li key={item.type} className="list-group-item px-0">
                          <div className="d-flex align-items-center justify-content-between gap-2">
                            <span className="navix-maint-stat__sub">
                              <i className={`bi ${type.icon} me-1`} aria-hidden="true" />
                              {type.label}
                            </span>
                            <span className="navix-maint-stat__sub">
                              {item.count} · {formatMaintenanceMoney(item.totalCost)}
                            </span>
                          </div>
                          <div className="navix-maint-stat__progress">
                            <div className="navix-maint-stat__progress-bar" style={{ width: `${width}%` }} />
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
              <Card title="Top ateliers">
                {statistics.topWorkshops.length === 0 ? (
                  <p className="text-secondary mb-0">Aucune donnée.</p>
                ) : (
                  <ul className="list-group list-group-flush navix-maint-stat__ranking">
                    {statistics.topWorkshops.map((item, index) => (
                      <li key={item.workshop} className="list-group-item d-flex align-items-center gap-3 px-0">
                        <span className="navix-maint-stat__rank" aria-hidden="true">
                          {index + 1}
                        </span>
                        <span className="flex-grow-1 min-w-0">
                          <span className="navix-maint-stat__name">{item.workshop}</span>
                          <span className="navix-maint-stat__sub d-block">{item.count} intervention{item.count > 1 ? 's' : ''}</span>
                        </span>
                        <span className="text-end">
                          <span className="navix-maint-stat__value">{formatMaintenanceMoney(item.totalCost)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <div className="col-lg-6">
              <Card title="Top véhicules les plus entretenus">
                {statistics.topVehicles.length === 0 ? (
                  <p className="text-secondary mb-0">Aucune donnée.</p>
                ) : (
                  <ul className="list-group list-group-flush navix-maint-stat__ranking">
                    {statistics.topVehicles.map((item, index) => (
                      <li key={item.vehicleId} className="list-group-item d-flex align-items-center gap-3 px-0">
                        <span className="navix-maint-stat__rank" aria-hidden="true">
                          {index + 1}
                        </span>
                        <span className="flex-grow-1 min-w-0">
                          <span className="navix-maint-stat__name">{vehicleLabel(item.vehicleId)}</span>
                          <span className="navix-maint-stat__sub d-block">{item.count} entretien{item.count > 1 ? 's' : ''}</span>
                        </span>
                        <span className="text-end">
                          <span className="navix-maint-stat__value">{formatMaintenanceMoney(item.totalCost)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        </>
      ) : (
        <Alert variant="danger" className="mb-3">
          Statistiques indisponibles.
        </Alert>
      )}
    </PageContainer>
  );
};

export default MaintenanceStatisticsPage;
