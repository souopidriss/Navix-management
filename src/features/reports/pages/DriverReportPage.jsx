/**
 * Navix Reports — Chauffeurs (drivers)
 * --------------------------------------------------------------------------
 * Activité des chauffeurs : trajets, distances, durées et consommations.
 */
import ReportContentView from './ReportContentView';
import { reportColumn, moneyColumn, distanceColumn, durationColumn, numberColumn } from './reportColumns';
import { reportBadges } from '../constants';
import { DRIVER_STATUS_OPTIONS } from './reportOptions';

const DriverReportPage = () => {
  const columns = [
    reportColumn('name', 'Chauffeur'),
    reportColumn('status', 'Statut', { badge: reportBadges.driverStatus }),
    reportColumn('availability', 'Disponibilité', { badge: reportBadges.driverAvailability }),
    numberColumn('tripCount', 'Trajets'),
    distanceColumn('distance', 'Distance'),
    durationColumn('duration', 'Durée'),
    moneyColumn('fuelCost', 'Coût carburant'),
  ];

  return (
    <ReportContentView
      reportType="drivers"
      columns={columns}
      statusOptions={DRIVER_STATUS_OPTIONS}
      breakdownTitle="Disponibilité"
      exportFilename="rapport-chauffeurs"
    />
  );
};

export default DriverReportPage;
