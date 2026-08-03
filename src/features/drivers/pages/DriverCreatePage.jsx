/**
 * Navix Drivers — DriverCreatePage
 * --------------------------------------------------------------------------
 * Création d'un chauffeur : formulaire validé par Zod (useZodForm), soumis
 * au store (simulé). Redirection vers le détail après succès.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES, driverDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useDriversStore } from '../store';
import DriverForm from '../components/DriverForm';
import { toDriverPayload } from '../schemas';

const DriverCreatePage = () => {
  const navigate = useNavigate();

  const drivers = useDriversStore((state) => state.drivers);
  const agencies = useDriversStore((state) => state.agencies);
  const isSaving = useDriversStore((state) => state.isSaving);
  const error = useDriversStore((state) => state.error);
  const fetchDrivers = useDriversStore((state) => state.fetchDrivers);
  const fetchAgencies = useDriversStore((state) => state.fetchAgencies);
  const createDriver = useDriversStore((state) => state.createDriver);
  const clearError = useDriversStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  useEffect(() => {
    fetchDrivers();
    fetchCompanies();
    fetchAgencies();
  }, [fetchDrivers, fetchCompanies, fetchAgencies]);

  const handleSubmit = async (values) => {
    clearError();

    const result = await createDriver(toDriverPayload(values));
    if (result.success) {
      toast.success(`Chauffeur « ${values.firstName} ${values.lastName} » créé avec succès.`);
      navigate(driverDetailPath(result.data.id));
    }
  };

  return (
    <PageContainer>
      <Helmet>
        <title>Nouveau chauffeur — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Nouveau chauffeur"
        subtitle="Ajoutez un conducteur à votre équipe."
        icon="bi-person-badge"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Chauffeurs', to: ROUTES.DRIVERS },
          { label: 'Nouveau' },
        ]}
      />

      <Card>
        <DriverForm
          drivers={drivers}
          companies={companies}
          agencies={agencies}
          onSubmit={handleSubmit}
          submitLabel="Créer le chauffeur"
          loading={isSaving}
          error={error}
          onCancel={() => navigate(ROUTES.DRIVERS)}
        />
      </Card>
    </PageContainer>
  );
};

export default DriverCreatePage;
