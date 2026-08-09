/**
 * Navix Partners — PartnerCreatePage
 * --------------------------------------------------------------------------
 * Création d'un partenaire : grille métier (PartnerForm) embarquée dans le
 * FormModal générique de la bibliothèque core, validation exclusive Zod
 * (useZodForm). Redirection vers le détail après succès.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { PageContainer, PageHeader, FormModal } from '@/components/core';
import { ROUTES, partnerDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useZodForm } from '@/features/auth';
import { usePartnersStore } from '../store';
import { PartnerForm } from '../components';
import { partnerSchema, partnerDefaultValues, toPartnerPayload } from '../schemas';

const PartnerCreatePage = () => {
  const navigate = useNavigate();

  const isSaving = usePartnersStore((state) => state.isSaving);
  const error = usePartnersStore((state) => state.error);
  const createPartner = usePartnersStore((state) => state.createPartner);
  const clearError = usePartnersStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleValidSubmit = async (values) => {
    clearError();

    const result = await createPartner(toPartnerPayload(values));
    if (result.success) {
      toast.success(`Partenaire « ${result.data.name} » créé avec succès.`);
      navigate(partnerDetailPath(result.data.id));
    }
  };

  const { values, errors, setField, handleSubmit } = useZodForm({
    schema: partnerSchema,
    defaultValues: partnerDefaultValues,
    onSubmit: handleValidSubmit,
  });

  return (
    <PageContainer>
      <Helmet>
        <title>Nouveau partenaire — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Nouveau partenaire"
        subtitle="Enregistrez un prestataire, fournisseur ou assureur."
        icon="bi-handshake"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Partenaires', to: ROUTES.PARTNERS },
          { label: 'Nouveau' },
        ]}
      />

      <FormModal
        open
        onClose={() => navigate(ROUTES.PARTNERS)}
        title="Nouveau partenaire"
        subtitle="Les informations sont validées avant enregistrement."
        icon="bi-handshake"
        size="lg"
        onSubmit={handleSubmit}
        submitLabel="Enregistrer le partenaire"
        loading={isSaving}
        error={error}
      >
        <PartnerForm values={values} errors={errors} setField={setField} companies={companies} />
      </FormModal>
    </PageContainer>
  );
};

export default PartnerCreatePage;
