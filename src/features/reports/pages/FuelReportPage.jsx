/**
 * Navix Reports — Carburant (fuel)
 * --------------------------------------------------------------------------
 * Consommations, coûts et anomalies de plein par véhicule.
 */
import ReportContentView from './ReportContentView';
import { reportColumn, moneyColumn, numberColumn } from './reportColumns';
import { reportBadges } from '../constants';
import { FUEL_STATUS_OPTIONS } from './reportOptions';

const FuelReportPage = () => {
  const columns = [
    reportColumn('fuelNumber', 'N°'),
    reportColumn('vehicle', 'Véhicule'),
    reportColumn('driver', 'Chauffeur'),
    reportColumn('fuelType', 'Carburant', { badge: reportBadges.fuelType }),
    reportColumn('status', 'Statut', { badge: reportBadges.fuelStatus }),
    numberColumn('quantity', 'Volume (L)'),
    moneyColumn('unitPrice', 'Prix unitaire'),
    moneyColumn('totalCost', 'Total'),
    numberColumn('consumptionAverage', 'Consommation moy.'),
    reportColumn('createdAt', 'Date', { format: 'datetime' }),
  ];

  return (
    <ReportContentView
      reportType="fuel"
      columns={columns}
      statusOptions={FUEL_STATUS_OPTIONS}
      seriesTitle="Dépenses mensuelles"
      breakdownTitle="Types de carburant"
      exportFilename="rapport-carburant"
    />
  );
};

export default FuelReportPage;
