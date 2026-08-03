/**
 * Navix Vehicles — VehicleEditPage
 * --------------------------------------------------------------------------
 * Édition d'un véhicule : chargement du détail, pré-remplissage du
 * formulaire, soumission au store (simulé). Redirection vers le détail
 * après succès. États chargement / erreur / introuvable gérés.
 */
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button, Card, Spinner } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES, vehicleDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '../store';
import VehicleForm from '../components/VehicleForm';
import { toVehicleFormValues, toVehiclePayload } from '../schemas';

const VehicleEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedVehicle = useVehiclesStore((state) => state.selectedVehicle);
  const vehicles = useVehiclesStore((state) => state.vehicles);
  const isLoading = useVehiclesStore((state) => state.isLoading);
  const isSaving = useVehiclesStore((state) => state.isSaving);
  const error = useVehiclesStore((state) => state.error);
  const fetchVehicle = useVehiclesStore((state) => state.fetchVehicle);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);
  const updateVehicle = useVehiclesStore((state) => state.updateVehicle);
  const clearError = useVehiclesStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  useEffect(() => {
    if (id) fetchVehicle(id);
    fetchVehicles();
    fetchCompanies();
  }, [id, fetchVehicle, fetchVehicles, fetchCompanies]);

  const vehicle = selectedVehicle?.id === id ? selectedVehicle : null;

  const handleSubmit = async (values) => {
    if (!id) return;
    clearError();

    const result = await updateVehicle(id, toVehiclePayload(values));
    if (result.success) {
      toast.success(`Véhicule « ${values.registrationNumber} » mis à jour.`);
      navigate(vehicleDetailPath(id));
    }
  };

  return (
    <PageContainer>
      <Helmet>
        <title>{vehicle ? `Modifier ${vehicle.registrationNumber} — Navix Management` : 'Modifier le véhicule — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title={vehicle ? `Modifier ${vehicle.registrationNumber}` : 'Modifier le véhicule'}
        icon="bi-truck"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Véhicules', to: ROUTES.VEHICLES },
          { label: vehicle ? vehicle.registrationNumber : '…' },
        ]}
      />

      {isLoading && !vehicle ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner size="lg" label="Chargement du véhicule…" />
        </div>
      ) : error && !vehicle ? (
        <>
          <Alert variant="danger" closable onClose={clearError} className="mb-3">
            {error}
          </Alert>
          <Button variant="outline" icon="bi-arrow-left" onClick={() => navigate(ROUTES.VEHICLES)}>
            Retour aux véhicules
          </Button>
        </>
      ) : (
        <Card>
          <VehicleForm
            initialValues={toVehicleFormValues(vehicle)}
            editingId={id}
            vehicles={vehicles}
            companies={companies}
            onSubmit={handleSubmit}
            submitLabel="Enregistrer les modifications"
            loading={isSaving}
            error={error}
            onCancel={() => navigate(vehicle ? vehicleDetailPath(vehicle.id) : ROUTES.VEHICLES)}
          />
        </Card>
      )}
    </PageContainer>
  );
};

export default VehicleEditPage;
