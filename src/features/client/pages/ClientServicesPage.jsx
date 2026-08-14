/**
 * Navix Client — ClientServicesPage
 * --------------------------------------------------------------------------
 * Page "Mes services" de l'Espace Client (Location de flotte, Transport VIP, Fret).
 */
import { Helmet } from 'react-helmet-async';
import { Card, Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/core';
import { formatCurrency, formatDate } from '@/utils/format';
import { useClientData } from '../hooks/useClientData';
import { MOCK_CLIENT_SERVICES } from '../mocks/client.mock';

const ClientServicesPage = () => {
  const { currentClient } = useClientData();

  return (
    <div>
      <Helmet>
        <title>Mes Services — Navix Client</title>
      </Helmet>

      <PageHeader
        title="Mes Services Souscrits"
        subtitle={`Gestion des contrats et formules de services actifs pour ${currentClient?.companyName || currentClient?.displayName}.`}
        icon="bi-grid-fill"
        breadcrumbs={[{ label: 'Client', to: '/client/dashboard' }, { label: 'Mes services' }]}
        actions={
          <Button variant="primary" size="sm" icon="bi-plus-circle">
            Souscrire un service
          </Button>
        }
      />

      <div className="row g-3">
        {MOCK_CLIENT_SERVICES.map((srv) => (
          <div key={srv.id} className="col-lg-4 col-md-6">
            <Card className="h-100 shadow-sm border border-secondary-subtle">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="badge bg-primary-subtle text-primary p-2">
                  <i className="bi bi-shield-check me-1" />
                  Contrat Actif
                </span>
                <span className="text-muted small">Réf : {srv.id}</span>
              </div>

              <h5 className="fw-bold mb-2">{srv.name}</h5>
              <p className="text-muted small mb-3">
                Couverture nationale · Cameroun 🇨🇲 · Assistance 24/7 et gestion complète de la flotte.
              </p>

              <div className="bg-body-tertiary p-3 rounded-3 mb-3 border">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted small">Véhicules inclus :</span>
                  <span className="fw-semibold">{srv.vehiclesCount} véhicules</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted small">Période :</span>
                  <span className="fw-medium">{formatDate(srv.startDate)} → {formatDate(srv.endDate)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted small">Redevance mensuelle :</span>
                  <span className="fw-bold text-success">{formatCurrency(srv.monthlyFee, 'XAF')}</span>
                </div>
              </div>

              <div className="d-flex gap-2">
                <Button variant="outline" size="sm" className="w-100" icon="bi-file-text">
                  Détails Contrat
                </Button>
                <Button variant="primary" size="sm" className="w-100" icon="bi-arrow-repeat">
                  Renouveler
                </Button>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientServicesPage;
