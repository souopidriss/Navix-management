/**
 * Navix Companies — CompanyEditPage
 * --------------------------------------------------------------------------
 * Édition d'une entreprise : chargement du détail, pré-remplissage du
 * formulaire, soumission au store (simulé). Redirection vers le détail
 * après succès. États chargement / erreur / introuvable gérés.
 */
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button, Card, Spinner } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES, companyDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '../store';
import CompanyForm from '../components/CompanyForm';
import { toCompanyFormValues, toCompanyPayload } from '../schemas';

const CompanyEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedCompany = useCompaniesStore((state) => state.selectedCompany);
  const companies = useCompaniesStore((state) => state.companies);
  const isLoading = useCompaniesStore((state) => state.isLoading);
  const isSaving = useCompaniesStore((state) => state.isSaving);
  const error = useCompaniesStore((state) => state.error);
  const fetchCompany = useCompaniesStore((state) => state.fetchCompany);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);
  const updateCompany = useCompaniesStore((state) => state.updateCompany);
  const clearError = useCompaniesStore((state) => state.clearError);

  useEffect(() => {
    if (id) fetchCompany(id);
    fetchCompanies();
  }, [id, fetchCompany, fetchCompanies]);

  const company = selectedCompany?.id === id ? selectedCompany : null;

  const handleSubmit = async (values) => {
    if (!id) return;
    clearError();

    const result = await updateCompany(id, toCompanyPayload(values));
    if (result.success) {
      toast.success('Entreprise mise à jour avec succès.');
      navigate(companyDetailPath(id));
    }
  };

  return (
    <PageContainer>
      <Helmet>
        <title>{company ? `Modifier ${company.name} — Navix Management` : 'Modifier l’entreprise — Navix Management'}</title>
      </Helmet>

      <PageHeader
        title={company ? `Modifier ${company.name}` : 'Modifier l’entreprise'}
        icon="bi-buildings"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Entreprises', to: ROUTES.COMPANIES },
          { label: company ? company.name : '…' },
        ]}
      />

      {isLoading && !company ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner size="lg" label="Chargement de l’entreprise…" />
        </div>
      ) : error && !company ? (
        <>
          <Alert variant="danger" closable onClose={clearError} className="mb-3">
            {error}
          </Alert>
          <Button variant="outline" icon="bi-arrow-left" onClick={() => navigate(ROUTES.COMPANIES)}>
            Retour aux entreprises
          </Button>
        </>
      ) : (
        <Card>
          <CompanyForm
            initialValues={toCompanyFormValues(company)}
            editingId={id}
            companies={companies}
            onSubmit={handleSubmit}
            submitLabel="Enregistrer les modifications"
            loading={isSaving}
            error={error}
            onCancel={() => navigate(company ? companyDetailPath(company.id) : ROUTES.COMPANIES)}
          />
        </Card>
      )}
    </PageContainer>
  );
};

export default CompanyEditPage;
