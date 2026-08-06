/**
 * Navix Users — CreateUserPage
 * --------------------------------------------------------------------------
 * Création d'un utilisateur : grille métier (UserForm) embarquée dans le
 * FormModal générique de Core UI, validation exclusive Zod (useUserForm).
 * L'entreprise courante est présélectionnée hors super_admin (simulation
 * multi-tenant). Redirection vers le détail après succès.
 */
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { PageContainer, PageHeader, FormModal, LoadingState } from '@/components/core';
import { ROUTES, userDetailPath } from '@/routes/route.constants';
import { useUserStore, useRoleStore } from '../store';
import { useUserForm, bindCompanyChange, useTenantScope } from '../hooks';
import { UserForm } from '../components';
import { toUserPayload, userDefaultValues } from '../schemas';
import { USERS_ICON } from '../constants';

const CreateUserPage = () => {
  const navigate = useNavigate();

  const isSaving = useUserStore((state) => state.isSaving);
  const error = useUserStore((state) => state.error);
  const createUser = useUserStore((state) => state.createUser);
  const clearError = useUserStore((state) => state.clearError);

  const rolesLoading = useRoleStore((state) => state.isLoading);
  const { scopeCompanyId, companies, agencies, roles } = useTenantScope();

  const handleValidSubmit = async (values) => {
    clearError();

    const result = await createUser(toUserPayload(values));
    if (result.success) {
      toast.success(`Utilisateur « ${result.data.fullName} » créé avec succès.`);
      navigate(userDetailPath(result.data.id));
    }
  };

  const { values, errors, setField, reset, handleSubmit } = useUserForm({ onSubmit: handleValidSubmit });

  useEffect(() => {
    reset({ ...userDefaultValues, companyId: scopeCompanyId || '' });
  }, [scopeCompanyId, reset]);

  const agencyOptions = useMemo(
    () => agencies.filter((agency) => agency.companyId === values.companyId),
    [agencies, values.companyId],
  );

  const handleCompanyChange = bindCompanyChange(setField);

  return (
    <PageContainer>
      <Helmet>
        <title>Nouvel utilisateur — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Nouvel utilisateur"
        subtitle="Créez un compte utilisateur et attribuez-lui un ou plusieurs rôles."
        icon={USERS_ICON}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Utilisateurs', to: ROUTES.USERS },
          { label: 'Nouvel utilisateur' },
        ]}
      />

      {rolesLoading ? (
        <LoadingState variant="text" lines={6} label="Chargement du référentiel…" />
      ) : (
        <FormModal
          open
          onClose={() => navigate(ROUTES.USERS)}
          title="Nouvel utilisateur"
          subtitle="Les champs sont validés avant enregistrement."
          icon={USERS_ICON}
          size="lg"
          onSubmit={handleSubmit}
          submitLabel="Créer l’utilisateur"
          loading={isSaving}
          error={error}
        >
          <UserForm
            values={values}
            errors={errors}
            setField={setField}
            companies={companies}
            agencies={agencyOptions}
            roles={roles}
            onCompanyChange={handleCompanyChange}
          />
        </FormModal>
      )}
    </PageContainer>
  );
};

export default CreateUserPage;
