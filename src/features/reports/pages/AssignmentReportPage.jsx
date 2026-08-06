/**
 * Navix Reports — Affectations (assignments)
 * --------------------------------------------------------------------------
 * Historique des affectations véhicule ↔ chauffeur : statuts, types et durées.
 */
import ReportContentView from './ReportContentView';
import { reportColumn } from './reportColumns';
import { reportBadges } from '../constants';
import { ASSIGNMENT_STATUS_OPTIONS } from './reportOptions';

const AssignmentReportPage = () => {
  const columns = [
    reportColumn('assignmentNumber', 'N°'),
    reportColumn('vehicle', 'Véhicule'),
    reportColumn('driver', 'Chauffeur'),
    reportColumn('assignmentType', 'Type', { badge: reportBadges.assignmentType }),
    reportColumn('status', 'Statut', { badge: reportBadges.assignmentStatus }),
    reportColumn('startDate', 'Début', { format: 'date' }),
    reportColumn('endDate', 'Fin', { format: 'date' }),
    reportColumn('expectedEndDate', 'Fin prévue', { format: 'date' }),
  ];

  return (
    <ReportContentView
      reportType="assignments"
      columns={columns}
      statusOptions={ASSIGNMENT_STATUS_OPTIONS}
      breakdownTitle="Types d'affectation"
      exportFilename="rapport-affectations"
    />
  );
};

export default AssignmentReportPage;
