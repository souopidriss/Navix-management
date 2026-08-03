/**
 * Navix Assignments — AssignmentCreatePage
 * --------------------------------------------------------------------------
 * Création d'une affectation : formulaire validé par Zod (useZodForm), soumis
 * au store (simulé). Les véhicules et chauffeurs déjà en affectation active
 * sont désactivés. Redirection vers le détail après succès.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES, assignmentDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '@/features/vehicles';
import { useDriversStore } from '@/features/drivers';
import { useAssignmentsStore } from '../store';
import AssignmentForm from '../components/AssignmentForm';
import { toAssignmentPayload } from '../schemas';

const AssignmentCreatePage = () => {
  const navigate = useNavigate();

  const assignments = useAssignmentsStore((state) => state.assignments);
  const isSaving = useAssignmentsStore((state) => state.isSaving);
  const error = useAssignmentsStore((state) => state.error);
  const fetchAssignments = useAssignmentsStore((state) => state.fetchAssignments);
  const createAssignment = useAssignmentsStore((state) => state.createAssignment);
  const clearError = useAssignmentsStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const vehicles = useVehiclesStore((state) => state.vehicles);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);

  const drivers = useDriversStore((state) => state.drivers);
  const agencies = useDriversStore((state) => state.agencies);
  const fetchDrivers = useDriversStore((state) => state.fetchDrivers);
  const fetchAgencies = useDriversStore((state) => state.fetchAgencies);

  useEffect(() => {
    fetchAssignments();
    fetchCompanies();
    fetchAgencies();
    fetchVehicles();
    fetchDrivers();
  }, [fetchAssignments, fetchCompanies, fetchAgencies, fetchVehicles, fetchDrivers]);

  const handleSubmit = async (values) => {
    clearError();

    const result = await createAssignment(toAssignmentPayload(values));
    if (result.success) {
      toast.success(`Affectation « ${result.data.assignmentNumber} » créée avec succès.`);
      navigate(assignmentDetailPath(result.data.id));
    }
  };

  return (
    <PageContainer>
      <Helmet>
        <title>Nouvelle affectation — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Nouvelle affectation"
        subtitle="Affectez un véhicule à un chauffeur."
        icon="bi-shuffle"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Affectations', to: ROUTES.ASSIGNMENTS },
          { label: 'Nouvelle' },
        ]}
      />

      <Card>
        <AssignmentForm
          assignments={assignments}
          vehicles={vehicles}
          drivers={drivers}
          companies={companies}
          agencies={agencies}
          onSubmit={handleSubmit}
          submitLabel="Créer l’affectation"
          loading={isSaving}
          error={error}
          onCancel={() => navigate(ROUTES.ASSIGNMENTS)}
        />
      </Card>
    </PageContainer>
  );
};

export default AssignmentCreatePage;
