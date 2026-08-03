/**
 * Navix Maintenance — MaintenanceEditPage
 * --------------------------------------------------------------------------
 * Édition d'un entretien : grille métier (MaintenanceForm) embarquée dans le
 * FormModal générique, validation exclusive Zod (useZodForm). Un entretien
 * clôturé (terminé / annulé) est verrouillé : le formulaire est remplacé par
 * une alerte d'information.
 */
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, FormModal, LoadingState } from '@/components/core';
import { ROUTES, maintenanceDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '@/features/vehicles';
import { useZodForm } from '@/features/auth';
import { useMaintenanceStore } from '../store';
import { MaintenanceForm } from '../components';
import {
  maintenanceSchema,
  toMaintenanceFormValues,
  toMaintenancePayload,
} from '../schemas';
import { isMaintenanceFinished } from '../constants';

const EditForm = ({ maintenance, onCancel, onSaved }) => {
  const isSaving = useMaintenanceStore((state) => state.isSaving);
  const error = useMaintenanceStore((state) => state.error);
  const updateMaintenance = useMaintenanceStore((state) => state.updateMaintenance);
  const clearError = useMaintenanceStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const vehicles = useVehiclesStore((state) => state.vehicles);

  const handleValidSubmit = async (values) => {
    clearError();

    const result = await updateMaintenance(maintenance.id, toMaintenancePayload(values));
    if (result.success) {
      toast.success(`Entretien « ${result.data.maintenanceNumber} » mis à jour.`);
      onSaved(result.data.id);
    }
  };

  const { values, errors, setField, handleSubmit } = useZodForm({
    schema: maintenanceSchema,
    defaultValues: toMaintenanceFormValues(maintenance),
    onSubmit: handleValidSubmit,
  });

  return (
    <FormModal
      open
      onClose={onCancel}
      title={`Modifier ${maintenance.maintenanceNumber}`}
      subtitle="Les champs de l’entretien sont validés avant enregistrement."
      icon="bi-wrench-adjustable"
      size="lg"
      onSubmit={handleSubmit}
      submitLabel="Enregistrer les modifications"
      loading={isSaving}
      error={error}
    >
      <MaintenanceForm
        values={values}
        errors={errors}
        setField={setField}
        companies={companies}
        vehicles={vehicles}
      />
    </FormModal>
  );
};

const MaintenanceEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedMaintenance = useMaintenanceStore((state) => state.selectedMaintenance);
  const isLoading = useMaintenanceStore((state) => state.isLoading);
  const error = useMaintenanceStore((state) => state.error);
  const fetchMaintenance = useMaintenanceStore((state) => state.fetchMaintenance);
  const clearError = useMaintenanceStore((state) => state.clearError);

  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);

  useEffect(() => {
    if (id) fetchMaintenance(id);
    fetchCompanies();
    fetchVehicles();
  }, [id, fetchMaintenance, fetchCompanies, fetchVehicles]);

  const maintenance = selectedMaintenance?.id === id ? selectedMaintenance : null;
  const finished = maintenance ? isMaintenanceFinished(maintenance) : false;

  const goBack = () => navigate(maintenanceDetailPath(id));

  return (
    <PageContainer>
      <Helmet>
        <title>{maintenance ? `Modifier ${maintenance.maintenanceNumber} — Navix Management` : 'Modifier — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title="Modifier l’entretien"
        subtitle={maintenance ? maintenance.maintenanceNumber : undefined}
        icon="bi-wrench-adjustable"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Entretiens', to: ROUTES.ENTRETIENS },
          { label: maintenance ? maintenance.maintenanceNumber : '…' },
        ]}
      />

      {isLoading && !maintenance ? (
        <LoadingState variant="text" lines={6} label="Chargement de l’entretien…" />
      ) : error || !maintenance ? (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error || 'Entretien introuvable.'}
        </Alert>
      ) : finished ? (
        <Card>
          <div className="d-flex flex-column align-items-start gap-3">
            <Alert variant="warning" className="mb-0 w-100">
              <i className="bi bi-lock me-1" aria-hidden="true" />
              {maintenance.maintenanceNumber} est clôturé (terminé ou annulé) : il ne peut plus être modifié.
            </Alert>
            <Button variant="outline" icon="bi-arrow-left" onClick={goBack}>
              Retour au détail
            </Button>
          </div>
        </Card>
      ) : (
        <EditForm
          maintenance={maintenance}
          onCancel={goBack}
          onSaved={(updatedId) => navigate(maintenanceDetailPath(updatedId))}
        />
      )}
    </PageContainer>
  );
};

export default MaintenanceEditPage;
