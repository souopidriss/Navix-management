/**
 * Navix Reports — Véhicules (vehicles)
 * --------------------------------------------------------------------------
 * Détail par véhicule : kilométrage, coûts carburant / entretien et usage.
 */
import ReportContentView from './ReportContentView';
import { reportColumn, moneyColumn, distanceColumn, numberColumn } from './reportColumns';
import { reportBadges } from '../constants';
import { VEHICLE_STATUS_OPTIONS } from './reportOptions';

const VehicleReportPage = () => {
  const columns = [
    reportColumn('registrationNumber', 'Immatriculation'),
    reportColumn('vehicle', 'Véhicule'),
    reportColumn('group', 'Groupe', { badge: reportBadges.vehicleGroup }),
    reportColumn('status', 'Statut', { badge: reportBadges.vehicleStatus }),
    distanceColumn('mileage', 'Kilométrage'),
    moneyColumn('fuelCost', 'Coût carburant'),
    moneyColumn('maintenanceCost', 'Coût entretien'),
    numberColumn('tripCount', 'Trajets'),
  ];

  return (
    <ReportContentView
      reportType="vehicles"
      columns={columns}
      statusOptions={VEHICLE_STATUS_OPTIONS}
      breakdownTitle="Répartition par groupe"
      exportFilename="rapport-vehicules"
    />
  );
};

export default VehicleReportPage;
