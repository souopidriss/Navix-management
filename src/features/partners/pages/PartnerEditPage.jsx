/**
 * Navix Partners — PartnerEditPage
 * --------------------------------------------------------------------------
 * Édition d'un partenaire : grille métier (PartnerForm) embarquée dans le
 * FormModal générique, validation exclusive Zod (useZodForm). Le formulaire
 * n'est monté qu'une fois le partenaire chargé (defaultValues stables).
 */
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert } from '@/components/ui';
import { PageContainer, PageHeader, FormModal, LoadingState } from '@/components/core';
import { ROUTES, partnerDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useZodForm } from '@/features/auth';
import { usePartnersStore } from '../store';
import { PartnerForm } from '../components';
import { partnerSchema, toPartnerFormValues, toPartnerPayload } from '../schemas';

const EditForm = ({ partner, onCancel, onSaved }) => {
  const isSaving = usePartnersStore((state) => state.isSaving);
  const error = usePartnersStore((state) => state.error);
  const updatePartner = usePartnersStore((state) => state.updatePartner);
  const clearError = usePartnersStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);

  const handleValidSubmit = async (values) => {
    clearError();

    const result = await updatePartner(partner.id, toPartnerPayload(values));
    if (result.success) {
      toast.success(`Partenaire « ${result.data.name} » mis à jour.`);
      onSaved(result.data.id);
    }
  };

  const { values, errors, setField, handleSubmit } = useZodForm({
    schema: partnerSchema,
    defaultValues: toPartnerFormValues(partner),
    onSubmit: handleValidSubmit,
  });

  return (
    <FormModal
      open
      onClose={onCancel}
      title={`Modifier ${partner.name}`}
      subtitle="Les informations sont validées avant enregistrement."
      icon="bi-handshake"
      size="lg"
      onSubmit={handleSubmit}
      submitLabel="Enregistrer les modifications"
      loading={isSaving}
      error={error}
    >
      <PartnerForm values={values} errors={errors} setField={setField} companies={companies} />
    </FormModal>
  );
};

const PartnerEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedPartner = usePartnersStore((state) => state.selectedPartner);
  const isLoading = usePartnersStore((state) => state.isLoading);
  const error = usePartnersStore((state) => state.error);
  const fetchPartner = usePartnersStore((state) => state.fetchPartner);
  const clearError = usePartnersStore((state) => state.clearError);

  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  useEffect(() => {
    if (id) fetchPartner(id);
    fetchCompanies();
  }, [id, fetchPartner, fetchCompanies]);

  const partner = selectedPartner?.id === id ? selectedPartner : null;

  const goBack = () => navigate(partnerDetailPath(id));

  return (
    <PageContainer>
      <Helmet>
        <title>{partner ? `Modifier ${partner.name} — Navix Management` : 'Modifier — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title="Modifier le partenaire"
        subtitle={partner ? partner.code : undefined}
        icon="bi-handshake"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Partenaires', to: ROUTES.PARTNERS },
          { label: partner ? partner.name : '…' },
        ]}
      />

      {isLoading && !partner ? (
        <LoadingState variant="text" lines={6} label="Chargement du partenaire…" />
      ) : error || !partner ? (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error || 'Partenaire introuvable.'}
        </Alert>
      ) : (
        <EditForm
          partner={partner}
          onCancel={goBack}
          onSaved={(updatedId) => navigate(partnerDetailPath(updatedId))}
        />
      )}
    </PageContainer>
  );
};

export default PartnerEditPage;
