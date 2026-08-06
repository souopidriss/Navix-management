/**
 * Navix Reports — Finances (financial)
 * --------------------------------------------------------------------------
 * Coûts de flotte, factures, paiements et tendances (réservé aux profils
 * disposant de reports.viewFinancial).
 */
import ReportContentView from './ReportContentView';
import { reportColumn, moneyColumn } from './reportColumns';
import { reportBadges } from '../constants';
import { INVOICE_STATUS_OPTIONS } from './reportOptions';

const FinancialReportPage = () => {
  const columns = [
    reportColumn('number', 'N° facture'),
    reportColumn('companyName', 'Entreprise'),
    reportColumn('status', 'Statut', { badge: reportBadges.invoiceStatus }),
    reportColumn('issuedDate', 'Émise', { format: 'date' }),
    reportColumn('dueDate', 'Échéance', { format: 'date' }),
    moneyColumn('subtotal', 'Sous-total'),
    moneyColumn('taxAmount', 'Taxes'),
    moneyColumn('total', 'Total'),
    moneyColumn('amountPaid', 'Payé'),
    moneyColumn('amountDue', 'Restant'),
  ];

  return (
    <ReportContentView
      reportType="financial"
      columns={columns}
      statusOptions={INVOICE_STATUS_OPTIONS}
      seriesTitle="Facturé vs encaissé"
      chartKind="bar"
      breakdownTitle="Statuts des factures"
      exportFilename="rapport-finances"
    />
  );
};

export default FinancialReportPage;
