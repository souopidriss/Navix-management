/**
 * Navix Reports — Entretiens (maintenance)
 * --------------------------------------------------------------------------
 * Coûts d'entretien, délais et fiabilité de la flotte.
 */
import ReportContentView from './ReportContentView';
import { reportColumn, moneyColumn } from './reportColumns';
import { reportBadges } from '../constants';
import { MAINTENANCE_STATUS_OPTIONS } from './reportOptions';

const MaintenanceReportPage = () => {
  const columns = [
    reportColumn('maintenanceNumber', 'N°'),
    reportColumn('vehicle', 'Véhicule'),
    reportColumn('maintenanceType', 'Type', { badge: reportBadges.maintenanceType }),
    reportColumn('priority', 'Priorité', { badge: reportBadges.maintenancePriority }),
    reportColumn('status', 'Statut', { badge: reportBadges.maintenanceStatus }),
    reportColumn('scheduledDate', 'Planifié', { format: 'date' }),
    reportColumn('completedAt', 'Réalisé', { format: 'date' }),
    moneyColumn('estimatedCost', 'Coût estimé'),
    moneyColumn('actualCost', 'Coût réel'),
    reportColumn('workshop', 'Atelier'),
  ];

  return (
    <ReportContentView
      reportType="maintenance"
      columns={columns}
      statusOptions={MAINTENANCE_STATUS_OPTIONS}
      seriesTitle="Coûts mensuels"
      breakdownTitle="Types d'entretien"
      exportFilename="rapport-entretiens"
    />
  );
};

export default MaintenanceReportPage;
