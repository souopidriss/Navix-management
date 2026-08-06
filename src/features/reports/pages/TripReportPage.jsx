/**
 * Navix Reports — Trajets (trips)
 * --------------------------------------------------------------------------
 * Volume de trajets, distances parcourues, motifs et performance.
 */
import ReportContentView from './ReportContentView';
import { reportColumn, distanceColumn, durationColumn } from './reportColumns';
import { reportBadges } from '../constants';
import { TRIP_STATUS_OPTIONS } from './reportOptions';

const TripReportPage = () => {
  const columns = [
    reportColumn('tripNumber', 'N°'),
    reportColumn('vehicle', 'Véhicule'),
    reportColumn('driver', 'Chauffeur'),
    reportColumn('tripType', 'Type', { badge: reportBadges.tripType }),
    reportColumn('purpose', 'Motif'),
    reportColumn('departure', 'Départ'),
    reportColumn('arrival', 'Arrivée'),
    reportColumn('status', 'Statut', { badge: reportBadges.tripStatus }),
    reportColumn('departureDate', 'Date', { format: 'date' }),
    distanceColumn('distance', 'Distance'),
    durationColumn('duration', 'Durée'),
  ];

  return (
    <ReportContentView
      reportType="trips"
      columns={columns}
      statusOptions={TRIP_STATUS_OPTIONS}
      seriesTitle="Distance mensuelle"
      breakdownTitle="Types de trajets"
      exportFilename="rapport-trajets"
    />
  );
};

export default TripReportPage;
