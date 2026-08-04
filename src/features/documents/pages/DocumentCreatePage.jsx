/**
 * Navix Documents — DocumentCreatePage
 * --------------------------------------------------------------------------
 * Téléversement de documents : grille métier (DocumentForm) embarquée dans
 * le FormModal générique, validation exclusive Zod (useZodForm) puis appel
 * de `uploadDocuments` (progression simulée par fichier, annulation
 * possible). Redirection vers la liste après succès.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { PageContainer, PageHeader, FormModal } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
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
  createDocumentSchema,
  documentDefaultValues,
  toDocumentPayload,
} from '../schemas';
import { DOCUMENT_ICON } from '../constants';

const DocumentCreatePage = () => {
  const navigate = useNavigate();

  const isUploading = useDocumentsStore((state) => state.isUploading);
  const error = useDocumentsStore((state) => state.error);
  const uploadProgress = useDocumentsStore((state) => state.uploadProgress);
  const uploadDocuments = useDocumentsStore((state) => state.uploadDocuments);
  const clearError = useDocumentsStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);
  const vehicles = useVehiclesStore((state) => state.vehicles);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);
  const drivers = useDriversStore((state) => state.drivers);
  const fetchDrivers = useDriversStore((state) => state.fetchDrivers);
  const maintenanceRecords = useMaintenanceStore((state) => state.maintenanceRecords);
  const fetchMaintenanceRecords = useMaintenanceStore((state) => state.fetchMaintenanceRecords);
  const trips = useTripsStore((state) => state.trips);
  const fetchTrips = useTripsStore((state) => state.fetchTrips);
  const fuelRecords = useFuelStore((state) => state.fuelRecords);
  const fetchFuelRecords = useFuelStore((state) => state.fetchFuelRecords);
  const fileTypes = useDocumentsStore((state) => state.fileTypes);
  const fetchFileTypes = useDocumentsStore((state) => state.fetchFileTypes);

  useEffect(() => {
    fetchCompanies();
    fetchVehicles();
    fetchDrivers();
    fetchMaintenanceRecords();
    fetchTrips();
    fetchFuelRecords();
    fetchFileTypes();
  }, [
    fetchCompanies,
    fetchVehicles,
    fetchDrivers,
    fetchMaintenanceRecords,
    fetchTrips,
    fetchFuelRecords,
    fetchFileTypes,
  ]);

  const handleValidSubmit = async (values) => {
    clearError();

    const result = await uploadDocuments(values.files, toDocumentPayload(values));
    if (result.success) {
      const count = result.data?.length ?? 0;
      toast.success(
        `${count} fichier${count > 1 ? 's' : ''} téléversé${count > 1 ? 's' : ''} avec succès.`,
      );
      navigate(ROUTES.FILES);
    }
  };

  const { values, errors, setField, handleSubmit } = useZodForm({
    schema: createDocumentSchema(fileTypes),
    defaultValues: documentDefaultValues,
    onSubmit: handleValidSubmit,
  });

  return (
    <PageContainer>
      <Helmet>
        <title>Téléverser des documents — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Téléverser des documents"
        subtitle="Ajoutez un ou plusieurs fichiers à votre bibliothèque documentaire."
        icon={DOCUMENT_ICON}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Documents', to: ROUTES.FILES },
          { label: 'Téléverser' },
        ]}
      />

      <FormModal
        open
        onClose={() => navigate(ROUTES.FILES)}
        title="Téléverser des documents"
        subtitle="Les fichiers sont validés selon le type sélectionné avant envoi."
        icon="bi-cloud-arrow-up"
        size="lg"
        onSubmit={handleSubmit}
        submitLabel="Téléverser"
        submitIcon="bi-cloud-arrow-up"
        loading={isUploading}
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
        />

        {isUploading && uploadProgress.index >= 0 && (
          <div className="mt-3" aria-label="Progression du téléversement">
            <div className="d-flex justify-content-between mb-1 small text-secondary">
              <span>
                Fichier {uploadProgress.index + 1} / {values.files.length}
              </span>
              <span>{uploadProgress.percent}%</span>
            </div>
            <div className="progress" role="progressbar" aria-valuenow={uploadProgress.percent} aria-valuemin="0" aria-valuemax="100">
              <div
                className="progress-bar progress-bar-striped progress-bar-animated"
                style={{ width: `${uploadProgress.percent}%` }}
              />
            </div>
          </div>
        )}
      </FormModal>
    </PageContainer>
  );
};

export default DocumentCreatePage;
