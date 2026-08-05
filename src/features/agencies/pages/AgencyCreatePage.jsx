/**
 * Navix Agencies — AgencyCreatePage
 * --------------------------------------------------------------------------
 * Création d'une agence / site : grille métier (AgencyForm) embarquée dans le
 * FormModal générique de la bibliothèque core, validation exclusive Zod
 * (useZodForm). Redirection vers le détail après succès.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { PageContainer, PageHeader, FormModal } from '@/components/core';
import { ROUTES, agencyDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useDriversStore } from '@/features/drivers';
import { useZodForm } from '@/features/auth';
import { useAgenciesStore } from '../store';
import { AgencyForm } from '../components';
import {
  agencySchema,
  agencyDefaultValues,
  toAgencyPayload,
} from '../schemas';

const AgencyCreatePage = () => {
  const navigate = useNavigate();

  const isSaving = useAgenciesStore((state) => state.isSaving);
  const error = useAgenciesStore((state) => state.error);
  const createAgency = useAgenciesStore((state) => state.createAgency);
  const clearError = useAgenciesStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const drivers = useDriversStore((state) => state.drivers);
  const fetchDrivers = useDriversStore((state) => state.fetchDrivers);

  useEffect(() => {
    fetchCompanies();
    fetchDrivers();
  }, [fetchCompanies, fetchDrivers]);

  const handleValidSubmit = async (values) => {
    clearError();

    const result = await createAgency(toAgencyPayload(values));
    if (result.success) {
      toast.success(`Agence « ${result.data.name} » créée avec succès.`);
      navigate(agencyDetailPath(result.data.id));
    }
  };

  const { values, errors, setField, handleSubmit } = useZodForm({
    schema: agencySchema,
    defaultValues: agencyDefaultValues,
    onSubmit: handleValidSubmit,
  });

  return (
    <PageContainer>
      <Helmet>
        <title>Nouvelle agence — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Nouvelle agence"
        subtitle="Créez une agence ou un site rattaché à une entreprise."
        icon="bi-diagram-3"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Agences', to: ROUTES.AGENCIES },
          { label: 'Nouvelle' },
        ]}
      />

      <FormModal
        open
        onClose={() => navigate(ROUTES.AGENCIES)}
        title="Nouvelle agence"
        subtitle="Les champs de l’agence sont validés avant enregistrement."
        icon="bi-diagram-3"
        size="lg"
        onSubmit={handleSubmit}
        submitLabel="Enregistrer l’agence"
        loading={isSaving}
        error={error}
      >
        <AgencyForm
          values={values}
          errors={errors}
          setField={setField}
          companies={companies}
          drivers={drivers}
        />
      </FormModal>
    </PageContainer>
  );
};

export default AgencyCreatePage;
