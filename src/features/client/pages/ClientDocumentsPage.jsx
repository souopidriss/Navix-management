/**
 * Navix Client — ClientDocumentsPage
 * --------------------------------------------------------------------------
 * Page "Mes documents" (Contrats, attestations, assurances, rapports).
 */
import { Helmet } from 'react-helmet-async';
import { Card, Button } from '@/components/ui';
import { PageHeader } from '@/components/core';

const MOCK_DOCS = [
  { id: 'DOC-01', name: 'Contrat Cadre Location Flotte 2026.pdf', category: 'Contrat', size: '2.4 MB', date: '2026-01-15' },
  { id: 'DOC-02', name: 'Attestation Assurance Flotte Douala-Yaoundé.pdf', category: 'Assurance', size: '1.1 MB', date: '2026-02-01' },
  { id: 'DOC-03', name: 'Charte d’Utilisation des Véhicules Client.pdf', category: 'Règlement', size: '850 KB', date: '2026-03-10' },
  { id: 'DOC-04', name: 'Rapport Mensuel Consommation Juillet 2026.pdf', category: 'Rapport', size: '3.8 MB', date: '2026-08-01' },
];

const ClientDocumentsPage = () => {
  return (
    <div>
      <Helmet>
        <title>Mes Documents — Navix Client</title>
      </Helmet>

      <PageHeader
        title="Mes Documents & Contrats"
        subtitle="Téléchargez et consultez l'ensemble de vos documents contractuels et attestations."
        icon="bi-folder2-open"
        breadcrumbs={[{ label: 'Client', to: '/client/dashboard' }, { label: 'Mes documents' }]}
      />

      <div className="row g-3">
        {MOCK_DOCS.map((doc) => (
          <div key={doc.id} className="col-md-6 col-lg-4">
            <Card className="h-100 shadow-sm border border-secondary-subtle">
              <div className="d-flex align-items-center gap-3 mb-3">
                <span className="p-3 rounded-3 bg-danger-subtle text-danger fs-3">
                  <i className="bi bi-file-earmark-pdf-fill" />
                </span>
                <div>
                  <h6 className="fw-semibold mb-1 text-truncate" style={{ maxWidth: '200px' }}>{doc.name}</h6>
                  <span className="badge bg-secondary-subtle text-body">{doc.category}</span>
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between text-muted small border-top pt-2 mt-auto">
                <span>Taille : {doc.size}</span>
                <span>Ajouté le : {doc.date}</span>
              </div>

              <div className="mt-3">
                <Button variant="outline" size="sm" className="w-100" icon="bi-download">
                  Télécharger le document
                </Button>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientDocumentsPage;
