/**
 * Navix Companies — CompanyDetailsPage
 * --------------------------------------------------------------------------
 * Détail d'une entreprise : en-tête (logo, statut, abonnement), informations
 * de contact, propriétaire, abonnement, activité et actions (modifier /
 * supprimer). États chargement / erreur / introuvable gérés.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Badge, Button, Card, Spinner } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES, companyEditPath } from '@/routes/route.constants';
import { useCompaniesStore } from '../store';
import CompanyLogo from '../components/CompanyLogo';
import CompanyStatusBadge from '../components/CompanyStatusBadge';
import DeleteCompanyModal from '../components/DeleteCompanyModal';
import { getSubscriptionPlan, getSubscriptionStatus } from '../constants';
import './CompanyDetailsPage.css';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

const InfoRow = ({ icon, label, children }) => (
  <div className="d-flex align-items-start gap-3 py-2">
    <span className="navix-details__icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <div className="min-w-0">
      <dt className="navix-details__label">{label}</dt>
      <dd className="navix-details__value mb-0">{children}</dd>
    </div>
  </div>
);

const StatBox = ({ icon, label, value }) => (
  <div className="navix-details__stat">
    <span className="navix-details__stat-icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <span className="navix-details__stat-body">
      <span className="navix-details__stat-value">{value}</span>
      <span className="navix-details__stat-label">{label}</span>
    </span>
  </div>
);

const CompanyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedCompany = useCompaniesStore((state) => state.selectedCompany);
  const isLoading = useCompaniesStore((state) => state.isLoading);
  const error = useCompaniesStore((state) => state.error);
  const fetchCompany = useCompaniesStore((state) => state.fetchCompany);
  const deleteCompany = useCompaniesStore((state) => state.deleteCompany);
  const clearError = useCompaniesStore((state) => state.clearError);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (id) fetchCompany(id);
  }, [id, fetchCompany]);

  const company = selectedCompany?.id === id ? selectedCompany : null;

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteCompany(id);
    setIsDeleting(false);

    if (result.success) {
      toast.success('Entreprise supprimée.');
      navigate(ROUTES.COMPANIES);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer l’entreprise.');
    }
  };

  const plan = company ? getSubscriptionPlan(company.subscriptionPlan) : null;
  const subscriptionStatus = company ? getSubscriptionStatus(company.subscriptionStatus) : null;

  const breadcrumbs = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Entreprises', to: ROUTES.COMPANIES },
    { label: company ? company.name : '…' },
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>{company ? `${company.name} — Navix Management` : 'Entreprise — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title={company ? company.name : 'Entreprise'}
        subtitle={company ? `${company.city}, ${company.country}` : undefined}
        icon="bi-buildings"
        breadcrumbs={breadcrumbs}
        actions={
          company ? (
            <div className="d-flex gap-2 flex-wrap">
              <Button variant="outline" icon="bi-pencil" onClick={() => navigate(companyEditPath(company.id))}>
                Modifier
              </Button>
              <Button variant="outline" icon="bi-trash3" onClick={() => setDeleteOpen(true)}>
                Supprimer
              </Button>
            </div>
          ) : undefined
        }
      />

      {isLoading && !company ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner size="lg" label="Chargement de l’entreprise…" />
        </div>
      ) : error || !company ? (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error || 'Entreprise introuvable.'}
        </Alert>
      ) : (
        <>
          <div className="card mb-3">
            <div className="card-body d-flex flex-wrap align-items-center gap-3">
              <CompanyLogo src={company.logo} name={company.name} size="xl" />
              <div className="flex-grow-1 min-w-0">
                <h2 className="h4 mb-1">{company.name}</h2>
                <p className="text-secondary mb-1">
                  <code>{company.code}</code>
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <CompanyStatusBadge status={company.status} />
                  {plan && (
                    <Badge variant={plan.variant} soft>
                      Plan {plan.label}
                    </Badge>
                  )}
                  {subscriptionStatus && (
                    <Badge variant={subscriptionStatus.variant} soft>
                      Abonnement {subscriptionStatus.label}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="navix-details__stats d-flex gap-2 flex-wrap">
                <StatBox icon="bi-truck" label="Véhicules" value={company.vehicleCount} />
                <StatBox icon="bi-person-badge" label="Chauffeurs" value={company.driverCount} />
                <StatBox icon="bi-diagram-3" label="Agences" value={company.agencyCount} />
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-7">
              <Card title="Informations de contact">
                <dl className="mb-0">
                  <InfoRow icon="bi-envelope" label="Email">
                    <a href={`mailto:${company.email}`} className="text-break">
                      {company.email}
                    </a>
                  </InfoRow>
                  <InfoRow icon="bi-telephone" label="Téléphone">
                    {company.phone || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-globe2" label="Site web">
                    {company.website ? (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-break">
                        {company.website}
                      </a>
                    ) : (
                      '—'
                    )}
                  </InfoRow>
                  <InfoRow icon="bi-geo-alt" label="Adresse">
                    {[company.address, company.city, company.country].filter(Boolean).join(', ') || '—'}
                  </InfoRow>
                </dl>
              </Card>

              <Card title="Propriétaire" className="mt-3">
                <dl className="mb-0">
                  <InfoRow icon="bi-person" label="Nom">
                    {company.owner?.name || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-envelope" label="Email">
                    {company.owner?.email || '—'}
                  </InfoRow>
                </dl>
              </Card>
            </div>

            <div className="col-lg-5">
              <Card title="Abonnement">
                <div className="d-grid gap-2">
                  {plan && (
                    <Badge variant={plan.variant} soft>
                      Plan {plan.label}
                    </Badge>
                  )}
                  {subscriptionStatus && (
                    <Badge variant={subscriptionStatus.variant} soft>
                      {subscriptionStatus.label}
                    </Badge>
                  )}
                </div>
                <dl className="mt-3 mb-0">
                  <InfoRow icon="bi-calendar-plus" label="Créée le">
                    {formatDate(company.createdAt)}
                  </InfoRow>
                  <InfoRow icon="bi-calendar-check" label="Mise à jour le">
                    {formatDate(company.updatedAt)}
                  </InfoRow>
                </dl>
              </Card>
            </div>
          </div>

          <DeleteCompanyModal
            company={company}
            open={deleteOpen}
            loading={isDeleting}
            error={deleteError}
            onConfirm={handleDelete}
            onClose={() => {
              setDeleteOpen(false);
              setDeleteError('');
            }}
          />
        </>
      )}
    </PageContainer>
  );
};

export default CompanyDetailsPage;
