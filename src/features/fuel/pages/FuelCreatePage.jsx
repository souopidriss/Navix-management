/**
 * Navix Fuel — FuelCreatePage
 * --------------------------------------------------------------------------
 * Création d'un plein de carburant : formulaire validé par Zod (useZodForm),
 * soumis au store (simulé). L'entreprise sélectionnée détermine les options
 * des listes liées (véhicule, chauffeur, trajet). Redirection vers le détail
 * après succès.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES, fuelDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '@/features/vehicles';
import { useDriversStore } from '@/features/drivers';
import { useTripsStore } from '@/features/trips';
import { useFuelStore } from '../store';
import FuelForm from '../components/FuelForm';
import { toFuelPayload } from '../schemas';

const FuelCreatePage = () => {
  const navigate = useNavigate();

  const isSaving = useFuelStore((state) => state.isSaving);
  const error = useFuelStore((state) => state.error);
  const createFuel = useFuelStore((state) => state.createFuel);
  const clearError = useFuelStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const vehicles = useVehiclesStore((state) => state.vehicles);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);

  const drivers = useDriversStore((state) => state.drivers);
  const fetchDrivers = useDriversStore((state) => state.fetchDrivers);

  const trips = useTripsStore((state) => state.trips);
  const fetchTrips = useTripsStore((state) => state.fetchTrips);

  useEffect(() => {
    fetchCompanies();
    fetchVehicles();
    fetchDrivers();
    fetchTrips();
  }, [fetchCompanies, fetchVehicles, fetchDrivers, fetchTrips]);

  const handleSubmit = async (values) => {
    clearError();

    const result = await createFuel(toFuelPayload(values));
    if (result.success) {
      toast.success(`Plein « ${result.data.fuelNumber} » créé avec succès.`);
      navigate(fuelDetailPath(result.data.id));
    }
  };

  return (
    <PageContainer>
      <Helmet>
        <title>Nouveau plein — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Nouveau plein"
        subtitle="Enregistrez un plein de carburant pour un véhicule."
        icon="bi-fuel-pump"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Carburant', to: ROUTES.FUEL },
          { label: 'Nouveau' },
        ]}
      />

      <Card>
        <FuelForm
          companies={companies}
          vehicles={vehicles}
          drivers={drivers}
          trips={trips}
          onSubmit={handleSubmit}
          submitLabel="Enregistrer le plein"
          loading={isSaving}
          error={error}
          onCancel={() => navigate(ROUTES.FUEL)}
        />
      </Card>
    </PageContainer>
  );
};

export default FuelCreatePage;
