/**
 * Navix Reports — Entreprises (companies)
 * --------------------------------------------------------------------------
 * Consolidation plateforme : statuts des entreprises et taille des flottes
 * (visible en mode super admin ; sinon limité à l'entreprise courante).
 */
import ReportContentView from './ReportContentView';
import { reportColumn, numberColumn } from './reportColumns';
import { reportBadges } from '../constants';
import { COMPANY_STATUS_OPTIONS } from './reportOptions';

const CompanyReportPage = () => {
  const columns = [
    reportColumn('name', 'Entreprise'),
    reportColumn('code', 'Code'),
    reportColumn('country', 'Pays'),
    reportColumn('city', 'Ville'),
    reportColumn('status', 'Statut', { badge: reportBadges.companyStatus }),
    reportColumn('planLabel', 'Plan'),
    numberColumn('vehicleCount', 'Véhicules'),
    numberColumn('driverCount', 'Chauffeurs'),
    numberColumn('agencyCount', 'Agences'),
    reportColumn('ownerName', 'Propriétaire'),
  ];

  return (
    <ReportContentView
      reportType="companies"
      columns={columns}
      statusOptions={COMPANY_STATUS_OPTIONS}
      breakdownTitle="Statuts des entreprises"
      exportFilename="rapport-entreprises"
    />
  );
};

export default CompanyReportPage;
