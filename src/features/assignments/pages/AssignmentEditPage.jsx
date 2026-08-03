/**
 * Navix Assignments — AssignmentEditPage
 * --------------------------------------------------------------------------
 * Édition d'une affectation : formulaire pré-rempli (toAssignmentFormValues),
 * validé par Zod, soumis au store (simulé). Redirection vers le détail après
 * succès. L'affectation éditée est exclue du contrôle de conflits.
 */
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Card, Spinner } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES, assignmentDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '@/features/vehicles';
import { useDriversStore } from '@/features/drivers';
import { useAssignmentsStore } from '../store';
import AssignmentForm from '../components/AssignmentForm';
import { toAssignmentFormValues, toAssignmentPayload } from '../schemas';

const AssignmentEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const assignments = useAssignmentsStore((state) => state.assignments);
  const selectedAssignment = useAssignmentsStore((state) => state.selectedAssignment);
  const isLoading = useAssignmentsStore((state) => state.isLoading);
  const isSaving = useAssignmentsStore((state) => state.isSaving);
  const error = useAssignmentsStore((state) => state.error);
  const fetchAssignments = useAssignmentsStore((state) => state.fetchAssignments);
  const fetchAssignment = useAssignmentsStore((state) => state.fetchAssignment);
  const updateAssignment = useAssignmentsStore((state) => state.updateAssignment);
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
    if (id) fetchAssignment(id);
    fetchAssignments();
    fetchCompanies();
    fetchAgencies();
    fetchVehicles();
    fetchDrivers();
  }, [id, fetchAssignment, fetchAssignments, fetchCompanies, fetchAgencies, fetchVehicles, fetchDrivers]);

  const assignment = selectedAssignment?.id === id ? selectedAssignment : null;

  const initialValues = useMemo(() => (assignment ? toAssignmentFormValues(assignment) : undefined), [assignment]);

  const handleSubmit = async (values) => {
    if (!id) return;
    clearError();

    const result = await updateAssignment(id, toAssignmentPayload(values));
    if (result.success) {
      toast.success(`Affectation « ${result.data.assignmentNumber} » mise à jour.`);
      navigate(assignmentDetailPath(id));
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Affectations', to: ROUTES.ASSIGNMENTS },
    { label: assignment ? assignment.assignmentNumber : '…' },
    { label: 'Modifier' },
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>{assignment ? `Modifier ${assignment.assignmentNumber} — Navix Management` : 'Modifier — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title={assignment ? `Modifier ${assignment.assignmentNumber}` : 'Modifier l’affectation'}
        subtitle="Mettez à jour les informations de l’affectation."
        icon="bi-shuffle"
        breadcrumbs={breadcrumbs}
      />

      {isLoading && !assignment ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner size="lg" label="Chargement de l’affectation…" />
        </div>
      ) : error && !assignment ? (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      ) : assignment ? (
        <Card>
          <AssignmentForm
            initialValues={initialValues}
            editingId={assignment.id}
            assignments={assignments}
            vehicles={vehicles}
            drivers={drivers}
            companies={companies}
            agencies={agencies}
            onSubmit={handleSubmit}
            submitLabel="Enregistrer les modifications"
            loading={isSaving}
            error={error}
            onCancel={() => navigate(assignmentDetailPath(assignment.id))}
          />
        </Card>
      ) : (
        <Alert variant="danger" className="mb-3">
          Affectation introuvable.
        </Alert>
      )}
    </PageContainer>
  );
};

export default AssignmentEditPage;
