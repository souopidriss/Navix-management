/**
 * Navix Fuel — FuelStatisticsPage
 * --------------------------------------------------------------------------
 * Synthèse statistique de la consommation de carburant : coût du mois,
 * volume du mois, coût moyen par véhicule, consommation moyenne, évolution
 * mensuelle (6 mois, graphique CSS pur), top 5 des véhicules les plus
 * consommateurs et consommations anormales.
 */
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Alert, Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, StatsCards, LoadingState } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { useVehiclesStore } from '@/features/vehicles';
import { useFuelStore } from '../store';
import { FuelConsumptionChart } from '../components';
import {
  formatFuelMoney,
  formatFuelQuantity,
  formatFuelConsumption,
} from '../constants';
import './FuelStatisticsPage.css';

const FuelStatisticsPage = () => {
  const navigate = useNavigate();

  const statistics = useFuelStore((state) => state.statistics);
  const isLoading = useFuelStore((state) => state.isLoading);
  const error = useFuelStore((state) => state.error);
  const fetchStatistics = useFuelStore((state) => state.fetchStatistics);
  const clearError = useFuelStore((state) => state.clearError);

  const vehicles = useVehiclesStore((state) => state.vehicles);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);

  useEffect(() => {
    fetchStatistics();
    fetchVehicles();
  }, [fetchStatistics, fetchVehicles]);

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

  const stats = statistics
    ? [
        {
          key: 'monthTotalCost',
          label: 'Coût du mois',
          value: formatFuelMoney(statistics.monthTotalCost),
          icon: 'bi-cash-stack',
          variant: 'success',
        },
        {
          key: 'monthQuantity',
          label: 'Volume du mois',
          value: formatFuelQuantity(statistics.monthQuantity),
          icon: 'bi-droplet-half',
          variant: 'info',
        },
        {
          key: 'averageCostPerVehicle',
          label: 'Coût moyen / véhicule',
          value: formatFuelMoney(statistics.averageCostPerVehicle),
          icon: 'bi-truck',
          variant: 'primary',
        },
        {
          key: 'averageConsumption',
          label: 'Conso moyenne',
          value: formatFuelConsumption(statistics.averageConsumption),
          icon: 'bi-speedometer2',
          variant: 'warning',
        },
      ]
    : [];

  return (
    <PageContainer>
      <Helmet>
        <title>Statistiques carburant — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Statistiques carburant"
        subtitle="Analyse des coûts et de la consommation de carburant."
        icon="bi-bar-chart-line"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Carburant', to: ROUTES.FUEL },
          { label: 'Statistiques' },
        ]}
        actions={
          <Button variant="outline" icon="bi-arrow-left" onClick={() => navigate(ROUTES.FUEL)}>
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
              <Card title="Évolution mensuelle — Coût">
                <FuelConsumptionChart
                  data={statistics.monthlyEvolution}
                  metric="totalCost"
                  title="Évolution mensuelle du coût de carburant"
                  formatValue={(value) => formatFuelMoney(value)}
                />
              </Card>
            </div>
            <div className="col-lg-6">
              <Card title="Évolution mensuelle — Volume">
                <FuelConsumptionChart
                  data={statistics.monthlyEvolution}
                  metric="quantity"
                  title="Évolution mensuelle du volume de carburant"
                  formatValue={(value) => formatFuelQuantity(value)}
                />
              </Card>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-6">
              <Card title="Top 5 véhicules les plus consommateurs">
                {statistics.topVehicles.length === 0 ? (
                  <p className="text-secondary mb-0">Aucune donnée.</p>
                ) : (
                  <ul className="list-group list-group-flush navix-fuel-ranking">
                    {statistics.topVehicles.map((item, index) => (
                      <li key={item.vehicleId} className="list-group-item d-flex align-items-center gap-3 px-0">
                        <span className="navix-fuel-ranking__rank" aria-hidden="true">
                          {index + 1}
                        </span>
                        <span className="flex-grow-1 min-w-0">
                          <span className="navix-fuel-ranking__name">{vehicleLabel(item.vehicleId)}</span>
                          <span className="navix-fuel-ranking__sub">
                            {item.count} plein{item.count > 1 ? 's' : ''}
                          </span>
                        </span>
                        <span className="text-end">
                          <span className="navix-fuel-ranking__value">
                            {formatFuelQuantity(item.quantity)}
                          </span>
                          <span className="navix-fuel-ranking__sub d-block">
                            {formatFuelMoney(item.totalCost)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <div className="col-lg-6">
              <Card title="Consommations anormales">
                {statistics.anomalies.length === 0 ? (
                  <p className="text-secondary mb-0">Aucune consommation anormale détectée.</p>
                ) : (
                  <>
                    <ul className="list-group list-group-flush navix-fuel-ranking">
                      {statistics.anomalies.map((anomaly) => (
                        <li key={anomaly.id} className="list-group-item d-flex align-items-center gap-3 px-0">
                          <span className="navix-fuel-ranking__rank navix-fuel-ranking__rank--warning" aria-hidden="true">
                            <i className="bi bi-exclamation-triangle-fill" />
                          </span>
                          <span className="flex-grow-1 min-w-0">
                            <span className="navix-fuel-ranking__name">{vehicleLabel(anomaly.vehicleId)}</span>
                            <span className="navix-fuel-ranking__sub">{anomaly.fuelNumber} · {anomaly.stationName}</span>
                          </span>
                          <span className="text-end">
                            <span className="navix-fuel-ranking__value">
                              {formatFuelConsumption(anomaly.consumptionAverage)}
                            </span>
                            <span className="navix-fuel-ranking__sub d-block">
                              {formatFuelMoney(anomaly.totalCost)}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                    {statistics.anomaliesCount > statistics.anomalies.length && (
                      <p className="navix-fuel-ranking__more mb-0">
                        {statistics.anomaliesCount} consommation(s) anormale(s) au total.
                      </p>
                    )}
                  </>
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

export default FuelStatisticsPage;
