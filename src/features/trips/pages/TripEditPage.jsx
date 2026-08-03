/**
 * Navix Trips — TripEditPage
 * --------------------------------------------------------------------------
 * Édition d'un trajet : formulaire pré-rempli (toTripFormValues), validé par
 * Zod, soumis au store (simulé). Redirection vers le détail après succès.
 * Un trajet terminé est verrouillé côté service (409).
 */
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Card, Spinner } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES, tripDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '@/features/vehicles';
import { useDriversStore } from '@/features/drivers';
import { useAssignmentsStore } from '@/features/assignments';
import { useTripsStore } from '../store';
import TripForm from '../components/TripForm';
import { toTripFormValues, toTripPayload } from '../schemas';

const TripEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const assignments = useAssignmentsStore((state) => state.assignments);
  const fetchAssignments = useAssignmentsStore((state) => state.fetchAssignments);

  const selectedTrip = useTripsStore((state) => state.selectedTrip);
  const isLoading = useTripsStore((state) => state.isLoading);
  const isSaving = useTripsStore((state) => state.isSaving);
  const error = useTripsStore((state) => state.error);
  const fetchTrip = useTripsStore((state) => state.fetchTrip);
  const updateTrip = useTripsStore((state) => state.updateTrip);
  const clearError = useTripsStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const vehicles = useVehiclesStore((state) => state.vehicles);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);

  const drivers = useDriversStore((state) => state.drivers);
  const fetchDrivers = useDriversStore((state) => state.fetchDrivers);

  useEffect(() => {
    if (id) fetchTrip(id);
    fetchAssignments();
    fetchCompanies();
    fetchVehicles();
    fetchDrivers();
  }, [id, fetchTrip, fetchAssignments, fetchCompanies, fetchVehicles, fetchDrivers]);

  const trip = selectedTrip?.id === id ? selectedTrip : null;

  const driverById = useMemo(
    () => Object.fromEntries(drivers.map((driver) => [driver.id, driver])),
    [drivers],
  );

  const vehicleById = useMemo(
    () => Object.fromEntries(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles],
  );

  const initialValues = useMemo(() => (trip ? toTripFormValues(trip) : undefined), [trip]);

  const handleSubmit = async (values) => {
    if (!id) return;
    clearError();

    const result = await updateTrip(id, toTripPayload(values));
    if (result.success) {
      toast.success(`Trajet « ${result.data.tripNumber} » mis à jour.`);
      navigate(tripDetailPath(id));
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Trajets', to: ROUTES.TRIPS },
    { label: trip ? trip.tripNumber : '…' },
    { label: 'Modifier' },
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>{trip ? `Modifier ${trip.tripNumber} — Navix Management` : 'Modifier — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title={trip ? `Modifier ${trip.tripNumber}` : 'Modifier le trajet'}
        subtitle="Mettez à jour les informations du trajet."
        icon="bi-signpost-split"
        breadcrumbs={breadcrumbs}
      />

      {isLoading && !trip ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner size="lg" label="Chargement du trajet…" />
        </div>
      ) : error && !trip ? (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      ) : trip ? (
        <Card>
          <TripForm
            initialValues={initialValues}
            assignments={assignments}
            companies={companies}
            driverById={driverById}
            vehicleById={vehicleById}
            onSubmit={handleSubmit}
            submitLabel="Enregistrer les modifications"
            loading={isSaving}
            error={error}
            onCancel={() => navigate(tripDetailPath(trip.id))}
          />
        </Card>
      ) : (
        <Alert variant="danger" className="mb-3">
          Trajet introuvable.
        </Alert>
      )}
    </PageContainer>
  );
};

export default TripEditPage;
