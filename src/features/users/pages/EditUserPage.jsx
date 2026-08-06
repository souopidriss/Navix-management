/**
 * Navix Users — EditUserPage
 * --------------------------------------------------------------------------
 * Modification d'un utilisateur : grille métier (UserForm) embarquée dans le
 * FormModal générique de Core UI, pré-remplie depuis le store (fetchUser),
 * validation exclusive Zod (useUserForm). Redirection vers le détail après
 * succès.
 */
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { PageContainer, PageHeader, FormModal, LoadingState } from '@/components/core';
import { ROUTES, userDetailPath } from '@/routes/route.constants';
import { useUserStore, useRoleStore } from '../store';
import { useUserForm, bindCompanyChange, useTenantScope } from '../hooks';
import { UserForm } from '../components';
import { toUserPayload, toUserFormValues } from '../schemas';
import { USERS_ICON } from '../constants';

const EditUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isSaving = useUserStore((state) => state.isSaving);
  const isLoading = useUserStore((state) => state.isLoading);
  const error = useUserStore((state) => state.error);
  const selectedUser = useUserStore((state) => state.selectedUser);
  const fetchUser = useUserStore((state) => state.fetchUser);
  const updateUser = useUserStore((state) => state.updateUser);
  const clearError = useUserStore((state) => state.clearError);

  const rolesLoading = useRoleStore((state) => state.isLoading);
  const { companies, agencies, roles } = useTenantScope();

  useEffect(() => {
    if (id) fetchUser(id);
  }, [id, fetchUser]);

  const user = selectedUser?.id === id ? selectedUser : null;

  const handleValidSubmit = async (values) => {
    clearError();

    const result = await updateUser(id, toUserPayload(values));
    if (result.success) {
      toast.success(`Utilisateur « ${result.data.fullName} » mis à jour.`);
      navigate(userDetailPath(result.data.id));
    }
  };

  const { values, errors, setField, reset, handleSubmit } = useUserForm({ user, onSubmit: handleValidSubmit });

  useEffect(() => {
    if (user) reset(toUserFormValues(user));
  }, [user, reset]);

  const agencyOptions = useMemo(
    () => agencies.filter((agency) => agency.companyId === values.companyId),
    [agencies, values.companyId],
  );

  const handleCompanyChange = bindCompanyChange(setField);

  return (
    <PageContainer>
      <Helmet>
        <title>{`Modifier — ${user?.fullName ?? 'Utilisateur'} — Navix Management`}</title>
      </Helmet>

      <PageHeader
        title={user ? `Modifier ${user.fullName}` : 'Modifier l’utilisateur'}
        subtitle="Mettez à jour les informations du compte et ses rôles."
        icon={USERS_ICON}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Utilisateurs', to: ROUTES.USERS },
          { label: user?.fullName ?? '…', to: user ? userDetailPath(user.id) : undefined },
          { label: 'Modifier' },
        ]}
      />

      {isLoading || rolesLoading || !user ? (
        <LoadingState variant="text" lines={6} label="Chargement de l'utilisateur…" />
      ) : (
        <FormModal
          open
          onClose={() => navigate(ROUTES.USERS)}
          title={`Modifier ${user.fullName}`}
          subtitle="Les champs sont validés avant enregistrement."
          icon={USERS_ICON}
          size="lg"
          onSubmit={handleSubmit}
          submitLabel="Enregistrer les modifications"
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

export default EditUserPage;
