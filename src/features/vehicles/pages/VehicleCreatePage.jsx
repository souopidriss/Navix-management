/**
 * Navix Vehicles — VehicleCreatePage
 * --------------------------------------------------------------------------
 * Création d'un véhicule : formulaire validé par Zod (useZodForm), soumis
 * au store (simulé). Redirection vers la liste après succès.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '../store';
import VehicleForm from '../components/VehicleForm';
import { toVehiclePayload } from '../schemas';

const VehicleCreatePage = () => {
  const navigate = useNavigate();

  const vehicles = useVehiclesStore((state) => state.vehicles);
  const isSaving = useVehiclesStore((state) => state.isSaving);
  const error = useVehiclesStore((state) => state.error);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);
  const createVehicle = useVehiclesStore((state) => state.createVehicle);
  const clearError = useVehiclesStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  useEffect(() => {
    fetchVehicles();
    fetchCompanies();
  }, [fetchVehicles, fetchCompanies]);

  const handleSubmit = async (values) => {
    clearError();

    const result = await createVehicle(toVehiclePayload(values));
    if (result.success) {
      toast.success(`Véhicule « ${values.registrationNumber} » créé avec succès.`);
      navigate(ROUTES.VEHICLES);
    }
  };

  return (
    <PageContainer>
      <Helmet>
        <title>Nouveau véhicule — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Nouveau véhicule"
        subtitle="Ajoutez un véhicule à la flotte."
        icon="bi-truck"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Véhicules', to: ROUTES.VEHICLES },
          { label: 'Nouveau' },
        ]}
      />

      <Card>
        <VehicleForm
          vehicles={vehicles}
          companies={companies}
          onSubmit={handleSubmit}
          submitLabel="Créer le véhicule"
          loading={isSaving}
          error={error}
          onCancel={() => navigate(ROUTES.VEHICLES)}
        />
      </Card>
    </PageContainer>
  );
};

export default VehicleCreatePage;
