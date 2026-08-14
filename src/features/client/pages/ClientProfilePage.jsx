/**
 * Navix Client — ClientProfilePage
 * --------------------------------------------------------------------------
 * Page "Mon profil" et paramètres du compte Client.
 */
import { Helmet } from 'react-helmet-async';
import { Card, Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/core';
import { useClientData } from '../hooks/useClientData';

const ClientProfilePage = () => {
  const { currentClient, isEnterprise } = useClientData();

  return (
    <div>
      <Helmet>
        <title>Mon Profil Client — Navix</title>
      </Helmet>

      <PageHeader
        title="Profil & Paramètres du Compte"
        subtitle="Consultez et mettez à jour les informations de votre compte client."
        icon="bi-person-circle"
        breadcrumbs={[{ label: 'Client', to: '/client/dashboard' }, { label: 'Mon profil' }]}
      />

      <div className="row g-3">
        <div className="col-lg-4">
          <Card className="text-center shadow-sm">
            <div className="p-4 rounded-circle bg-primary-subtle text-primary d-inline-flex mb-3">
              <i className="bi bi-buildings fs-1" />
            </div>
            <h5 className="fw-bold mb-1">{currentClient?.companyName || currentClient?.displayName}</h5>
            <p className="text-muted small mb-2">{currentClient?.email}</p>
            <Badge variant={isEnterprise ? 'primary' : 'info'}>
              {isEnterprise ? 'Compte Client Entreprise' : 'Compte Client Particulier'}
            </Badge>

            <div className="mt-4 pt-3 border-top text-start">
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted small">Téléphone :</span>
                <span className="fw-medium">{currentClient?.phone}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted small">Ville :</span>
                <span className="fw-medium">{currentClient?.city} 🇨🇲</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted small">Statut :</span>
                <span className="badge bg-success-subtle text-success">Compte Vérifié</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-lg-8">
          <Card title="Informations de contact & facturation">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Nom d'organisation / Client</label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={currentClient?.companyName || currentClient?.displayName}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Adresse Email</label>
                  <input type="email" className="form-control" defaultValue={currentClient?.email} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Numéro de téléphone (Cameroun)</label>
                  <input type="text" className="form-control" defaultValue={currentClient?.phone} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Ville</label>
                  <input type="text" className="form-control" defaultValue={currentClient?.city} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Adresse physique</label>
                  <input type="text" className="form-control" defaultValue={currentClient?.address} />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="primary" icon="bi-check-lg">
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientProfilePage;
