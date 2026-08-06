/**
 * Navix Reports — Documents (documents)
 * --------------------------------------------------------------------------
 * Conformité documentaire : catégories, volumes et visibilité.
 */
import ReportContentView from './ReportContentView';
import { reportColumn, numberColumn } from './reportColumns';

const DocumentReportPage = () => {
  const columns = [
    reportColumn('name', 'Nom'),
    reportColumn('vehicle', 'Véhicule lié'),
    reportColumn('category', 'Catégorie'),
    reportColumn('extension', 'Type'),
    numberColumn('size', 'Taille'),
    reportColumn('visibility', 'Visibilité'),
    reportColumn('uploadedBy', 'Importé par'),
    reportColumn('createdAt', 'Date', { format: 'datetime' }),
  ];

  return (
    <ReportContentView
      reportType="documents"
      columns={columns}
      seriesTitle="Documents créés"
      breakdownTitle="Catégories"
      exportFilename="rapport-documents"
    />
  );
};

export default DocumentReportPage;
