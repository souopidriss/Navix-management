/**
 * Navix Companies — CompanyCreatePage
 * --------------------------------------------------------------------------
 * Création d'une entreprise : formulaire validé par Zod (useZodForm), soumis
 * au store (simulé). Redirection vers la liste après succès.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES } from '@/routes/route.constants';
import { useCompaniesStore } from '../store';
import CompanyForm from '../components/CompanyForm';
import { toCompanyPayload } from '../schemas';

const CompanyCreatePage = () => {
  const navigate = useNavigate();

  const companies = useCompaniesStore((state) => state.companies);
  const isSaving = useCompaniesStore((state) => state.isSaving);
  const error = useCompaniesStore((state) => state.error);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);
  const createCompany = useCompaniesStore((state) => state.createCompany);
  const clearError = useCompaniesStore((state) => state.clearError);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSubmit = async (values) => {
    clearError();
    const payload = {
      ...toCompanyPayload(values),
      vehicleCount: 0,
      driverCount: 0,
      agencyCount: 0,
    };

    const result = await createCompany(payload);
    if (result.success) {
      toast.success('Entreprise créée avec succès.');
      navigate(ROUTES.COMPANIES);
    }
  };

  return (
    <PageContainer>
      <Helmet>
        <title>Nouvelle entreprise — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Nouvelle entreprise"
        subtitle="Créez une entreprise cliente de la plateforme."
        icon="bi-buildings"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Entreprises', to: ROUTES.COMPANIES },
          { label: 'Nouvelle' },
        ]}
      />

      <Card>
        <CompanyForm
          companies={companies}
          onSubmit={handleSubmit}
          submitLabel="Créer l’entreprise"
          loading={isSaving}
          error={error}
          onCancel={() => navigate(ROUTES.COMPANIES)}
        />
      </Card>
    </PageContainer>
  );
};

export default CompanyCreatePage;
