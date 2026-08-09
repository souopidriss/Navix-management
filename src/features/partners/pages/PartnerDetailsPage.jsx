/**
 * Navix Partners — PartnerDetailsPage
 * --------------------------------------------------------------------------
 * Détail d'un partenaire : en-tête (type, statut, entreprise, code),
 * carte d'informations (contact, localisation, fiscal, notes) et actions
 * (modifier / supprimer) filtrées par permission. États chargement / erreur /
 * introuvable.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Badge, Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState } from '@/components/core';
import { ROUTES, partnerEditPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useCan, PERMISSIONS } from '@/features/rbac';
import { usePartnersStore } from '../store';
import { PartnerStatusBadge, PartnerTypeBadge, DeletePartnerModal } from '../components';
import {
  getPartnerType,
  formatPartnerDate,
  formatPartnerLongDate,
} from '../constants';
import './PartnerDetailsPage.css';

const InfoRow = ({ icon, label, children }) => (
  <div className="d-flex align-items-start gap-3 py-2">
    <span className="navix-partner-detail__icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <div className="min-w-0">
      <dt className="navix-partner-detail__label">{label}</dt>
      <dd className="navix-partner-detail__value mb-0">{children}</dd>
    </div>
  </div>
);

const PartnerDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedPartner = usePartnersStore((state) => state.selectedPartner);
  const isLoading = usePartnersStore((state) => state.isLoading);
  const error = usePartnersStore((state) => state.error);
  const fetchPartner = usePartnersStore((state) => state.fetchPartner);
  const deletePartner = usePartnersStore((state) => state.deletePartner);
  const clearError = usePartnersStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const can = useCan();
  const canEdit = can(PERMISSIONS.PARTNERS_UPDATE);
  const canDelete = can(PERMISSIONS.PARTNERS_DELETE);

  useEffect(() => {
    if (id) fetchPartner(id);
    fetchCompanies();
  }, [id, fetchPartner, fetchCompanies]);

  const partner = selectedPartner?.id === id ? selectedPartner : null;

  const company = useMemo(
    () => (partner ? companies.find((item) => item.id === partner.companyId) : null),
    [companies, partner],
  );

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deletePartner(id);
    setIsDeleting(false);

    if (result.success) {
      toast.success('Partenaire supprimé.');
      navigate(ROUTES.PARTNERS);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer le partenaire.');
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Partenaires', to: ROUTES.PARTNERS },
    { label: partner ? partner.name : '…' },
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>{partner ? `${partner.name} — Navix Management` : 'Partenaire — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title={partner ? partner.name : 'Partenaire'}
        subtitle={partner ? partner.code : undefined}
        icon="bi-handshake"
        breadcrumbs={breadcrumbs}
        actions={
          partner ? (
            <div className="d-flex gap-2 flex-wrap">
              {canEdit && (
                <Button variant="outline" icon="bi-pencil" onClick={() => navigate(partnerEditPath(partner.id))}>
                  Modifier
                </Button>
              )}
              {canDelete && (
                <Button variant="outline" icon="bi-trash3" onClick={() => setDeleteOpen(true)}>
                  Supprimer
                </Button>
              )}
            </div>
          ) : undefined
        }
      />

      {isLoading && !partner ? (
        <LoadingState variant="text" lines={6} label="Chargement du partenaire…" />
      ) : error || !partner ? (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error || 'Partenaire introuvable.'}
        </Alert>
      ) : (
        <>
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex flex-wrap align-items-center gap-2">
                <PartnerStatusBadge status={partner.status} />
                <PartnerTypeBadge type={partner.type} />
                {company && (
                  <Badge variant="dark" soft>
                    {company.name}
                  </Badge>
                )}
              </div>
              <p className="text-secondary mb-0 mt-2">
                {partner.address || '—'}
                {partner.city ? ` · ${partner.city}` : ''}
                {partner.country ? ` · ${partner.country}` : ''}
              </p>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-7">
              <Card title="Informations du partenaire">
                <dl className="mb-0">
                  <InfoRow icon="bi-handshake" label="Type">
                    {getPartnerType(partner.type).label}
                  </InfoRow>
                  <InfoRow icon="bi-person" label="Contact">
                    {partner.contactName || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-telephone" label="Téléphone">
                    {partner.phone ? (
                      <a className="navix-partner-detail__link" href={`tel:${partner.phone}`}>
                        {partner.phone}
                      </a>
                    ) : (
                      '—'
                    )}
                  </InfoRow>
                  <InfoRow icon="bi-envelope" label="Email">
                    {partner.email ? (
                      <a className="navix-partner-detail__link" href={`mailto:${partner.email}`}>
                        {partner.email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </InfoRow>
                  <InfoRow icon="bi-globe2" label="Site web">
                    {partner.website ? (
                      <a
                        className="navix-partner-detail__link"
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {partner.website}
                      </a>
                    ) : (
                      '—'
                    )}
                  </InfoRow>
                  <InfoRow icon="bi-buildings" label="Entreprise">
                    {company?.name || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-geo-alt" label="Adresse">
                    {partner.address || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-building" label="Ville">
                    {partner.city || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-flag" label="Pays">
                    {partner.country || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-card-text" label="N° fiscal">
                    {partner.taxId || '—'}
                  </InfoRow>
                  <InfoRow icon="bi-person-plus" label="Créé le">
                    {formatPartnerLongDate(partner.createdAt)}
                    {partner.createdBy ? ` par ${partner.createdBy}` : ''}
                  </InfoRow>
                  <InfoRow icon="bi-arrow-repeat" label="Mis à jour le">
                    {formatPartnerDate(partner.updatedAt)}
                  </InfoRow>
                </dl>
              </Card>
            </div>

            <div className="col-lg-5">
              <Card title="Notes">
                <p className="mb-0 text-secondary">{partner.notes || 'Aucune note.'}</p>
              </Card>
            </div>
          </div>

          <DeletePartnerModal
            partner={partner}
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

export default PartnerDetailsPage;
