/**
 * Navix Trips — TripCreatePage
 * --------------------------------------------------------------------------
 * Création d'un trajet : formulaire validé par Zod (useZodForm), soumis au
 * store (simulé). L'affectation choisie détermine le véhicule et le
 * chauffeur. Redirection vers le détail après succès.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES, tripDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '@/features/vehicles';
import { useDriversStore } from '@/features/drivers';
import { useAssignmentsStore } from '@/features/assignments';
import { useTripsStore } from '../store';
import TripForm from '../components/TripForm';
import { toTripPayload } from '../schemas';

const TripCreatePage = () => {
  const navigate = useNavigate();

  const assignments = useAssignmentsStore((state) => state.assignments);
  const fetchAssignments = useAssignmentsStore((state) => state.fetchAssignments);

  const isSaving = useTripsStore((state) => state.isSaving);
  const error = useTripsStore((state) => state.error);
  const createTrip = useTripsStore((state) => state.createTrip);
  const clearError = useTripsStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const vehicles = useVehiclesStore((state) => state.vehicles);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);

  const drivers = useDriversStore((state) => state.drivers);
  const fetchDrivers = useDriversStore((state) => state.fetchDrivers);

  useEffect(() => {
    fetchAssignments();
    fetchCompanies();
    fetchVehicles();
    fetchDrivers();
  }, [fetchAssignments, fetchCompanies, fetchVehicles, fetchDrivers]);

  const driverById = Object.fromEntries(drivers.map((driver) => [driver.id, driver]));
  const vehicleById = Object.fromEntries(vehicles.map((vehicle) => [vehicle.id, vehicle]));

  const handleSubmit = async (values) => {
    clearError();

    const result = await createTrip(toTripPayload(values));
    if (result.success) {
      toast.success(`Trajet « ${result.data.tripNumber} » créé avec succès.`);
      navigate(tripDetailPath(result.data.id));
    }
  };

  return (
    <PageContainer>
      <Helmet>
        <title>Nouveau trajet — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Nouveau trajet"
        subtitle="Planifiez le déplacement d'un véhicule."
        icon="bi-signpost-split"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Trajets', to: ROUTES.TRIPS },
          { label: 'Nouveau' },
        ]}
      />

      <Card>
        <TripForm
          assignments={assignments}
          companies={companies}
          driverById={driverById}
          vehicleById={vehicleById}
          onSubmit={handleSubmit}
          submitLabel="Créer le trajet"
          loading={isSaving}
          error={error}
          onCancel={() => navigate(ROUTES.TRIPS)}
        />
      </Card>
    </PageContainer>
  );
};

export default TripCreatePage;
