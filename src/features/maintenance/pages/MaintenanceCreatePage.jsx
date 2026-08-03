/**
 * Navix Maintenance — MaintenanceCreatePage
 * --------------------------------------------------------------------------
 * Création d'un entretien : grille métier (MaintenanceForm) embarquée dans le
 * FormModal générique de la bibliothèque core, validation exclusive Zod
 * (useZodForm). L'entreprise sélectionnée détermine les véhicules proposés.
 * Redirection vers le détail après succès.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { PageContainer, PageHeader, FormModal } from '@/components/core';
import { ROUTES, maintenanceDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '@/features/vehicles';
import { useZodForm } from '@/features/auth';
import { useMaintenanceStore } from '../store';
import { MaintenanceForm } from '../components';
import {
  maintenanceSchema,
  maintenanceDefaultValues,
  toMaintenancePayload,
} from '../schemas';

const MaintenanceCreatePage = () => {
  const navigate = useNavigate();

  const isSaving = useMaintenanceStore((state) => state.isSaving);
  const error = useMaintenanceStore((state) => state.error);
  const createMaintenance = useMaintenanceStore((state) => state.createMaintenance);
  const clearError = useMaintenanceStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const vehicles = useVehiclesStore((state) => state.vehicles);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);

  useEffect(() => {
    fetchCompanies();
    fetchVehicles();
  }, [fetchCompanies, fetchVehicles]);

  const handleValidSubmit = async (values) => {
    clearError();

    const result = await createMaintenance(toMaintenancePayload(values));
    if (result.success) {
      toast.success(`Entretien « ${result.data.maintenanceNumber} » créé avec succès.`);
      navigate(maintenanceDetailPath(result.data.id));
    }
  };

  const { values, errors, setField, handleSubmit } = useZodForm({
    schema: maintenanceSchema,
    defaultValues: maintenanceDefaultValues,
    onSubmit: handleValidSubmit,
  });

  return (
    <PageContainer>
      <Helmet>
        <title>Nouvel entretien — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Nouvel entretien"
        subtitle="Planifiez ou enregistrez un entretien de véhicule."
        icon="bi-wrench-adjustable"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Entretiens', to: ROUTES.ENTRETIENS },
          { label: 'Nouveau' },
        ]}
      />

      <FormModal
        open
        onClose={() => navigate(ROUTES.ENTRETIENS)}
        title="Nouvel entretien"
        subtitle="Les champs de l’entretien sont validés avant enregistrement."
        icon="bi-wrench-adjustable"
        size="lg"
        onSubmit={handleSubmit}
        submitLabel="Enregistrer l’entretien"
        loading={isSaving}
        error={error}
      >
        <MaintenanceForm
          values={values}
          errors={errors}
          setField={setField}
          companies={companies}
          vehicles={vehicles}
        />
      </FormModal>
    </PageContainer>
  );
};

export default MaintenanceCreatePage;
