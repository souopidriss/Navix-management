/**
 * Navix Fuel — FuelEditPage
 * --------------------------------------------------------------------------
 * Édition d'un plein de carburant : formulaire pré-rempli (toFuelFormValues),
 * validé par Zod, soumis au store (simulé). Redirection vers le détail après
 * succès. Un plein validé ou annulé est verrouillé côté service (409).
 */
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Card } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState } from '@/components/core';
import { ROUTES, fuelDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '@/features/vehicles';
import { useDriversStore } from '@/features/drivers';
import { useTripsStore } from '@/features/trips';
import { useFuelStore } from '../store';
import FuelForm from '../components/FuelForm';
import { toFuelFormValues, toFuelPayload } from '../schemas';

const FuelEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedFuel = useFuelStore((state) => state.selectedFuel);
  const isLoading = useFuelStore((state) => state.isLoading);
  const isSaving = useFuelStore((state) => state.isSaving);
  const error = useFuelStore((state) => state.error);
  const fetchFuel = useFuelStore((state) => state.fetchFuel);
  const updateFuel = useFuelStore((state) => state.updateFuel);
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
    if (id) fetchFuel(id);
    fetchCompanies();
    fetchVehicles();
    fetchDrivers();
    fetchTrips();
  }, [id, fetchFuel, fetchCompanies, fetchVehicles, fetchDrivers, fetchTrips]);

  const fuel = selectedFuel?.id === id ? selectedFuel : null;

  const initialValues = useMemo(() => (fuel ? toFuelFormValues(fuel) : undefined), [fuel]);

  const handleSubmit = async (values) => {
    if (!id) return;
    clearError();

    const result = await updateFuel(id, toFuelPayload(values));
    if (result.success) {
      toast.success(`Plein « ${result.data.fuelNumber} » mis à jour.`);
      navigate(fuelDetailPath(id));
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Carburant', to: ROUTES.FUEL },
    { label: fuel ? fuel.fuelNumber : '…' },
    { label: 'Modifier' },
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>{fuel ? `Modifier ${fuel.fuelNumber} — Navix Management` : 'Modifier — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title={fuel ? `Modifier ${fuel.fuelNumber}` : 'Modifier le plein'}
        subtitle="Mettez à jour les informations du plein de carburant."
        icon="bi-fuel-pump"
        breadcrumbs={breadcrumbs}
      />

      {isLoading && !fuel ? (
        <LoadingState variant="form" label="Chargement du plein…" />
      ) : error && !fuel ? (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      ) : fuel ? (
        <Card>
          <FuelForm
            initialValues={initialValues}
            companies={companies}
            vehicles={vehicles}
            drivers={drivers}
            trips={trips}
            onSubmit={handleSubmit}
            submitLabel="Enregistrer les modifications"
            loading={isSaving}
            error={error}
            onCancel={() => navigate(fuelDetailPath(fuel.id))}
          />
        </Card>
      ) : (
        <Alert variant="danger" className="mb-3">
          Plein introuvable.
        </Alert>
      )}
    </PageContainer>
  );
};

export default FuelEditPage;
