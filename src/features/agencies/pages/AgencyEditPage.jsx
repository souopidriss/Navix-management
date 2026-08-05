/**
 * Navix Agencies — AgencyEditPage
 * --------------------------------------------------------------------------
 * Modification d'une agence / site : pré-remplissage via toAgencyFormValues,
 * grille métier (AgencyForm) dans le FormModal générique, validation Zod
 * (useZodForm). Redirection vers le détail après succès.
 */
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert } from '@/components/ui';
import { PageContainer, PageHeader, FormModal, LoadingState } from '@/components/core';
import { ROUTES, agencyDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useDriversStore } from '@/features/drivers';
import { useZodForm } from '@/features/auth';
import { useAgenciesStore } from '../store';
import { AgencyForm } from '../components';
import { agencySchema, agencyDefaultValues, toAgencyFormValues, toAgencyPayload } from '../schemas';

const AgencyEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedAgency = useAgenciesStore((state) => state.selectedAgency);
  const isSaving = useAgenciesStore((state) => state.isSaving);
  const error = useAgenciesStore((state) => state.error);
  const fetchAgency = useAgenciesStore((state) => state.fetchAgency);
  const updateAgency = useAgenciesStore((state) => state.updateAgency);
  const clearError = useAgenciesStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const drivers = useDriversStore((state) => state.drivers);
  const fetchDrivers = useDriversStore((state) => state.fetchDrivers);

  useEffect(() => {
    if (id) fetchAgency(id);
    fetchCompanies();
    fetchDrivers();
  }, [id, fetchAgency, fetchCompanies, fetchDrivers]);

  const agency = selectedAgency?.id === id ? selectedAgency : null;

  const handleValidSubmit = async (values) => {
    if (!id) return;
    clearError();

    const result = await updateAgency(id, toAgencyPayload(values));
    if (result.success) {
      toast.success(`Agence « ${result.data.name} » mise à jour.`);
      navigate(agencyDetailPath(id));
    }
  };

  const { values, errors, setField, handleSubmit } = useZodForm({
    schema: agencySchema,
    defaultValues: agency ? toAgencyFormValues(agency) : agencyDefaultValues,
    onSubmit: handleValidSubmit,
  });

  return (
    <PageContainer>
      <Helmet>
        <title>{agency ? `Modifier ${agency.name} — Navix Management` : 'Modifier l’agence — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title={agency ? `Modifier ${agency.name}` : 'Modifier l’agence'}
        subtitle="Mettez à jour les informations de l’agence ou du site."
        icon="bi-diagram-3"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Agences', to: ROUTES.AGENCIES },
          { label: agency ? agency.name : '…' },
          { label: 'Modifier' },
        ]}
      />

      {!agency && !isSaving ? (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error || 'Agence introuvable.'}
        </Alert>
      ) : !agency ? (
        <LoadingState variant="text" lines={6} label="Chargement de l’agence…" />
      ) : (
        <FormModal
          open
          onClose={() => navigate(agencyDetailPath(id))}
          title="Modifier l’agence"
          subtitle="Les champs de l’agence sont validés avant enregistrement."
          icon="bi-diagram-3"
          size="lg"
          onSubmit={handleSubmit}
          submitLabel="Enregistrer les modifications"
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
      )}
    </PageContainer>
  );
};

export default AgencyEditPage;
