/**
 * Navix Reports — Parc automobile (fleet)
 * --------------------------------------------------------------------------
 * Vue d'ensemble de la flotte : statuts, disponibilité, répartition par
 * groupe et détail de chaque véhicule.
 */
import ReportContentView from './ReportContentView';
import { reportColumn, distanceColumn } from './reportColumns';
import { reportBadges } from '../constants';
import { VEHICLE_STATUS_OPTIONS } from './reportOptions';

const FleetReportPage = () => {
  const columns = [
    reportColumn('registrationNumber', 'Immatriculation'),
    reportColumn('vehicle', 'Véhicule'),
    reportColumn('group', 'Groupe', { badge: reportBadges.vehicleGroup }),
    reportColumn('status', 'Statut', { badge: reportBadges.vehicleStatus }),
    distanceColumn('mileage', 'Kilométrage'),
    reportColumn('fuelType', 'Carburant', { badge: reportBadges.vehicleFuel }),
    reportColumn('companyName', 'Entreprise'),
  ];

  return (
    <ReportContentView
      reportType="fleet"
      columns={columns}
      statusOptions={VEHICLE_STATUS_OPTIONS}
      breakdownTitle="Répartition par groupe"
      exportFilename="rapport-parc"
    />
  );
};

export default FleetReportPage;
