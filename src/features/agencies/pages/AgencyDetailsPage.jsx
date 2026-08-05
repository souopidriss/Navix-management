/**
 * Navix Agencies — AgencyDetailsPage
 * --------------------------------------------------------------------------
 * Détail d'une agence / site : en-tête (statut, type, société, responsable,
 * compteurs), informations complètes, localisation, véhicules, chauffeurs et
 * flux d'activité. Actions : statistiques, modifier, activer / désactiver et
 * supprimer. États chargement / erreur / introuvable gérés.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Badge, Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState } from '@/components/core';
import {
  ROUTES,
  agencyEditPath,
  agencyStatisticsPath,
} from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useAgenciesStore } from '../store';
import {
  AgencyStatusBadge,
  AgencyTypeBadge,
  AgencyLocation,
  AgencyVehicles,
  AgencyDrivers,
  AgencyActivity,
  DeleteAgencyModal,
} from '../components';
import {
  formatAgencyLongDate,
  formatAgencyDateTime,
  getAgencyType,
} from '../constants';
import './AgencyDetailsPage.css';

const InfoRow = ({ icon, label, children }) => (
  <div className="d-flex align-items-start gap-3 py-2">
    <span className="navix-agency-detail__icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <div className="min-w-0">
      <dt className="navix-agency-detail__label">{label}</dt>
      <dd className="navix-agency-detail__value mb-0">{children}</dd>
    </div>
  </div>
);

const StatBox = ({ icon, label, value }) => (
  <div className="navix-agency-detail__stat">
    <span className="navix-agency-detail__stat-icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <span className="navix-agency-detail__stat-body">
      <span className="navix-agency-detail__stat-value">{value}</span>
      <span className="navix-agency-detail__stat-label">{label}</span>
    </span>
  </div>
);

const AgencyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedAgency = useAgenciesStore((state) => state.selectedAgency);
  const agencyVehicles = useAgenciesStore((state) => state.agencyVehicles);
  const agencyDrivers = useAgenciesStore((state) => state.agencyDrivers);
  const agencyActivity = useAgenciesStore((state) => state.agencyActivity);
  const isLoading = useAgenciesStore((state) => state.isLoading);
  const error = useAgenciesStore((state) => state.error);
  const fetchAgency = useAgenciesStore((state) => state.fetchAgency);
  const fetchAgencyVehicles = useAgenciesStore((state) => state.fetchAgencyVehicles);
  const fetchAgencyDrivers = useAgenciesStore((state) => state.fetchAgencyDrivers);
  const fetchAgencyActivity = useAgenciesStore((state) => state.fetchAgencyActivity);
  const deleteAgency = useAgenciesStore((state) => state.deleteAgency);
  const activateAgency = useAgenciesStore((state) => state.activateAgency);
  const deactivateAgency = useAgenciesStore((state) => state.deactivateAgency);
  const clearError = useAgenciesStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAgency(id);
      fetchAgencyVehicles(id);
      fetchAgencyDrivers(id);
      fetchAgencyActivity(id);
    }
    fetchCompanies();
  }, [id, fetchAgency, fetchAgencyVehicles, fetchAgencyDrivers, fetchAgencyActivity, fetchCompanies]);

  const agency = selectedAgency?.id === id ? selectedAgency : null;

  const company = useMemo(
    () => (agency ? companies.find((item) => item.id === agency.companyId) : null),
    [companies, agency],
  );

  const manager = useMemo(
    () => (agency ? agencyDrivers.find((driver) => driver.id === agency.managerId) : null),
    [agencyDrivers, agency],
  );

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteAgency(id);
    setIsDeleting(false);

    if (result.success) {
      toast.success('Agence supprimée.');
      navigate(ROUTES.AGENCIES);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer l’agence.');
    }
  };

  const handleToggleStatus = async () => {
    if (!id || !agency) return;
    setIsToggling(true);

    const isActive = agency.status === 'active';
    const result = isActive ? await deactivateAgency(id) : await activateAgency(id);

    setIsToggling(false);

    if (result.success) {
      toast.success(isActive ? 'Agence désactivée.' : 'Agence activée.');
    } else {
      toast.error(result.error || 'Impossible de modifier le statut de l’agence.');
    }
  };

  const type = agency ? getAgencyType(agency.type) : null;

  const breadcrumbs = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Agences', to: ROUTES.AGENCIES },
    { label: agency ? agency.name : '…' },
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>{agency ? `${agency.name} — Navix Management` : 'Agence — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title={agency ? agency.name : 'Agence'}
        subtitle={agency ? `${agency.city}, ${agency.country}` : undefined}
        icon="bi-diagram-3"
        breadcrumbs={breadcrumbs}
        actions={
          agency ? (
            <div className="d-flex gap-2 flex-wrap">
              <Button
                variant="outline"
                icon="bi-bar-chart-line"
                onClick={() => navigate(agencyStatisticsPath(agency.id))}
              >
                Statistiques
              </Button>
              <Button
                variant="outline"
                icon={agency.status === 'active' ? 'bi-pause-circle' : 'bi-play-circle'}
                loading={isToggling}
                onClick={handleToggleStatus}
              >
                {agency.status === 'active' ? 'Désactiver' : 'Activer'}
              </Button>
              <Button variant="outline" icon="bi-pencil" onClick={() => navigate(agencyEditPath(agency.id))}>
                Modifier
              </Button>
              <Button variant="outline" icon="bi-trash3" onClick={() => setDeleteOpen(true)}>
                Supprimer
              </Button>
            </div>
          ) : undefined
        }
      />

      {isLoading && !agency ? (
        <LoadingState variant="text" lines={6} label="Chargement de l’agence…" />
      ) : error || !agency ? (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error || 'Agence introuvable.'}
        </Alert>
      ) : (
        <>
          <div className="card mb-3">
            <div className="card-body d-flex flex-wrap align-items-center gap-3">
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex flex-wrap gap-2">
                  <AgencyStatusBadge status={agency.status} />
                  {type && <AgencyTypeBadge type={agency.type} />}
                  {company && (
                    <Badge variant="dark" soft>
                      {company.name}
                    </Badge>
                  )}
                </div>
                <p className="text-secondary mb-0 mt-2">
                  <code>{agency.code}</code>
                  {agency.description ? ` · ${agency.description}` : ''}
                </p>
              </div>
              <div className="navix-agency-detail__stats d-flex gap-2 flex-wrap">
                <StatBox icon="bi-truck" label="Véhicules" value={agency.vehicleCount} />
                <StatBox icon="bi-person-badge" label="Chauffeurs" value={agency.driverCount} />
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-7">
              <Card title="Informations">
                <dl className="mb-0">
                  <InfoRow icon="bi-diagram-3" label="Type">
                    {type ? type.label : agency.type || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-buildings" label="Entreprise">
                    {company?.name || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-person-gear" label="Responsable">
                    {manager ? manager.fullName : '—'}
                  </InfoRow>
                  <InfoRow icon="bi-telephone" label="Téléphone">
                    {agency.phone || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-envelope" label="Email">
                    {agency.email ? (
                      <a href={`mailto:${agency.email}`} className="text-break">
                        {agency.email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </InfoRow>
                  <InfoRow icon="bi-clock" label="Horaires d’ouverture">
                    {agency.openingHours || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-calendar-plus" label="Créée le">
                    {formatAgencyLongDate(agency.createdAt)}
                  </InfoRow>
                  <InfoRow icon="bi-arrow-repeat" label="Mis à jour le">
                    {formatAgencyDateTime(agency.updatedAt)}
                  </InfoRow>
                </dl>
              </Card>

              <Card title="Localisation" className="mt-3">
                <AgencyLocation agency={agency} />
              </Card>
            </div>

            <div className="col-lg-5">
              <Card title={`Véhicules (${agencyVehicles.length})`}>
                <AgencyVehicles vehicles={agencyVehicles} />
              </Card>

              <Card title={`Chauffeurs (${agencyDrivers.length})`} className="mt-3">
                <AgencyDrivers drivers={agencyDrivers} />
              </Card>
            </div>
          </div>

          <Card title="Activité récente" className="mt-3">
            <AgencyActivity activity={agencyActivity} />
          </Card>

          <DeleteAgencyModal
            agency={agency}
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

export default AgencyDetailsPage;
