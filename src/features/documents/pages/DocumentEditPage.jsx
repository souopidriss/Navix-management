/**
 * Navix Documents — DocumentEditPage
 * --------------------------------------------------------------------------
 * Édition des métadonnées d'un document (entreprise, type de fichier,
 * visibilité, association, catégorie, description). Le fichier physique
 * n'est pas modifiable depuis cette page. Le formulaire est embarqué dans le
 * FormModal générique et validé par Zod (documentEditSchema, sans exigence
 * de fichier).
 */
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert } from '@/components/ui';
import { PageContainer, PageHeader, FormModal, LoadingState } from '@/components/core';
import { ROUTES, documentDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '@/features/vehicles';
import { useDriversStore } from '@/features/drivers';
import { useMaintenanceStore } from '@/features/maintenance';
import { useTripsStore } from '@/features/trips';
import { useFuelStore } from '@/features/fuel';
import { useZodForm } from '@/features/auth';
import { useDocumentsStore } from '../store';
import { DocumentForm } from '../components';
import {
  documentEditSchema,
  toDocumentFormValues,
  toDocumentPayload,
} from '../schemas';
import { DOCUMENT_ICON } from '../constants';

const EditForm = ({ document, onCancel, onSaved }) => {
  const isSaving = useDocumentsStore((state) => state.isSaving);
  const error = useDocumentsStore((state) => state.error);
  const updateDocument = useDocumentsStore((state) => state.updateDocument);
  const clearError = useDocumentsStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const vehicles = useVehiclesStore((state) => state.vehicles);
  const drivers = useDriversStore((state) => state.drivers);
  const maintenanceRecords = useMaintenanceStore((state) => state.maintenanceRecords);
  const trips = useTripsStore((state) => state.trips);
  const fuelRecords = useFuelStore((state) => state.fuelRecords);
  const fileTypes = useDocumentsStore((state) => state.fileTypes);

  const handleValidSubmit = async (values) => {
    clearError();

    const result = await updateDocument(document.id, toDocumentPayload(values));
    if (result.success) {
      toast.success(`Document « ${result.data.name} » mis à jour.`);
      onSaved(result.data.id);
    }
  };

  const { values, errors, setField, handleSubmit } = useZodForm({
    schema: documentEditSchema,
    defaultValues: toDocumentFormValues(document),
    onSubmit: handleValidSubmit,
  });

  return (
    <FormModal
      open
      onClose={onCancel}
      title={`Modifier ${document.name}`}
      subtitle="Seules les métadonnées du document sont modifiables ici."
      icon="bi-pencil-square"
      size="lg"
      onSubmit={handleSubmit}
      submitLabel="Enregistrer les modifications"
      loading={isSaving}
      error={error}
    >
      <DocumentForm
        values={values}
        errors={errors}
        setField={setField}
        companies={companies}
        fileTypes={fileTypes}
        vehicles={vehicles}
        drivers={drivers}
        maintenanceRecords={maintenanceRecords}
        trips={trips}
        fuelRecords={fuelRecords}
        editMode
      />
    </FormModal>
  );
};

const DocumentEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedDocument = useDocumentsStore((state) => state.selectedDocument);
  const isLoading = useDocumentsStore((state) => state.isLoading);
  const error = useDocumentsStore((state) => state.error);
  const fetchDocument = useDocumentsStore((state) => state.fetchDocument);
  const fetchFileTypes = useDocumentsStore((state) => state.fetchFileTypes);
  const clearError = useDocumentsStore((state) => state.clearError);

  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);
  const fetchDrivers = useDriversStore((state) => state.fetchDrivers);
  const fetchMaintenanceRecords = useMaintenanceStore((state) => state.fetchMaintenanceRecords);
  const fetchTrips = useTripsStore((state) => state.fetchTrips);
  const fetchFuelRecords = useFuelStore((state) => state.fetchFuelRecords);

  useEffect(() => {
    if (id) fetchDocument(id);
    fetchFileTypes();
    fetchCompanies();
    fetchVehicles();
    fetchDrivers();
    fetchMaintenanceRecords();
    fetchTrips();
    fetchFuelRecords();
  }, [
    id,
    fetchDocument,
    fetchFileTypes,
    fetchCompanies,
    fetchVehicles,
    fetchDrivers,
    fetchMaintenanceRecords,
    fetchTrips,
    fetchFuelRecords,
  ]);

  const document = selectedDocument?.id === id ? selectedDocument : null;

  const goBack = () => navigate(documentDetailPath(id));

  return (
    <PageContainer>
      <Helmet>
        <title>{document ? `Modifier ${document.name} — Navix Management` : 'Modifier — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title="Modifier le document"
        subtitle={document ? document.name : undefined}
        icon={DOCUMENT_ICON}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Documents', to: ROUTES.FILES },
          { label: document ? document.name : '…' },
        ]}
      />

      {isLoading && !document ? (
        <LoadingState variant="text" lines={6} label="Chargement du document…" />
      ) : error || !document ? (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error || 'Document introuvable.'}
        </Alert>
      ) : (
        <EditForm
          document={document}
          onCancel={goBack}
          onSaved={(updatedId) => navigate(documentDetailPath(updatedId))}
        />
      )}
    </PageContainer>
  );
};

export default DocumentEditPage;
