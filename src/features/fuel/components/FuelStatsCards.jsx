/**
 * Navix Fuel — FuelStatsCards
 * --------------------------------------------------------------------------
 * Cartes de statistiques du module Carburant (page liste) : nombre de pleins,
 * coût total, volume total et consommation moyenne. Les valeurs sont dérivées
 * de la liste chargée.
 *
 * Props :
 *   fuelRecords : liste des pleins (source des compteurs)
 */
import { Card } from '@/components/ui';
import {
  formatFuelMoney,
  formatFuelQuantity,
  formatFuelConsumption,
} from '../constants';
import './FuelStatsCards.css';

const round = (value) => Math.round(Number(value || 0) * 10) / 10;

const buildStats = (fuelRecords = []) => {
  const validated = fuelRecords.filter((record) => record.status === 'validated');
  const consumptions = validated
    .map((record) => Number(record.consumptionAverage))
    .filter((value) => Number.isFinite(value) && value > 0);
  const averageConsumption = consumptions.length
    ? round(consumptions.reduce((sum, value) => sum + value, 0) / consumptions.length)
    : 0;
  const totalCost = fuelRecords.reduce((sum, record) => sum + Number(record.totalCost || 0), 0);
  const totalQuantity = fuelRecords.reduce((sum, record) => sum + Number(record.quantity || 0), 0);

  return [
    {
      key: 'count',
      label: 'Pleins',
      value: fuelRecords.length,
      icon: 'bi-fuel-pump',
      variant: 'primary',
    },
    {
      key: 'cost',
      label: 'Coût total',
      value: formatFuelMoney(totalCost),
      icon: 'bi-cash-stack',
      variant: 'success',
    },
    {
      key: 'quantity',
      label: 'Volume',
      value: formatFuelQuantity(totalQuantity),
      icon: 'bi-droplet-half',
      variant: 'info',
    },
    {
      key: 'consumption',
      label: 'Conso moyenne',
      value: formatFuelConsumption(averageConsumption),
      icon: 'bi-speedometer2',
      variant: 'warning',
    },
  ];
};

const FuelStatsCards = ({ fuelRecords = [] }) => (
  <div className="row g-3 navix-fuel-stats">
    {buildStats(fuelRecords).map((stat) => (
      <div key={stat.key} className="col-6 col-lg-3">
        <Card className="navix-fuel-stat">
          <span className={`navix-fuel-stat__icon navix-fuel-stat__icon--${stat.variant}`} aria-hidden="true">
            <i className={`bi ${stat.icon}`} />
          </span>
          <span className="navix-fuel-stat__body">
            <span className="navix-fuel-stat__value">{stat.value}</span>
            <span className="navix-fuel-stat__label">{stat.label}</span>
          </span>
        </Card>
      </div>
    ))}
  </div>
);

export default FuelStatsCards;
