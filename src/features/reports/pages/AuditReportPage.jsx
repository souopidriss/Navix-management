/**
 * Navix Reports — Journal des actions (audit)
 * --------------------------------------------------------------------------
 * Activité, tentatives échouées et événements sensibles (réservé aux profils
 * disposant de reports.viewSensitive).
 */
import ReportContentView from './ReportContentView';
import { reportColumn } from './reportColumns';
import { reportBadges } from '../constants';

const AuditReportPage = () => {
  const columns = [
    reportColumn('createdAt', 'Date', { format: 'datetime' }),
    reportColumn('userName', 'Utilisateur'),
    reportColumn('action', 'Action'),
    reportColumn('resourceType', 'Ressource'),
    reportColumn('resourceName', 'Cible'),
    reportColumn('severity', 'Gravité', { badge: reportBadges.auditSeverity }),
    reportColumn('status', 'Statut', { badge: reportBadges.auditStatus }),
    reportColumn('description', 'Description'),
  ];

  return (
    <ReportContentView
      reportType="audit"
      columns={columns}
      seriesTitle="Activité mensuelle"
      breakdownTitle="Types d'actions"
      exportFilename="rapport-audit"
    />
  );
};

export default AuditReportPage;
