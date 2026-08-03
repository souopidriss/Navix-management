/**
 * Navix Drivers — DriverEditPage
 * --------------------------------------------------------------------------
 * Édition d'un chauffeur : chargement du détail, pré-remplissage du
 * formulaire, soumission au store (simulé). Redirection vers le détail
 * après succès. États chargement / erreur / introuvable gérés.
 */
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button, Card, Spinner } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES, driverDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useDriversStore } from '../store';
import DriverForm from '../components/DriverForm';
import { toDriverFormValues, toDriverPayload } from '../schemas';

const DriverEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedDriver = useDriversStore((state) => state.selectedDriver);
  const drivers = useDriversStore((state) => state.drivers);
  const agencies = useDriversStore((state) => state.agencies);
  const isLoading = useDriversStore((state) => state.isLoading);
  const isSaving = useDriversStore((state) => state.isSaving);
  const error = useDriversStore((state) => state.error);
  const fetchDriver = useDriversStore((state) => state.fetchDriver);
  const fetchDrivers = useDriversStore((state) => state.fetchDrivers);
  const fetchAgencies = useDriversStore((state) => state.fetchAgencies);
  const updateDriver = useDriversStore((state) => state.updateDriver);
  const clearError = useDriversStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  useEffect(() => {
    if (id) fetchDriver(id);
    fetchDrivers();
    fetchCompanies();
    fetchAgencies();
  }, [id, fetchDriver, fetchDrivers, fetchCompanies, fetchAgencies]);

  const driver = selectedDriver?.id === id ? selectedDriver : null;

  const handleSubmit = async (values) => {
    if (!id) return;
    clearError();

    const result = await updateDriver(id, toDriverPayload(values));
    if (result.success) {
      toast.success(`Chauffeur « ${values.firstName} ${values.lastName} » mis à jour.`);
      navigate(driverDetailPath(id));
    }
  };

  return (
    <PageContainer>
      <Helmet>
        <title>{driver ? `Modifier ${driver.fullName} — Navix Management` : 'Modifier le chauffeur — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title={driver ? `Modifier ${driver.fullName}` : 'Modifier le chauffeur'}
        icon="bi-person-badge"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Chauffeurs', to: ROUTES.DRIVERS },
          { label: driver ? driver.fullName : '…' },
        ]}
      />

      {isLoading && !driver ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner size="lg" label="Chargement du chauffeur…" />
        </div>
      ) : error && !driver ? (
        <>
          <Alert variant="danger" closable onClose={clearError} className="mb-3">
            {error}
          </Alert>
          <Button variant="outline" icon="bi-arrow-left" onClick={() => navigate(ROUTES.DRIVERS)}>
            Retour aux chauffeurs
          </Button>
        </>
      ) : (
        <Card>
          <DriverForm
            initialValues={toDriverFormValues(driver)}
            editingId={id}
            drivers={drivers}
            companies={companies}
            agencies={agencies}
            onSubmit={handleSubmit}
            submitLabel="Enregistrer les modifications"
            loading={isSaving}
            error={error}
            onCancel={() => navigate(driver ? driverDetailPath(driver.id) : ROUTES.DRIVERS)}
          />
        </Card>
      )}
    </PageContainer>
  );
};

export default DriverEditPage;
