/**
 * Navix Client — ClientInvoicesPage
 * --------------------------------------------------------------------------
 * Page "Mes factures" avec montants en FCFA et état de paiement.
 */
import { Helmet } from 'react-helmet-async';
import { Card, Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/core';
import { formatCurrency, formatDate } from '@/utils/format';
import { MOCK_CLIENT_INVOICES } from '../mocks/client.mock';

const ClientInvoicesPage = () => {
  return (
    <div>
      <Helmet>
        <title>Mes Factures — Navix Client</title>
      </Helmet>

      <PageHeader
        title="Mes Factures & Règlements"
        subtitle="Consultez et téléchargez vos factures en Francs CFA (FCFA 🇨🇲)."
        icon="bi-receipt"
        breadcrumbs={[{ label: 'Client', to: '/client/dashboard' }, { label: 'Mes factures' }]}
      />

      <Card>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Période</th>
                <th>Date d'émission</th>
                <th>Date d'échéance</th>
                <th>Montant TTC</th>
                <th>Statut</th>
                <th className="text-end">Télécharger</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CLIENT_INVOICES.map((inv) => (
                <tr key={inv.id}>
                  <td className="fw-semibold">{inv.invoiceNumber}</td>
                  <td>{inv.period}</td>
                  <td>{formatDate(inv.issueDate)}</td>
                  <td>{formatDate(inv.dueDate)}</td>
                  <td className="fw-bold text-success fs-6">{formatCurrency(inv.amount, 'XAF')}</td>
                  <td>
                    {inv.status === 'paid' ? (
                      <Badge variant="success">Payée</Badge>
                    ) : (
                      <Badge variant="warning">En attente de règlement</Badge>
                    )}
                  </td>
                  <td className="text-end">
                    <Button variant="outline" size="sm" icon="bi-file-pdf">
                      Facture PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ClientInvoicesPage;
